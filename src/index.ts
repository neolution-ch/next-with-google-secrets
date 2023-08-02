import { SecretManagerServiceClient, protos } from "@google-cloud/secret-manager";

/**
 * Definition of filter function
 */
type FilterFunction = (name: string) => boolean;

/**
 * Definition of possible options for the module
 */
type WithGoogleSecretsOptions = {
  /**
   *
   */
  projectName: string;
  /**
   *
   */
  mapping: Record<string, string | string[]>;
  /**
   *
   */
  filter?: string | FilterFunction;
  /**
   *
   */
  version?: string;
  /**
   *
   */
  nextConfig: object;
};

/**
 * Definition of the config
 */
type Config = {
  [key: string]: string | Config;
};

/**
 * Checks if the data is a secret payload
 * @param data the possible secret payload
 * @returns True if it is a secret payload
 */
function isSecretPayload(data: Uint8Array | string | null | undefined): data is Uint8Array {
  return data !== null;
}

/**
 * Checks if object is config
 * @param config the possible config object
 * @returns True if it is a config object
 */
function isConfig(config: Config | string): config is Config {
  return config !== null;
}

/**
 * Gets the short name of a secret from the long name
 * @param name The long name
 * @returns The short name
 */
function getSecretName(name: string | undefined | null): string {
  if (!name || !name?.length) return "";
  const splits = name.split("/");
  return splits[splits.length - 1];
}

/**
 * Sets a specific config value based on the path
 * @param config The config object
 * @param path The path
 * @param value The value to set
 * @param subPath The sub path
 */
function setConfigurationValue(config: Config, path: string, value: string, subPath?: string): void {
  const pathSplit = (subPath ?? path).split(/\.|__/);
  const [currentName] = pathSplit;
  if (pathSplit.length > 1) {
    if (typeof config[currentName] !== "object") config[currentName] = {};
    if (isConfig(config[currentName])) {
      setConfigurationValue(config[currentName] as Config, path, value, pathSplit.filter((_, i) => i > 0).join("."));
    } else {
      console.warn("couldn't override following config:", path);
    }
  } else if (pathSplit.length == 1) {
    config[currentName] = value;
    console.log("overritten config with gcp secret:", path);
  } else {
    console.warn("couldn't override following config:", path);
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
module.exports = async (options: WithGoogleSecretsOptions) => {
  const {
    /**
     * The gcp project name
     */
    projectName,
    /**
     * The filter (either string for gcp label or function)
     */
    filter,
    /**
     * The mapping from secret to config path (with __ or .)
     */
    mapping,
    /**
     * The google secret version (default "latest")
     */
    version = "latest",
    /**
     * The next config
     */
    nextConfig = {},
  } = options;
  const googleSecretConfigs = {};
  const secretmanagerClient = new SecretManagerServiceClient();

  const iterable = await secretmanagerClient.listSecrets({
    /**
     * The project name in gcp
     */
    parent: projectName,
    /**
     * If filter is a string, pass it to gcp
     */ filter: typeof filter === "string" ? filter : undefined,
  });

  await iterateSecrets(iterable, async (_, name) => {
    const secretName = getSecretName(name);
    const secretMappings = mapping[secretName];
    if (secretMappings == undefined || (typeof filter === "function" && !filter(secretName))) return;

    const value = await secretmanagerClient.accessSecretVersion({
      /**
       * The combined version string
       */
      name: `${name}/versions/${version}`,
    });

    if (isSecretPayload(value[0]?.payload?.data)) {
      for (const secretMapping of Array.isArray(secretMappings) ? secretMappings : [secretMappings]) {
        setConfigurationValue(googleSecretConfigs, secretMapping, new TextDecoder().decode(value[0]?.payload?.data));
      }
    }
  });

  return Object.assign({}, nextConfig, googleSecretConfigs);
};
