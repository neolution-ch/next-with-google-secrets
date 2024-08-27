import { Config } from "../types/Config";

/**
 *
 * @param config
 */

export function isConfig(config: Config | string): config is Config {
  return config !== null;
}
