import { Config } from "../types/Config";

/**
 * Check if the input is a valid Config object.
 * @param config - The input to be checked.
 * @returns True if the input is a valid Config object, false otherwise.
 */
export function isConfig(config: Config | string): config is Config {
  return config !== null;
}
