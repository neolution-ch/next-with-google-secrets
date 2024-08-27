import { NextConfig } from "next";
import { FilterFunction } from "./FilterFunction";

/**
 * Definition of possible options for the module
 */
export type WithGoogleSecretsOptions = {
  /**
   * The project name in google could to load the secrets from
   */
  projectName: string;

  /**
   * A mapping to define which secret should overwritte which config entry (secretName, configEntry(ies))
   */
  mapping?: Record<string, string | string[]>;

  /**
   * A server side filter forwarded to the google api according to https://cloud.google.com/secret-manager/docs/filtering
   */
  filter?: string;

  /**
   * The filter function that gets called for every sercret before loading the value, this filter is used by the application and not by google directly, so the secrets are still loaded, just not their values.
   */
  filterFn?: FilterFunction;

  /**
   * The version for every secret that should be taken, default is latest
   */
  versions?: Record<string, string>;

  /**
   * The current next config that will be extended
   */
  nextConfig: NextConfig;

  /**
   * Determs if the google secrets should be loaded or not (default = true)
   */
  enabled?: boolean;

  /**
   * Determs if the application should continue on error or throw an exception (default = false)
   */
  continueOnError?: boolean;
};
