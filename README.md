# Configure your Node.js Applications with Google Secrets

## Introduction

`@neolution-ch/next-with-google-secrets` starts your next application with predefined mapped google secrets in the config.

## Options

| Name        | Required           | Description                                                                                                                                                                                                                                                   | Default                  |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| projectName | :heavy_check_mark: | Specifies which project the secrets are read from.                                                                                                                                                                                                            | `null`                   |
| mapping     | :heavy_check_mark: | Records<string, string> to map the secrets to configuration keys                                                                                                                                                                                              | `null`                   |
| filter      | ❌                 | A server side filter forwarded to the google api according to <https://cloud.google.com/secret-manager/docs/filtering>                                                                                                                                        | `null`                   |
| filterFn    | ❌                 | A filter function that will be run after the secrets are read from google (client side filtering). Supplies the `Google.Cloud.SecretManager.V1.Secret` as parameter and the name. If returned true the secret will be processed otherwise it will be ignored. | `{secret, name} => true` |
| versions    | ❌                 | By default the latest version of each secret is taken. But you can specify a specific version in the form of a records. Key is the secret id and value is the version to take. For example: `{MySecretId: "2"}`                                               | `null`                   |

## Quick Start

```shell
npm install @neolution-ch/next-with-google-secrets
```

or

```shell
yarn add @neolution-ch/next-with-google-secrets
```

then use the available function in your `next.config.js` like this:

```typescript
...
const { withGoogleSecrets } = require("@neolution-ch/next-with-google-secrets");
...
module.export = () =>
    withGoogleSecrets({
        projectName: "projects/your-gcp-project-name",
        mapping: { YourSecretName: "serverRuntimeConfig__yourConfigKeyYouWantToOverwrite", }
        nextConfig: YourCurrentNextConfiguration....
    });
```

now if you configured everything correctly, you will see this output log in your console:

```shell
WithGoogleSecrets - overritten config with gcp secret: serverRuntimeConfig__yourConfigKeyYouWantToOverwrite
```
