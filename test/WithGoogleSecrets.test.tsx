import { withGoogleSecrets } from "../src/index";
import { SecretManagerServiceClient, protos } from "@google-cloud/secret-manager";

beforeAll(() => {
  jest.spyOn(SecretManagerServiceClient.prototype, "listSecrets").mockImplementation(({ parent, filter }) => {
    if (parent !== "testProject" || filter !== "testFilter") return [];
    const fakeSecrets: Array<protos.google.cloud.secretmanager.v1.ISecret> = [
      {
        name: "testProject/1111/abc/1234/test1",
      },
      {
        name: "testProject/1111/def/5678/test2",
      },
    ];
    return [fakeSecrets];
  });
  jest.spyOn(SecretManagerServiceClient.prototype, "accessSecretVersion").mockImplementation(({ name }) => {
    switch (name) {
      case "testProject/1111/abc/1234/test1/versions/testVersion":
        return [{ payload: { data: new TextEncoder().encode("test1Value") } }];
      case "testProject/1111/def/5678/test2/versions/testVersion":
        return [{ payload: { data: new TextEncoder().encode("test2Value") } }];
      default:
        return [];
    }
  });
});

describe("WithGoogleSecrets", () => {
  it("load google secrets", async () => {
    var newConfig = await withGoogleSecrets({
      projectName: "testProject",
      filter: "testFilter",
      version: "testVersion",
      mapping: {
        test1: "serverRuntimeConfig__testOverwritten1",
        test2: ["serverRuntimeConfig.testOverwritten2", "serverRuntimeConfig__testOverwritten3"],
      },
      nextConfig: {
        serverRuntimeConfig: {
          testOverwritten1: "testOverwritten1",
          testOverwritten2: "testOverwritten2",
          testOverwritten3: "testOverwritten3",
          testNotOverwritten1: "testNotOverwritten1",
        },
        testNotOverwritten2: "testNotOverwritten2",
      },
    });
    expect(newConfig).toStrictEqual({
      serverRuntimeConfig: {
        testOverwritten1: "test1Value",
        testOverwritten2: "test2Value",
        testOverwritten3: "test2Value",
        testNotOverwritten1: "testNotOverwritten1",
      },
      testNotOverwritten2: "testNotOverwritten2",
    });
  });
});