/**
 * Get the secret name.
 * @param name - The name of the secret.
 * @returns The secret name.
 */
export function getSecretName(name: string | undefined | null): string {
  if (!name || !name?.length) return "";
  const splits = name.split("/");
  return splits[splits.length - 1];
}
