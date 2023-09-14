import { SecretManagerServiceClient, protos } from "@google-cloud/secret-manager";
import type { NextConfig } from "next";

/**
 * Filter function to filter secrets by name that dont have to be loaded
 */
type FilterFunction = (params: {
  /**
   * The name of the secret (without the path)
   */
  name: string;

  /**
   * The secret itself
   */
  secret: protos.google.cloud.secretmanager.v1.ISecret;
}) => boolean;

/**
 * Definition of possible options for the module
 */
type WithGoogleSecretsOptions = {
  /**
   * The project name in google could to load the secrets from
   */
  projectName: string;

  /**
   * A mapping to define which secret should overwritte which config entry (secretName, configEntry(ies))
   */
  mapping: Record<string, string | string[]>;

  /**
   * A server side filter forwarded to the google api according to https://cloud.google.com/secret-manager/docs/filtering
   */
  filter?: string;

  /**
   * The filter function that gets called for every sercret before loading the value, this filter is used by the application and not by google directly, so the secrets are still loaded, just not their values.
   */
  filterFn?: FilterFunction;

  /**
   * The version for every secret that should be taken, default is latest
   */
  versions?: Record<string, string>;

  /**
   * The current next config that will be extended
   */
  nextConfig: NextConfig;

  /**
   * Determs if the google secrets should be loaded or not (default = true)
   */
  enabled?: boolean;
};

type Config = {
  [key: string]: string | Config;
};

function isSecretPayload(data: Uint8Array | string | null | undefined): data is Uint8Array {
  return !!data;
}

function isConfig(config: Config | string): config is Config {
  return config !== null;
}

function getSecretName(name: string | undefined | null): string {
  if (!name || !name?.length) return "";
  const splits = name.split("/");
  return splits[splits.length - 1];
}

function setConfigurationValue(config: Config, path: string, value: string, subPath?: string): void {
  const pathSplit = (subPath ?? path).split(/\.|__/);
  const [currentName] = pathSplit;
  if (pathSplit.length > 1) {
    if (typeof config[currentName] !== "object") config[currentName] = {};
    if (isConfig(config[currentName])) {
      setConfigurationValue(config[currentName] as Config, path, value, pathSplit.filter((_, i) => i > 0).join("."));
    } else {
      console.warn("WithGoogleSecrets - couldn't override following config:", path);
    }
  } else if (pathSplit.length == 1) {
    config[currentName] = value;
    console.log("WithGoogleSecrets - overritten config with gcp secret:", path);
  } else {
    console.warn("WithGoogleSecrets - couldn't override following config:", path);
  }
}

/**
 * Iterates through the secrets
 * @param secrets The iterable secrets
 * @param action The action that will be performed for every secret
 */
async function iterateSecrets(
  secrets: [
    protos.google.cloud.secretmanager.v1.ISecret[],
    protos.google.cloud.secretmanager.v1.IListSecretsRequest | null,
    protos.google.cloud.secretmanager.v1.IListSecretsResponse,
  ],
  action: (secret: protos.google.cloud.secretmanager.v1.ISecret, name: string) => Promise<void>,
) {
  for await (const response of secrets) {
    if (response == null || !Array.isArray(response)) continue;
    for await (const secret of response) {
      if (!secret || !secret.name) continue;
      await action(secret, secret.name);
    }
  }
}

/**
 * The module "withGoogleSecrets"
 * @param options The options
 * @returns The updated next config
 */
const withGoogleSecrets = async (options: WithGoogleSecretsOptions) => {
  const { projectName, filter, filterFn, mapping, versions = {}, nextConfig = {}, enabled = true } = options;

  if (!enabled) {
    return nextConfig;
  }

  const newNextConfig = { ...nextConfig };
  const secretmanagerClient = new SecretManagerServiceClient();

  const iterable = await secretmanagerClient.listSecrets({ parent: projectName, filter: typeof filter === "string" ? filter : undefined });

  await iterateSecrets(iterable, async (secret, name) => {
    const secretName = getSecretName(name);
    const secretMappings = mapping[secretName];
    if (secretMappings == undefined || (filterFn && !filterFn({ name: secretName, secret }))) return;

    const value = await secretmanagerClient.accessSecretVersion({ name: `${name}/versions/${versions[secretName] ?? "latest"}` });

    if (isSecretPayload(value[0]?.payload?.data)) {
      for (const secretMapping of Array.isArray(secretMappings) ? secretMappings : [secretMappings]) {
        setConfigurationValue(newNextConfig, secretMapping, new TextDecoder().decode(value[0]?.payload?.data));
      }
    }
  });

  return newNextConfig;
};

export { withGoogleSecrets };
