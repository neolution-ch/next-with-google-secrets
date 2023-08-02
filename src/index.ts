import { SecretManagerServiceClient, protos } from "@google-cloud/secret-manager";

/**
 * Filter function to filter secrets by name that dont have to be loaded
 */
type FilterFunction = (name: string) => boolean;

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
   * The filter to either filter directly by labels (string) or by a function
   */
  filter?: string | FilterFunction;

  /**
   * The version of secret that should be taken, default is latest
   */
  version?: string;

  /**
   * The current next config that will be extended
   */
  nextConfig: object;
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
  const { projectName, filter, mapping, version = "latest", nextConfig = {} } = options;
  const newNextConfig = { ...nextConfig };
  const secretmanagerClient = new SecretManagerServiceClient();

  const iterable = await secretmanagerClient.listSecrets({ parent: projectName, filter: typeof filter === "string" ? filter : undefined });

  await iterateSecrets(iterable, async (_, name) => {
    const secretName = getSecretName(name);
    const secretMappings = mapping[secretName];
    if (secretMappings == undefined || (typeof filter === "function" && !filter(secretName))) return;

    const value = await secretmanagerClient.accessSecretVersion({ name: `${name}/versions/${version}` });

    if (isSecretPayload(value[0]?.payload?.data)) {
      for (const secretMapping of Array.isArray(secretMappings) ? secretMappings : [secretMappings]) {
        setConfigurationValue(newNextConfig, secretMapping, new TextDecoder().decode(value[0]?.payload?.data));
      }
    }
  });

  return newNextConfig;
};

export { withGoogleSecrets };
