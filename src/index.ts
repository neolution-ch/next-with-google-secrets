import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { setConfigurationValue } from "./utils/setConfigurationValue";
import { isSecretPayload } from "./utils/isSecretPayload";
import { getSecretName } from "./utils/getSecretName";
import { getGoogleSecretSyntaxKeyValues } from "./utils/getGoogleSecretSyntaxKeyValues";
import { iterateSecrets } from "./utils/iterateSecrets";
import { WithGoogleSecretsOptions } from "./types/WithGoogleSecretsOptions";

/**
 * The module "withGoogleSecrets"
 * @param options The options
 * @returns The updated next config
 */
const withGoogleSecrets = async (options: WithGoogleSecretsOptions) => {
  const { projectName, filter, filterFn, mapping, versions = {}, nextConfig = {}, enabled = true, continueOnError = false } = options;

  if (!enabled) {
    return nextConfig;
  }

  const newNextConfig = { ...nextConfig };
  try {
    const secretmanagerClient = new SecretManagerServiceClient();
    const projectPath = projectName.startsWith("projects/") ? projectName : `projects/${projectName}`;

    console.log("WithGoogleSecrets - loading secrets from project:", projectPath);

    const iterable = await secretmanagerClient.listSecrets({
      parent: projectPath,
      filter: typeof filter === "string" ? filter : undefined,
    });

    const googleSecretSyntaxKeyValues = await getGoogleSecretSyntaxKeyValues(newNextConfig);

    await iterateSecrets(iterable, async (secret, name) => {
      const hasMapping = !!mapping;
      const secretName = getSecretName(name);
      const secretMappings = hasMapping ? mapping[secretName] : undefined;
      const secretHasMappings = !!secretMappings;
      const secretPassesFilter = !filterFn || filterFn({ name: secretName, secret });
      const secretHasGoogleSecretSyntax = googleSecretSyntaxKeyValues.some((x) => x.secretName === secretName);

      if (!secretPassesFilter) {
        return;
      }

      if (secretHasMappings) {
        const value = await secretmanagerClient.accessSecretVersion({ name: `${name}/versions/${versions[secretName] ?? "latest"}` });

        if (isSecretPayload(value[0]?.payload?.data)) {
          for (const secretMapping of Array.isArray(secretMappings) ? secretMappings : [secretMappings]) {
            setConfigurationValue(newNextConfig, secretMapping, new TextDecoder().decode(value[0]?.payload?.data));
          }
        }
      }

      if (secretHasGoogleSecretSyntax) {
        const matchingKeyValues = googleSecretSyntaxKeyValues.filter((keyValue) => keyValue.secretName === secretName);
        for (const keyValue of matchingKeyValues) {
          const value = await secretmanagerClient.accessSecretVersion({
            name: `${name}/versions/${keyValue.secretVersion}`,
          });

          if (isSecretPayload(value[0]?.payload?.data)) {
            setConfigurationValue(newNextConfig, keyValue.path, new TextDecoder().decode(value[0]?.payload?.data));
          }
        }
      }
    });
  } catch (ex) {
    if (!continueOnError) {
      throw ex;
    } else {
      console.error("WithGoogleSecrets - error loading secrets:", ex);
    }
  }

  return newNextConfig;
};

export { withGoogleSecrets };
