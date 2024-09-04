import { Config } from "../types/Config";

/**
 * Retrieves the key values for Google secret syntax from the given config.
 * @param config - The configuration object.
 * @returns - An array of key values.
 */
export const getGoogleSecretSyntaxKeyValues = async (config: Config) => {
  const keyValues: Array<{
    secretName: string;
    secretVersion: string;
    path: string;
  }> = [];
  const regex = /{GoogleSecret:([^:}]+)(?::([^}]+))?}/g;
  const replaceSecrets = async (config: Config, path: string) => {
    for (const key in config) {
      const value = config[key];
      if (typeof value === "object") {
        if (typeof config[key] === "object" && config[key] !== null) {
          await replaceSecrets(config[key] as Config, `${path}__${key}`);
        }
      } else if (typeof value === "string") {
        const matches = value.matchAll(regex);
        for (const match of matches) {
          const [, secretName, secretVersion = "latest"] = match;
          keyValues.push({
            secretName: secretName,
            secretVersion: secretVersion,
            path: `${path}__${key}`,
          });
        }
      }
    }
  };
  await replaceSecrets(config.serverRuntimeConfig as Config, "serverRuntimeConfig");
  await replaceSecrets(config.publicRuntimeConfig as Config, "publicRuntimeConfig");

  return keyValues;
};
