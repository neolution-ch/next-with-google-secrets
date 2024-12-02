# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### dependabot: \#41 Bump the npm-ecosystem group across 1 directory with 29 updates

## [0.4.0] - 2024-09-25

### Added

- Added log message to indicate from which project the secrets are loaded

## [0.3.0] - 2024-09-23

### Added

Added support for the `{GoogleSecret:SecretName:SecretVersion}` syntax. The `SecretVersion` is optional and defaults to `latest`. This allows for a more flexible way to access secrets so not all `config.{environment}.json` files need to load the same secrets.

### dependabot: \#22 Bump the github-actions group with 4 updates

### dependabot: \#15 Bump micromatch from 4.0.5 to 4.0.8

### dependabot: \#16 Bump next from 13.4.12 to 14.1.1

### dependabot: \#7 Bump @babel/traverse from 7.22.8 to 7.23.2

### dependabot: \#9 Bump tj-actions/changed-files from 37 to 41 in /.github/workflows

## [0.2.1] - 2024-04-23

### Fixed

- added `dist` folder to `exports` in `package.json`

## [0.2.0] - 2023-10-16

### Added

- added new parameter `continueOnError` to determ if the application should continue on error or throw an exception (default = false)

## [0.1.0] - 2023-09-14

### Fixed

- changed location of index.d.ts file

### Added

- Added typing for the next config
- added new parameter `enabled` to determ if google secrets should be loaded or not

### Changed

- changed `projects/`-part of the project name to optional

## [0.0.1] - 2023-08-03

### Added

- added project setup

[unreleased]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.4.0...HEAD
[0.4.0]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/neolution-ch/next-with-google-secrets/compare/0.0.1...0.1.0
[0.0.1]: https://github.com/neolution-ch/next-with-google-secrets/releases/tag/0.0.1
