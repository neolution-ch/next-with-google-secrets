import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import jsdocPlugin from "eslint-plugin-jsdoc";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "rollup.config.mjs"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "tsconfig.eslint.json",
        ecmaVersion: 2018,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        TextDecoder: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      jest: jestPlugin,
      jsdoc: jsdocPlugin,
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["tsconfig.eslint.json"],
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...tseslint.configs["eslint-recommended"].rules,
      ...tseslint.configs["recommended"].rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,
      ...jsdocPlugin.configs["flat/recommended-typescript"].rules,
      ...prettierConfig.rules,

      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
        },
      ],
      "prefer-template": "error",
      "max-lines": [
        "error",
        {
          max: 200,
        },
      ],
      complexity: [
        "error",
        {
          max: 12,
        },
      ],
      "prefer-destructuring": "error",
      "no-empty-function": "error",
      "arrow-body-style": ["error", "as-needed"],

      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
          contexts: [
            "ArrowFunctionExpression",
            "FunctionDeclaration",
            "FunctionExpression",
            "MethodDefinition",
            "Property",
            "TSDeclareFunction",
            "TSEnumDeclaration",
            "TSInterfaceDeclaration",
            "TSMethodSignature",
            "TSPropertySignature",
            "TSTypeAliasDeclaration",
          ],
          checkGetters: true,
        },
      ],
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
];
