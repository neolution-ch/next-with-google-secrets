import { isConfig } from "./isConfig";
import { Config } from "../types/Config";

/**
 * Set the value of a configuration property.
 * @param config - The configuration object.
 * @param path - The path to the property.
 * @param value - The value to set.
 * @param [subPath] - The sub-path within the property.
 */
export function setConfigurationValue(config: Config, path: string, value: string, subPath?: string): void {
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
