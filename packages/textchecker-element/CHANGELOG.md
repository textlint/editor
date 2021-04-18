# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.10.1](https://github.com/textlint/editor/compare/v0.10.0...v0.10.1) (2021-04-18)


### Bug Fixes

* add build:public before publish ([7c5413f](https://github.com/textlint/editor/commit/7c5413f6c546db953f2ac31b68c4ff7ee60ac64b))





# [0.10.0](https://github.com/textlint/editor/compare/v0.9.3...v0.10.0) (2021-04-18)


### Features

* add data-textlint-editor-embedded ([252b594](https://github.com/textlint/editor/commit/252b594aed0ec735c2a64e4bc24990fc889961c9))





## [0.9.3](https://github.com/textlint/editor/compare/v0.9.2...v0.9.3) (2021-04-18)


### Bug Fixes

* rename textlint.js to textlint-worker.js ([3a82df9](https://github.com/textlint/editor/commit/3a82df9f6b261ee3fd82ff777897d14d51e0b722)), closes [#27](https://github.com/textlint/editor/issues/27)
* rename textlint.js to textlint-worker.js ([d9d2f3f](https://github.com/textlint/editor/commit/d9d2f3f9ab22d4beea73394f0ece805b56ea73f4)), closes [#27](https://github.com/textlint/editor/issues/27)





## [0.9.1](https://github.com/textlint/editor/compare/v0.9.0...v0.9.1) (2021-04-17)

**Note:** Version bump only for package textchecker-element





# [0.9.0](https://github.com/textlint/editor/compare/v0.8.2...v0.9.0) (2021-04-17)


### Bug Fixes

* **textchecker-element:** fix to click fix ([1fb2b47](https://github.com/textlint/editor/commit/1fb2b4776d4274919013968f140f2a200f573427))
* dot not attach readonly textarea ([236c050](https://github.com/textlint/editor/commit/236c050337596fd1490d98c5f7a2db32d2e880f3)), closes [#26](https://github.com/textlint/editor/issues/26)
* fix Cannot read property 'targetElement' of undefined ([247b236](https://github.com/textlint/editor/commit/247b2360a927c5a9fd1cd88c2ce48ecb99c4e87a)), closes [#25](https://github.com/textlint/editor/issues/25)
* fix hide popup when no hovering item ([d4cbea6](https://github.com/textlint/editor/commit/d4cbea6f44b28ef325a0f7f9d96ef738fa280717))
* mouse handling ([4238396](https://github.com/textlint/editor/commit/4238396ee347d4a42a987a5055e6c5a37be6cad2))


### Features

* support "ignore" feature ([ef14d33](https://github.com/textlint/editor/commit/ef14d337c48150d99dd853cac243a988d3244727))
* **textchecker-element:** hide after 500ms delay ([18927bc](https://github.com/textlint/editor/commit/18927bc3b2e6385013a46611b62f42289cbbf74e))





## [0.8.1](https://github.com/textlint/editor/compare/v0.8.0...v0.8.1) (2021-01-21)


### Bug Fixes

* fix textlint worker management ([83ccaa6](https://github.com/textlint/editor/commit/83ccaa618fc9d6db3a71be5769c8eda7165eb7fc))
* support Mutation Observer ([dfdc815](https://github.com/textlint/editor/commit/dfdc8157e5469a830bceefe821b67b08d6eb12f2))





# [0.8.0](https://github.com/textlint/editor/compare/v0.7.1...v0.8.0) (2020-10-27)


### Bug Fixes

* update template ([d3705c5](https://github.com/textlint/editor/commit/d3705c5bdbb670a102bc07d3547005fc1205b966))
* update template ([14dd55f](https://github.com/textlint/editor/commit/14dd55fcde9433dbc80d02b880f47ea18e28f1de))


### Features

* add parseOptionsFromConfig ([8ece751](https://github.com/textlint/editor/commit/8ece7517f37317108caae8284cae4e7f844729d1))
* config update support ([7ffa985](https://github.com/textlint/editor/commit/7ffa985deb20eb3f0f4bb6551f10fd7b20dedc41))
* design install ([df2f71e](https://github.com/textlint/editor/commit/df2f71e2637b7ac3defba66ce803eba4b5491f5d))





# [0.7.0](https://github.com/textlint/editor/compare/v0.6.0...v0.7.0) (2020-08-05)


### Bug Fixes

* **text-checker-element:** remove console.log ([6625de3](https://github.com/textlint/editor/commit/6625de35cd8033916f9bc1a157bca6f3183a30e2))
* **textchecker-element:** add style to rule name ([e885db5](https://github.com/textlint/editor/commit/e885db5eff51004d5824d9923e8e11c65bba5dd8))
* **textchecker-element:** fix popup bug ([650b1d0](https://github.com/textlint/editor/commit/650b1d0051539023e90e46cc43aff5e7c0dd72a7))
* **textchecker-element:** remove unused code ([040724d](https://github.com/textlint/editor/commit/040724df18833ac3b0e5cf1ef1c48ab1cb973db1))
* **textchecker-element:** use id for search element ([7d4b9b8](https://github.com/textlint/editor/commit/7d4b9b88181684283599de573eb370c12f8bf66c))
* **textchecker-element:** when scroll and resize, update annotations ([b49c608](https://github.com/textlint/editor/commit/b49c6084fa7afa47c526ed44da029ecef6a0d4d3))
* **webextension:** fix fixAll and fixRule ([291ac1d](https://github.com/textlint/editor/commit/291ac1d5d59f58e573c9fc576d6258f2534ee092))
* **webextension:** support Firefox ([ddfc020](https://github.com/textlint/editor/commit/ddfc0200db0b2e6697ae37e192f199dd839c6654))


### Features

* **script-editor:** add metadata to script ([569ef53](https://github.com/textlint/editor/commit/569ef53a682bc471a6af11daa6f31891637d1bd0))


### Performance Improvements

* **textchecker-element:** drop non-visible annotation ([8590b90](https://github.com/textlint/editor/commit/8590b9002a4093e7b65fd28c4990b094e4ed22f6))





# [0.6.0](https://github.com/textlint/editor/compare/v0.5.0...v0.6.0) (2020-08-02)

**Note:** Version bump only for package textchecker-element





# [0.5.0](https://github.com/textlint/editor/compare/v0.4.2...v0.5.0) (2020-08-02)

**Note:** Version bump only for package textchecker-element





## [0.4.1](https://github.com/textlint/editor/compare/v0.4.0...v0.4.1) (2020-08-02)

**Note:** Version bump only for package textchecker-element





# [0.4.0](https://github.com/textlint/editor/compare/v0.3.0...v0.4.0) (2020-08-02)


### Bug Fixes

* **compiler:** change way that is applying patch for kuromoji ([de26db2](https://github.com/textlint/editor/commit/de26db2aefb7ca80d7cfd5d1d948892d3c766271))


### Features

* **textchecker-element:** implement LintEngine API ([8cd5b1a](https://github.com/textlint/editor/commit/8cd5b1a7fa3abcddb85aa42daecb9db511782c41))





# [0.3.0](https://github.com/textlint/editor/compare/v0.2.2...v0.3.0) (2020-07-31)


### Features

* **@textlint/website-generator:** add website generator ([4c500a5](https://github.com/textlint/editor/commit/4c500a526fac6ad4a0393b7babc6f5501fbed950))





## [0.2.2](https://github.com/textlint/editor/compare/v0.2.1...v0.2.2) (2020-07-31)

**Note:** Version bump only for package textchecker-element





## [0.2.1](https://github.com/textlint/editor/compare/v0.2.0...v0.2.1) (2020-07-30)


### Bug Fixes

* **textchecker-element:** use import ([99bbaec](https://github.com/textlint/editor/commit/99bbaecb16a0775085c9be7b7f54d500266ff2e0))





# [0.2.0](https://github.com/textlint/editor/compare/v0.1.2...v0.2.0) (2020-07-30)


### Features

* fixText command should respect ruleId ([#10](https://github.com/textlint/editor/issues/10)) ([69e68f1](https://github.com/textlint/editor/commit/69e68f18ca1917de7d448285e167add2c8226ed1))
* stop lint on composition event ([036f1c1](https://github.com/textlint/editor/commit/036f1c17c5d981695b19cda57b3c84c4a9910c54))





## [0.1.2](https://github.com/textlint/editor/compare/v0.1.1...v0.1.2) (2020-07-29)

**Note:** Version bump only for package textchecker-element





## 0.1.1 (2020-07-29)


### Bug Fixes

* **textchecker-element:** add status ([9a49605](https://github.com/textlint/editor/commit/9a496056791e7e9f8d3e3649cd73d54ae143223f))
* **textchecker-element:** fix design ([4eeb1fc](https://github.com/textlint/editor/commit/4eeb1fc7ea0c2c6b60a4827f61d3b76eab66b6c1))
* **textchecker-element:** fix position issue ([e53d031](https://github.com/textlint/editor/commit/e53d0314a2c78c9433fefb4a7ac2cf5be78d16b9))
* **webextension:**  support fix it ([386b994](https://github.com/textlint/editor/commit/386b9944776ebf6f4e97b7f33dbf01c12ccc6168))
* add multiple request handler ([0ed4a4a](https://github.com/textlint/editor/commit/0ed4a4aae6ded8f053070b9ff2f74adc64aa98ce))


### Features

* **textchecker-element:** implement design ([d8a1529](https://github.com/textlint/editor/commit/d8a15296f70ddacbb01d435c984645d7d3625eac)), closes [#1](https://github.com/textlint/editor/issues/1)
* **textchecker-element:** support "Fix it!" ([c516c19](https://github.com/textlint/editor/commit/c516c19445d55a9bdeace723efc2a1737d4e1550))
* **webextension:** add webextension ([24737b4](https://github.com/textlint/editor/commit/24737b41f9d7e0a1af4109197b990f4bbc8905f9))
* implement config loader ([ed9ca27](https://github.com/textlint/editor/commit/ed9ca273b88fd737e5d65c79c5c66778e0dd4b48))
* support popup position ([42aa2f8](https://github.com/textlint/editor/commit/42aa2f8df6d0767c5a7fdeb9fbd63cf70ca37b93))
* support textlint rough ([b99bd82](https://github.com/textlint/editor/commit/b99bd82ee484df4ade771cafd346e11100ca023f))
* **text-checker:** add text-checker-popup-element.ts ([48f0f8f](https://github.com/textlint/editor/commit/48f0f8fd5ba962ea3b5dfc245bea11b2513efccc))
