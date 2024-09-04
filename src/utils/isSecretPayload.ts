/**
 * Checks if the provided data is a secret payload.
 * @param data - The data to be checked.
 * @returns - True if the data is a Uint8Array, false otherwise.
 */
export function isSecretPayload(data: Uint8Array | string | null | undefined): data is Uint8Array {
  return !!data;
}
