# Configure your Node.js Applications with Google Secrets

## Introduction

`@neolution-ch/next-with-google-secrets` starts your next application with predefined mapped google secrets in the config.

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
