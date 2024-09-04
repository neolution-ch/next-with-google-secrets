import { protos } from "@google-cloud/secret-manager";

/**
 * Iterates through the secrets
 * @param secrets The iterable secrets
 * @param action The action that will be performed for every secret
 */
export async function iterateSecrets(
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
