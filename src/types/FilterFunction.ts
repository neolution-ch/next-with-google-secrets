import { protos } from "@google-cloud/secret-manager";

/**
 * Filter function to filter secrets by name that dont have to be loaded
 */
export type FilterFunction = (params: {
  /**
   * The name of the secret (without the path)
   */
  name: string;

  /**
   * The secret itself
   */
  secret: protos.google.cloud.secretmanager.v1.ISecret;
}) => boolean;
