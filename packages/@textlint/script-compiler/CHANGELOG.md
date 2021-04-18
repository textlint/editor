# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.10.2](https://github.com/textlint/editor/compare/v0.10.1...v0.10.2) (2021-04-18)

**Note:** Version bump only for package @textlint/script-compiler





# [0.10.0](https://github.com/textlint/editor/compare/v0.9.3...v0.10.0) (2021-04-18)


### Bug Fixes

* **script-parser:** fix script banner format ([166694c](https://github.com/textlint/editor/commit/166694cc50853e67631ab07833a525b219f9985c))





## [0.9.3](https://github.com/textlint/editor/compare/v0.9.2...v0.9.3) (2021-04-18)


### Bug Fixes

* rename textlint.js to textlint-worker.js ([d9d2f3f](https://github.com/textlint/editor/commit/d9d2f3f9ab22d4beea73394f0ece805b56ea73f4)), closes [#27](https://github.com/textlint/editor/issues/27)





# [0.9.0](https://github.com/textlint/editor/compare/v0.8.2...v0.9.0) (2021-04-17)


### Bug Fixes

* use @kvs/env ([a72c5b5](https://github.com/textlint/editor/commit/a72c5b54b056f52c25e8d2c295f655759b7dd098))


### Features

* support "ignore" feature ([ef14d33](https://github.com/textlint/editor/commit/ef14d337c48150d99dd853cac243a988d3244727))





# [0.8.0](https://github.com/textlint/editor/compare/v0.7.1...v0.8.0) (2020-10-27)


### Features

* add parseOptionsFromConfig ([8ece751](https://github.com/textlint/editor/commit/8ece7517f37317108caae8284cae4e7f844729d1))
* config update support ([7ffa985](https://github.com/textlint/editor/commit/7ffa985deb20eb3f0f4bb6551f10fd7b20dedc41))
* design install ([df2f71e](https://github.com/textlint/editor/commit/df2f71e2637b7ac3defba66ce803eba4b5491f5d))
* support "merge-config" command ([e7f734e](https://github.com/textlint/editor/commit/e7f734eb2e1e44d85592159f37d3a83ab50f7966))





# [0.7.0](https://github.com/textlint/editor/compare/v0.6.0...v0.7.0) (2020-08-05)


### Features

* **script-editor:** add metadata to script ([569ef53](https://github.com/textlint/editor/commit/569ef53a682bc471a6af11daa6f31891637d1bd0))





# [0.6.0](https://github.com/textlint/editor/compare/v0.5.0...v0.6.0) (2020-08-02)


### Bug Fixes

* **compiler:** addd @babel/core deps ([37076d9](https://github.com/textlint/editor/commit/37076d970336358811ab41b187251a1a34b6bf10))


### Features

* **compiler:** process.env.TEXLINT_COMPILER_INLINING as flag ([410ccb0](https://github.com/textlint/editor/commit/410ccb00459a6dd9db59bc8a371444411c80cb8e))





# [0.5.0](https://github.com/textlint/editor/compare/v0.4.2...v0.5.0) (2020-08-02)


### Features

* **@textlint/script-compiler:** add babel-plugin-static-fs ([3e85945](https://github.com/textlint/editor/commit/3e8594589c4cc5ef8cfdf7519b1450e70e85745c))





## [0.4.1](https://github.com/textlint/editor/compare/v0.4.0...v0.4.1) (2020-08-02)

**Note:** Version bump only for package @textlint/script-compiler





# [0.4.0](https://github.com/textlint/editor/compare/v0.3.0...v0.4.0) (2020-08-02)


### Bug Fixes

* **compiler:** change way that is applying patch for kuromoji ([de26db2](https://github.com/textlint/editor/commit/de26db2aefb7ca80d7cfd5d1d948892d3c766271))


### Features

* **textchecker-element:** implement LintEngine API ([8cd5b1a](https://github.com/textlint/editor/commit/8cd5b1a7fa3abcddb85aa42daecb9db511782c41))





# [0.3.0](https://github.com/textlint/editor/compare/v0.2.2...v0.3.0) (2020-07-31)

**Note:** Version bump only for package @textlint/script-compiler





## [0.2.2](https://github.com/textlint/editor/compare/v0.2.1...v0.2.2) (2020-07-31)


### Bug Fixes

* **compiler:** add mode option ([7d02092](https://github.com/textlint/editor/commit/7d02092dd0b2bcbfbd8c6899a66adaf4619f61cb))





# [0.2.0](https://github.com/textlint/editor/compare/v0.1.2...v0.2.0) (2020-07-30)


### Features

* fixText command should respect ruleId ([#10](https://github.com/textlint/editor/issues/10)) ([69e68f1](https://github.com/textlint/editor/commit/69e68f18ca1917de7d448285e167add2c8226ed1))





## [0.1.2](https://github.com/textlint/editor/compare/v0.1.1...v0.1.2) (2020-07-29)


### Bug Fixes

* **compiler:** export all ([35631f9](https://github.com/textlint/editor/commit/35631f93546fb579ce93db6fe244a4bcce6c536f))





## 0.1.1 (2020-07-29)


### Bug Fixes

* add multiple request handler ([0ed4a4a](https://github.com/textlint/editor/commit/0ed4a4aae6ded8f053070b9ff2f74adc64aa98ce))
* **compiler:** add workaround for kuromoji.js bug ([a64bb7a](https://github.com/textlint/editor/commit/a64bb7a3e4f285322456ae5ef8ec3f353098fcd8))
* **compiler:** add workaround for kuromoji.js bug ([41e63b0](https://github.com/textlint/editor/commit/41e63b0f46dcf82314a502e1d2e36a7533afcb6b))
* use fs.promises ([24d13fa](https://github.com/textlint/editor/commit/24d13fa6109de7787191c730649e0ed02f119d53))


### Features

* **textchecker-element:** support "Fix it!" ([c516c19](https://github.com/textlint/editor/commit/c516c19445d55a9bdeace723efc2a1737d4e1550))
* implement @textlint/config-loader ([2885865](https://github.com/textlint/editor/commit/28858652e43712ee7db032716c5ef417f42789c1))
* implement config loader ([ed9ca27](https://github.com/textlint/editor/commit/ed9ca273b88fd737e5d65c79c5c66778e0dd4b48))
