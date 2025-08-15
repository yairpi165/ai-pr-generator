# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2025-08-15)


### ⚠ BREAKING CHANGES

* Marking stable release milestone

### Features

* Add configuration management features ([448c6f1](https://github.com/yairpi165/ai-pr-generator/commit/448c6f1918e05acfdec147bb052128a7ea0d1746))
* add ESLint unused imports detection ([3a10f75](https://github.com/yairpi165/ai-pr-generator/commit/3a10f758c5f92b0a4d21008d0a0b06e253474007))
* Add explanation inputs for gemini prompt ([74fc39b](https://github.com/yairpi165/ai-pr-generator/commit/74fc39beae1257d39600a55ba90e6b406c97c1cf))
* add installation script and alias setup for AI PR Generator ([4ab723a](https://github.com/yairpi165/ai-pr-generator/commit/4ab723a105bd09f73d069be991e35772f8a72045))
* add installation script and alias setup for AI PR Generator ([a5d561f](https://github.com/yairpi165/ai-pr-generator/commit/a5d561f989aa6e820ecbfc5333ee4f4237699d97))
* Add NPM publishing step to release workflow ([44503a3](https://github.com/yairpi165/ai-pr-generator/commit/44503a32a14d6f0ce82104427b07d3ca2d1e8eeb))
* Add script to open pull request page in browser ([4250fda](https://github.com/yairpi165/ai-pr-generator/commit/4250fda8d8cb383b2eccf8af5d3807906b1412b5))
* convert project from npm to yarn ([d0c77d8](https://github.com/yairpi165/ai-pr-generator/commit/d0c77d805e164ea81a0cffc03d6438f3d9d11a57))
* Enhance AI Provider Management and Release Workflow ([8c5f919](https://github.com/yairpi165/ai-pr-generator/commit/8c5f9192f532d740fcc9a21d65a03ad13a3b12c1))
* enhance PR generation with optional ticket and explanation inputs ([6c1ded8](https://github.com/yairpi165/ai-pr-generator/commit/6c1ded8d51acc440860338cd7626b2d1933c2720))
* finalize release configuration setup ([87168b9](https://github.com/yairpi165/ai-pr-generator/commit/87168b998229219d65af7e84891c7a2086f35b33))
* Implement get default provider function in ai provider manager ([eaf1222](https://github.com/yairpi165/ai-pr-generator/commit/eaf1222e6ff66be1be6ae1eb780c20f68e1e8624))
* implement provider selection with --provider flag ([4d3d5f1](https://github.com/yairpi165/ai-pr-generator/commit/4d3d5f1c55dcfeb5e105f3d61547e4507ef26089))
* Improve Git tag handling in release workflow ([f909ca4](https://github.com/yairpi165/ai-pr-generator/commit/f909ca4491d77537f8331c04c33352f534d2c779))
* major release with stable API ([8488946](https://github.com/yairpi165/ai-pr-generator/commit/8488946eca4b4b373e9bd02b44d935605851c366))
* Refactor release workflow to streamline versioning process ([4799371](https://github.com/yairpi165/ai-pr-generator/commit/4799371563ce8adc0de1994e319e0d6be27694bd))
* Setup release please for automated releases ([e5e63b7](https://github.com/yairpi165/ai-pr-generator/commit/e5e63b7b66195c4b1f7ce7e374fad6259b475f6d))
* transform project into globally installable npm package ([a10bc91](https://github.com/yairpi165/ai-pr-generator/commit/a10bc916ed1bf7ddcd67eb64460daa5c8a1561fa))
* update release-please configuration and add commitlint ([03bcb62](https://github.com/yairpi165/ai-pr-generator/commit/03bcb629f8048b9cd529652a8bb139bd2159bf97))


### Bug Fixes

* add build verification to prevent broken npm packages ([350cabe](https://github.com/yairpi165/ai-pr-generator/commit/350cabefba0a4816058d48d74a78820bc25b3c75))
* add publishConfig access public for NPM provenance ([2b7e779](https://github.com/yairpi165/ai-pr-generator/commit/2b7e7799cf09abd420bea6a6db5ad3423949927d))
* address remaining PR review issues - add GitHub token to .env.example - update documentation to reflect new src/domain/ architecture - replace npm references with yarn in README.md and QUICK_START.md - remove test directory from ESLint ignores and add proper test configuration - increase coverage threshold from 35% to 60% ([0378e3f](https://github.com/yairpi165/ai-pr-generator/commit/0378e3ff979a8da1067d722f7acf9f07e548b19e))
* change publish workflow to trigger on tag creation ([71670e9](https://github.com/yairpi165/ai-pr-generator/commit/71670e909b756e8ba0a7ac2ea71f4ffde7901bf9))
* change release workflow to manual trigger only ([8dddeb6](https://github.com/yairpi165/ai-pr-generator/commit/8dddeb676aa0362dab67b53ef9225a127d504fed))
* configure release workflow to run automatically on push ([fee29a1](https://github.com/yairpi165/ai-pr-generator/commit/fee29a1759a8680bf02e2951f7d96cc371488366))
* enhance CLI argument parsing for provider selection ([526b8d2](https://github.com/yairpi165/ai-pr-generator/commit/526b8d233705efffdc24e8d83449d44e0c448806))
* Refactor and improve configuration management ([d9a1e80](https://github.com/yairpi165/ai-pr-generator/commit/d9a1e807f8bc3e4fd871ac98db181391e30dd626))
* Remove check build output step from release workflow ([a6d8c88](https://github.com/yairpi165/ai-pr-generator/commit/a6d8c88c131e1e5baed0bfdabd93d7176ffa46f5))
* remove postinstall script that breaks global installation ([8f43d92](https://github.com/yairpi165/ai-pr-generator/commit/8f43d927f9dfc64c3aefa1a3c91ca139bad43e34))
* resolve all TypeScript 'any' type linting issues ([a6141a4](https://github.com/yairpi165/ai-pr-generator/commit/a6141a42dc1e9c875a6d17d8536ad08095923b32))
* resolve genpr command permission and alias issues ([4659874](https://github.com/yairpi165/ai-pr-generator/commit/46598740b09b63e5431c7fb4aa498c6eaa66e2c6))
* restore full interactive UI flow when using --provider flag ([f3de7f8](https://github.com/yairpi165/ai-pr-generator/commit/f3de7f80df3a3b4d4c10e926a1d63976628b82ea))
* restore release-please configuration files ([9fff5b0](https://github.com/yairpi165/ai-pr-generator/commit/9fff5b040bb5704a89ad27d627351f1e5ddb5aa0))
* update CLI test to reflect changes in provider argument handling ([e169219](https://github.com/yairpi165/ai-pr-generator/commit/e169219496da068fc4c448b33b1029e008803ed9))
* Update PR merge check in release workflow to use mergedAt timestamp ([72a7761](https://github.com/yairpi165/ai-pr-generator/commit/72a776129c3f3f1127fb6c8b49db25b6d78aaff2))
* update release workflow ([4fb7725](https://github.com/yairpi165/ai-pr-generator/commit/4fb7725c4133075bf55044fcf6f606b3e240a359))
* update release-please manifest with correct version format ([4c07aac](https://github.com/yairpi165/ai-pr-generator/commit/4c07aacd604930b113419efb402b3fef179831d6))


### Miscellaneous

* **release:** release 1.1.0 ([acdf3e6](https://github.com/yairpi165/ai-pr-generator/commit/acdf3e6b726207873b99f1c7bf73904d871fcce9))
* **release:** release 1.1.0 ([c5bc3ed](https://github.com/yairpi165/ai-pr-generator/commit/c5bc3ed93850622de348d49639829a3c2d640171))
* **release:** release 1.1.0 ([7dbf557](https://github.com/yairpi165/ai-pr-generator/commit/7dbf5579c72b8c822b38101d9bfeb04b5100df80))
* **release:** release 1.1.0 ([1eef0e5](https://github.com/yairpi165/ai-pr-generator/commit/1eef0e584052473a88057740e9bca431e539894c))
* **release:** release 1.2.0 ([113a7ca](https://github.com/yairpi165/ai-pr-generator/commit/113a7cacd729dec9b8a1375ca4d8afb16bdc6a12))
* **release:** release 1.2.0 ([5e1c0be](https://github.com/yairpi165/ai-pr-generator/commit/5e1c0be1133c0d266402edd48fc80404e76fdd65))
* set initial version to 1.0.0 ([fbf76d5](https://github.com/yairpi165/ai-pr-generator/commit/fbf76d55fe7f7b4bf9da19bc5707f2b88c1f2f15))
* Standardize GitHub Actions token usage in release workflow ([6be3c61](https://github.com/yairpi165/ai-pr-generator/commit/6be3c6188d9192f4feecd09a7c44c35bca4409b6))
* Update branch naming convention and add code checkout step in release workflow ([21ba4c0](https://github.com/yairpi165/ai-pr-generator/commit/21ba4c002ec858b028d6797bfcc7fd843d3ed13e))
* Update configuration handling and improve test coverage ([66a45da](https://github.com/yairpi165/ai-pr-generator/commit/66a45da71a0396f3ef013c4da16298ea57022b87))
* Update GitHub Actions token in release workflow ([670257f](https://github.com/yairpi165/ai-pr-generator/commit/670257fb89542f826633e72c6c18c4cb7f6673d1))
* update publish workflow permissions ([a29cf30](https://github.com/yairpi165/ai-pr-generator/commit/a29cf30b48a09fe9d44dacf8fadc0043969c3f9d))
* Update release workflow to prevent Git tag creation during version bump ([d3f8788](https://github.com/yairpi165/ai-pr-generator/commit/d3f8788626bf12e3cc645bc8d506c0a6da530258))
* Update version to 0.0.0 in package files and enhance release workflow descriptions ([84c9144](https://github.com/yairpi165/ai-pr-generator/commit/84c9144876f0fe96b896e0dedae4683716b7a6dc))

## [1.2.0](https://github.com/yairpi165/ai-pr-generator/compare/ai-pr-generator-v1.1.0...ai-pr-generator-v1.2.0) (2025-08-15)


### Features

* finalize release configuration setup ([87168b9](https://github.com/yairpi165/ai-pr-generator/commit/87168b998229219d65af7e84891c7a2086f35b33))


### Bug Fixes

* change publish workflow to trigger on tag creation ([71670e9](https://github.com/yairpi165/ai-pr-generator/commit/71670e909b756e8ba0a7ac2ea71f4ffde7901bf9))
* change release workflow to manual trigger only ([8dddeb6](https://github.com/yairpi165/ai-pr-generator/commit/8dddeb676aa0362dab67b53ef9225a127d504fed))
* configure release workflow to run automatically on push ([fee29a1](https://github.com/yairpi165/ai-pr-generator/commit/fee29a1759a8680bf02e2951f7d96cc371488366))


### Miscellaneous

* **release:** release 1.1.0 ([acdf3e6](https://github.com/yairpi165/ai-pr-generator/commit/acdf3e6b726207873b99f1c7bf73904d871fcce9))
* **release:** release 1.1.0 ([c5bc3ed](https://github.com/yairpi165/ai-pr-generator/commit/c5bc3ed93850622de348d49639829a3c2d640171))

## [1.1.0](https://github.com/yairpi165/ai-pr-generator/compare/ai-pr-generator-v1.0.0...ai-pr-generator-v1.1.0) (2025-08-15)


### Features

* Add configuration management features ([448c6f1](https://github.com/yairpi165/ai-pr-generator/commit/448c6f1918e05acfdec147bb052128a7ea0d1746))
* add ESLint unused imports detection ([3a10f75](https://github.com/yairpi165/ai-pr-generator/commit/3a10f758c5f92b0a4d21008d0a0b06e253474007))
* Add explanation inputs for gemini prompt ([74fc39b](https://github.com/yairpi165/ai-pr-generator/commit/74fc39beae1257d39600a55ba90e6b406c97c1cf))
* add installation script and alias setup for AI PR Generator ([4ab723a](https://github.com/yairpi165/ai-pr-generator/commit/4ab723a105bd09f73d069be991e35772f8a72045))
* add installation script and alias setup for AI PR Generator ([a5d561f](https://github.com/yairpi165/ai-pr-generator/commit/a5d561f989aa6e820ecbfc5333ee4f4237699d97))
* Add NPM publishing step to release workflow ([44503a3](https://github.com/yairpi165/ai-pr-generator/commit/44503a32a14d6f0ce82104427b07d3ca2d1e8eeb))
* Add script to open pull request page in browser ([4250fda](https://github.com/yairpi165/ai-pr-generator/commit/4250fda8d8cb383b2eccf8af5d3807906b1412b5))
* convert project from npm to yarn ([d0c77d8](https://github.com/yairpi165/ai-pr-generator/commit/d0c77d805e164ea81a0cffc03d6438f3d9d11a57))
* Enhance AI Provider Management and Release Workflow ([8c5f919](https://github.com/yairpi165/ai-pr-generator/commit/8c5f9192f532d740fcc9a21d65a03ad13a3b12c1))
* enhance PR generation with optional ticket and explanation inputs ([6c1ded8](https://github.com/yairpi165/ai-pr-generator/commit/6c1ded8d51acc440860338cd7626b2d1933c2720))
* finalize release configuration setup ([87168b9](https://github.com/yairpi165/ai-pr-generator/commit/87168b998229219d65af7e84891c7a2086f35b33))
* Implement get default provider function in ai provider manager ([eaf1222](https://github.com/yairpi165/ai-pr-generator/commit/eaf1222e6ff66be1be6ae1eb780c20f68e1e8624))
* implement provider selection with --provider flag ([4d3d5f1](https://github.com/yairpi165/ai-pr-generator/commit/4d3d5f1c55dcfeb5e105f3d61547e4507ef26089))
* Improve Git tag handling in release workflow ([f909ca4](https://github.com/yairpi165/ai-pr-generator/commit/f909ca4491d77537f8331c04c33352f534d2c779))
* Refactor release workflow to streamline versioning process ([4799371](https://github.com/yairpi165/ai-pr-generator/commit/4799371563ce8adc0de1994e319e0d6be27694bd))
* Setup release please for automated releases ([e5e63b7](https://github.com/yairpi165/ai-pr-generator/commit/e5e63b7b66195c4b1f7ce7e374fad6259b475f6d))
* transform project into globally installable npm package ([a10bc91](https://github.com/yairpi165/ai-pr-generator/commit/a10bc916ed1bf7ddcd67eb64460daa5c8a1561fa))
* update release-please configuration and add commitlint ([03bcb62](https://github.com/yairpi165/ai-pr-generator/commit/03bcb629f8048b9cd529652a8bb139bd2159bf97))


### Bug Fixes

* add build verification to prevent broken npm packages ([350cabe](https://github.com/yairpi165/ai-pr-generator/commit/350cabefba0a4816058d48d74a78820bc25b3c75))
* address remaining PR review issues - add GitHub token to .env.example - update documentation to reflect new src/domain/ architecture - replace npm references with yarn in README.md and QUICK_START.md - remove test directory from ESLint ignores and add proper test configuration - increase coverage threshold from 35% to 60% ([0378e3f](https://github.com/yairpi165/ai-pr-generator/commit/0378e3ff979a8da1067d722f7acf9f07e548b19e))
* change release workflow to manual trigger only ([8dddeb6](https://github.com/yairpi165/ai-pr-generator/commit/8dddeb676aa0362dab67b53ef9225a127d504fed))
* configure release workflow to run automatically on push ([fee29a1](https://github.com/yairpi165/ai-pr-generator/commit/fee29a1759a8680bf02e2951f7d96cc371488366))
* enhance CLI argument parsing for provider selection ([526b8d2](https://github.com/yairpi165/ai-pr-generator/commit/526b8d233705efffdc24e8d83449d44e0c448806))
* Refactor and improve configuration management ([d9a1e80](https://github.com/yairpi165/ai-pr-generator/commit/d9a1e807f8bc3e4fd871ac98db181391e30dd626))
* Remove check build output step from release workflow ([a6d8c88](https://github.com/yairpi165/ai-pr-generator/commit/a6d8c88c131e1e5baed0bfdabd93d7176ffa46f5))
* resolve all TypeScript 'any' type linting issues ([a6141a4](https://github.com/yairpi165/ai-pr-generator/commit/a6141a42dc1e9c875a6d17d8536ad08095923b32))
* resolve genpr command permission and alias issues ([4659874](https://github.com/yairpi165/ai-pr-generator/commit/46598740b09b63e5431c7fb4aa498c6eaa66e2c6))
* restore full interactive UI flow when using --provider flag ([f3de7f8](https://github.com/yairpi165/ai-pr-generator/commit/f3de7f80df3a3b4d4c10e926a1d63976628b82ea))
* restore release-please configuration files ([9fff5b0](https://github.com/yairpi165/ai-pr-generator/commit/9fff5b040bb5704a89ad27d627351f1e5ddb5aa0))
* update CLI test to reflect changes in provider argument handling ([e169219](https://github.com/yairpi165/ai-pr-generator/commit/e169219496da068fc4c448b33b1029e008803ed9))
* Update PR merge check in release workflow to use mergedAt timestamp ([72a7761](https://github.com/yairpi165/ai-pr-generator/commit/72a776129c3f3f1127fb6c8b49db25b6d78aaff2))
* update release workflow ([4fb7725](https://github.com/yairpi165/ai-pr-generator/commit/4fb7725c4133075bf55044fcf6f606b3e240a359))
* update release-please manifest with correct version format ([4c07aac](https://github.com/yairpi165/ai-pr-generator/commit/4c07aacd604930b113419efb402b3fef179831d6))


### Miscellaneous

* **release:** release 1.1.0 ([7dbf557](https://github.com/yairpi165/ai-pr-generator/commit/7dbf5579c72b8c822b38101d9bfeb04b5100df80))
* **release:** release 1.1.0 ([1eef0e5](https://github.com/yairpi165/ai-pr-generator/commit/1eef0e584052473a88057740e9bca431e539894c))
* set initial version to 1.0.0 ([fbf76d5](https://github.com/yairpi165/ai-pr-generator/commit/fbf76d55fe7f7b4bf9da19bc5707f2b88c1f2f15))
* Standardize GitHub Actions token usage in release workflow ([6be3c61](https://github.com/yairpi165/ai-pr-generator/commit/6be3c6188d9192f4feecd09a7c44c35bca4409b6))
* Update branch naming convention and add code checkout step in release workflow ([21ba4c0](https://github.com/yairpi165/ai-pr-generator/commit/21ba4c002ec858b028d6797bfcc7fd843d3ed13e))
* Update configuration handling and improve test coverage ([66a45da](https://github.com/yairpi165/ai-pr-generator/commit/66a45da71a0396f3ef013c4da16298ea57022b87))
* Update GitHub Actions token in release workflow ([670257f](https://github.com/yairpi165/ai-pr-generator/commit/670257fb89542f826633e72c6c18c4cb7f6673d1))
* Update release workflow to prevent Git tag creation during version bump ([d3f8788](https://github.com/yairpi165/ai-pr-generator/commit/d3f8788626bf12e3cc645bc8d506c0a6da530258))
* Update version to 0.0.0 in package files and enhance release workflow descriptions ([84c9144](https://github.com/yairpi165/ai-pr-generator/commit/84c9144876f0fe96b896e0dedae4683716b7a6dc))

## [1.1.0](https://github.com/yairpi165/ai-pr-generator/compare/ai-pr-generator-v1.0.0...ai-pr-generator-v1.1.0) (2025-08-15)


### Features

* Add configuration management features ([448c6f1](https://github.com/yairpi165/ai-pr-generator/commit/448c6f1918e05acfdec147bb052128a7ea0d1746))
* add ESLint unused imports detection ([3a10f75](https://github.com/yairpi165/ai-pr-generator/commit/3a10f758c5f92b0a4d21008d0a0b06e253474007))
* Add explanation inputs for gemini prompt ([74fc39b](https://github.com/yairpi165/ai-pr-generator/commit/74fc39beae1257d39600a55ba90e6b406c97c1cf))
* add installation script and alias setup for AI PR Generator ([4ab723a](https://github.com/yairpi165/ai-pr-generator/commit/4ab723a105bd09f73d069be991e35772f8a72045))
* add installation script and alias setup for AI PR Generator ([a5d561f](https://github.com/yairpi165/ai-pr-generator/commit/a5d561f989aa6e820ecbfc5333ee4f4237699d97))
* Add NPM publishing step to release workflow ([44503a3](https://github.com/yairpi165/ai-pr-generator/commit/44503a32a14d6f0ce82104427b07d3ca2d1e8eeb))
* Add script to open pull request page in browser ([4250fda](https://github.com/yairpi165/ai-pr-generator/commit/4250fda8d8cb383b2eccf8af5d3807906b1412b5))
* convert project from npm to yarn ([d0c77d8](https://github.com/yairpi165/ai-pr-generator/commit/d0c77d805e164ea81a0cffc03d6438f3d9d11a57))
* Enhance AI Provider Management and Release Workflow ([8c5f919](https://github.com/yairpi165/ai-pr-generator/commit/8c5f9192f532d740fcc9a21d65a03ad13a3b12c1))
* enhance PR generation with optional ticket and explanation inputs ([6c1ded8](https://github.com/yairpi165/ai-pr-generator/commit/6c1ded8d51acc440860338cd7626b2d1933c2720))
* Implement get default provider function in ai provider manager ([eaf1222](https://github.com/yairpi165/ai-pr-generator/commit/eaf1222e6ff66be1be6ae1eb780c20f68e1e8624))
* implement provider selection with --provider flag ([4d3d5f1](https://github.com/yairpi165/ai-pr-generator/commit/4d3d5f1c55dcfeb5e105f3d61547e4507ef26089))
* Improve Git tag handling in release workflow ([f909ca4](https://github.com/yairpi165/ai-pr-generator/commit/f909ca4491d77537f8331c04c33352f534d2c779))
* Refactor release workflow to streamline versioning process ([4799371](https://github.com/yairpi165/ai-pr-generator/commit/4799371563ce8adc0de1994e319e0d6be27694bd))
* Setup release please for automated releases ([e5e63b7](https://github.com/yairpi165/ai-pr-generator/commit/e5e63b7b66195c4b1f7ce7e374fad6259b475f6d))
* transform project into globally installable npm package ([a10bc91](https://github.com/yairpi165/ai-pr-generator/commit/a10bc916ed1bf7ddcd67eb64460daa5c8a1561fa))
* update release-please configuration and add commitlint ([03bcb62](https://github.com/yairpi165/ai-pr-generator/commit/03bcb629f8048b9cd529652a8bb139bd2159bf97))


### Bug Fixes

* add build verification to prevent broken npm packages ([350cabe](https://github.com/yairpi165/ai-pr-generator/commit/350cabefba0a4816058d48d74a78820bc25b3c75))
* address remaining PR review issues - add GitHub token to .env.example - update documentation to reflect new src/domain/ architecture - replace npm references with yarn in README.md and QUICK_START.md - remove test directory from ESLint ignores and add proper test configuration - increase coverage threshold from 35% to 60% ([0378e3f](https://github.com/yairpi165/ai-pr-generator/commit/0378e3ff979a8da1067d722f7acf9f07e548b19e))
* enhance CLI argument parsing for provider selection ([526b8d2](https://github.com/yairpi165/ai-pr-generator/commit/526b8d233705efffdc24e8d83449d44e0c448806))
* Refactor and improve configuration management ([d9a1e80](https://github.com/yairpi165/ai-pr-generator/commit/d9a1e807f8bc3e4fd871ac98db181391e30dd626))
* Remove check build output step from release workflow ([a6d8c88](https://github.com/yairpi165/ai-pr-generator/commit/a6d8c88c131e1e5baed0bfdabd93d7176ffa46f5))
* resolve all TypeScript 'any' type linting issues ([a6141a4](https://github.com/yairpi165/ai-pr-generator/commit/a6141a42dc1e9c875a6d17d8536ad08095923b32))
* resolve genpr command permission and alias issues ([4659874](https://github.com/yairpi165/ai-pr-generator/commit/46598740b09b63e5431c7fb4aa498c6eaa66e2c6))
* restore full interactive UI flow when using --provider flag ([f3de7f8](https://github.com/yairpi165/ai-pr-generator/commit/f3de7f80df3a3b4d4c10e926a1d63976628b82ea))
* restore release-please configuration files ([9fff5b0](https://github.com/yairpi165/ai-pr-generator/commit/9fff5b040bb5704a89ad27d627351f1e5ddb5aa0))
* update CLI test to reflect changes in provider argument handling ([e169219](https://github.com/yairpi165/ai-pr-generator/commit/e169219496da068fc4c448b33b1029e008803ed9))
* Update PR merge check in release workflow to use mergedAt timestamp ([72a7761](https://github.com/yairpi165/ai-pr-generator/commit/72a776129c3f3f1127fb6c8b49db25b6d78aaff2))
* update release workflow ([4fb7725](https://github.com/yairpi165/ai-pr-generator/commit/4fb7725c4133075bf55044fcf6f606b3e240a359))
* update release-please manifest with correct version format ([4c07aac](https://github.com/yairpi165/ai-pr-generator/commit/4c07aacd604930b113419efb402b3fef179831d6))


### Miscellaneous

* set initial version to 1.0.0 ([fbf76d5](https://github.com/yairpi165/ai-pr-generator/commit/fbf76d55fe7f7b4bf9da19bc5707f2b88c1f2f15))
* Standardize GitHub Actions token usage in release workflow ([6be3c61](https://github.com/yairpi165/ai-pr-generator/commit/6be3c6188d9192f4feecd09a7c44c35bca4409b6))
* Update branch naming convention and add code checkout step in release workflow ([21ba4c0](https://github.com/yairpi165/ai-pr-generator/commit/21ba4c002ec858b028d6797bfcc7fd843d3ed13e))
* Update configuration handling and improve test coverage ([66a45da](https://github.com/yairpi165/ai-pr-generator/commit/66a45da71a0396f3ef013c4da16298ea57022b87))
* Update GitHub Actions token in release workflow ([670257f](https://github.com/yairpi165/ai-pr-generator/commit/670257fb89542f826633e72c6c18c4cb7f6673d1))
* Update release workflow to prevent Git tag creation during version bump ([d3f8788](https://github.com/yairpi165/ai-pr-generator/commit/d3f8788626bf12e3cc645bc8d506c0a6da530258))
* Update version to 0.0.0 in package files and enhance release workflow descriptions ([84c9144](https://github.com/yairpi165/ai-pr-generator/commit/84c9144876f0fe96b896e0dedae4683716b7a6dc))

## [Unreleased]

### Added
- **GitHub Integration**: Full support for GitHub pull request creation
- **Multi-Provider AI Support**: Support for both OpenAI (GPT-4) and Google Gemini AI providers
- **Interactive CLI**: Beautiful colored terminal interface with arrow key navigation
- **Platform-Agnostic Prompts**: AI prompts now work with any Git hosting platform
- **Comprehensive Test Suite**: 402 tests with 98.57% code coverage
- **ESLint Configuration**: Modern ESLint setup with TypeScript and unused imports detection
- **Domain-Driven Architecture**: Refactored to use clean domain separation (`src/domain/`)
- **Reviewers Configuration**: Support for platform-specific code reviewers
- **Output Options**: Copy to clipboard, open in editor, and direct PR creation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript Support**: Full TypeScript implementation with strict typing

### Changed
- **Architecture Refactor**: Moved from `src/lib/` to `src/domain/` structure
- **Package Manager**: Standardized on npm for better cross-platform compatibility
- **Installation Method**: Replaced `install.sh` script with `genpr init` command for better npm package integration
- **CI Optimization**: Simplified CI to run tests once on Node.js 20 instead of multiple Node.js versions
- **Test Coverage**: Increased coverage threshold to 95% (statements/lines/functions) and 85% (branches)
- **CLI Testing**: Replaced brittle regex-based tests with proper unit testing
- **Documentation**: Updated all documentation to reflect new architecture
- **ESLint Configuration**: Removed duplicate `.eslintrc.json`, standardized on `eslint.config.js`
- **AI Prompts**: Made prompts platform-agnostic (removed Bitbucket-specific references)

### Fixed
- **CLI Installation**: Fixed circular alias issue in `install.sh`
- **Provider Selection**: Fixed `--provider` flag to correctly select AI model
- **Interactive Flow**: Fixed UI to show full interactive prompts when using `--provider`
- **Test Coverage**: Fixed failing tests and improved coverage across all modules
- **ESLint Issues**: Fixed all linting errors and warnings
- **Documentation**: Fixed outdated references to old architecture and npm commands
- **Environment Variables**: Added missing GitHub token to `.env.example`

### Removed
- **Duplicate ESLint Config**: Removed `.eslintrc.json` to prevent conflicts
- **Platform-Specific Prompts**: Removed hardcoded "Bitbucket" references from AI prompts
- **Brittle Tests**: Removed regex-based CLI testing in favor of proper unit tests

## [1.0.0] - 2024-01-XX

### Added
- **Initial Release**: First stable version of AI PR Generator
- **Node.js Implementation**: Complete rewrite from Python to Node.js/TypeScript
- **Core Functionality**: 
  - Git diff generation and analysis
  - AI-powered PR description generation
  - Interactive command-line interface
  - File output and clipboard support
  - Bitbucket integration for PR creation
- **Configuration System**: Environment-based configuration with `.env` support
- **Error Handling**: Comprehensive error handling and user feedback
- **Documentation**: Complete README, quick start guide, and project structure docs

### Technical Details
- **Language**: TypeScript with ES modules
- **Runtime**: Node.js 18+
- **Package Manager**: npm
- **Testing**: Jest with comprehensive test suite
- **Linting**: ESLint with TypeScript and Prettier
- **Coverage**: 98.57% statement coverage, 94.47% branch coverage
- **Architecture**: Domain-driven design with clean separation of concerns

---

## Version History

### Semantic Versioning
- **MAJOR**: Breaking changes in API or CLI interface
- **MINOR**: New features added in backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Release Process
1. **Development**: Features developed on feature branches
2. **Testing**: Comprehensive test suite with high coverage requirements
3. **Code Review**: All changes reviewed via pull requests
4. **Documentation**: README and changelog updated
5. **Release**: Tagged releases with semantic versioning

---

## Contributing

When contributing to this project, please:

1. **Update CHANGELOG.md**: Add entries for any changes that affect users
2. **Follow Semantic Versioning**: Use appropriate version bump based on change type
3. **Update Documentation**: Keep README and other docs current
4. **Maintain Test Coverage**: Ensure new code is properly tested
5. **Follow Code Style**: Use ESLint and Prettier for consistent formatting

### Changelog Entry Format

```markdown
### Added
- New features or capabilities

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in future releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security-related fixes
```
