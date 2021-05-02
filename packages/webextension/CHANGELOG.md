# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.11.2](https://github.com/textlint/editor/compare/v0.11.1...v0.11.2) (2021-05-02)

**Note:** Version bump only for package @textlint/webextension





## [0.11.1](https://github.com/textlint/editor/compare/v0.11.0...v0.11.1) (2021-05-02)

**Note:** Version bump only for package @textlint/webextension





# [0.11.0](https://github.com/textlint/editor/compare/v0.10.5...v0.11.0) (2021-05-02)


### Bug Fixes

* **webextension:** use tabs instead of webRequest ([#45](https://github.com/textlint/editor/issues/45)) ([0a710fa](https://github.com/textlint/editor/commit/0a710fa17994e641c03a49f90eea412c3c640da0))
* improve stability ([#44](https://github.com/textlint/editor/issues/44)) ([270b400](https://github.com/textlint/editor/commit/270b40080e903596b0ef5afd1fcaa2791b9609ac))
* **webextension:** add worker-src: self blob to CSP ([#39](https://github.com/textlint/editor/issues/39)) ([adccedd](https://github.com/textlint/editor/commit/adccedd1a3586376344a4a1439bef15ebcee41c8))
* **webextension:** do not expose background object to website ([#43](https://github.com/textlint/editor/issues/43)) ([3ee2a87](https://github.com/textlint/editor/commit/3ee2a8750528ced2bbbe719a4c47e0287bc3c8b0)), closes [#40](https://github.com/textlint/editor/issues/40)
* **webextension:** remove tabs permission ([8fd47b4](https://github.com/textlint/editor/commit/8fd47b425ea6252689ee9b2d84d5669386e4b7e3))


### Features

* **webextension:** support to update Script ([339cf6f](https://github.com/textlint/editor/commit/339cf6f9a3e8e7037840506d44631d57e4dfcca1))





## [0.10.5](https://github.com/textlint/editor/compare/v0.10.4...v0.10.5) (2021-04-19)

**Note:** Version bump only for package @textlint/webextension





## [0.10.4](https://github.com/textlint/editor/compare/v0.10.3...v0.10.4) (2021-04-19)

**Note:** Version bump only for package @textlint/webextension





## [0.10.3](https://github.com/textlint/editor/compare/v0.10.2...v0.10.3) (2021-04-19)


### Bug Fixes

* **webextension:** fix to install ([61b92fe](https://github.com/textlint/editor/commit/61b92fe91d9e8c1bffefb200276b6806260bf14c))
* **webextension:** remove activeTab ([c89a759](https://github.com/textlint/editor/commit/c89a7594c5e1eb2d79010c7a2beb99f0102c2e99))
* uuid ([6376a7f](https://github.com/textlint/editor/commit/6376a7fc65684293afac00b6f166a9a18ed7248c))
* **webextension:** use react in install-dialog ([09befb6](https://github.com/textlint/editor/commit/09befb6d9b1d920c04d1253a3f0fa2848247a3a8))





## [0.10.2](https://github.com/textlint/editor/compare/v0.10.1...v0.10.2) (2021-04-18)

**Note:** Version bump only for package @textlint/webextension





## [0.10.1](https://github.com/textlint/editor/compare/v0.10.0...v0.10.1) (2021-04-18)

**Note:** Version bump only for package @textlint/webextension





# [0.10.0](https://github.com/textlint/editor/compare/v0.9.3...v0.10.0) (2021-04-18)


### Bug Fixes

* **script-parser:** fix script banner format ([166694c](https://github.com/textlint/editor/commit/166694cc50853e67631ab07833a525b219f9985c))


### Features

* add data-textlint-editor-embedded ([252b594](https://github.com/textlint/editor/commit/252b594aed0ec735c2a64e4bc24990fc889961c9))





## [0.9.3](https://github.com/textlint/editor/compare/v0.9.2...v0.9.3) (2021-04-18)


### Bug Fixes

* rename textlint.js to textlint-worker.js ([d9d2f3f](https://github.com/textlint/editor/commit/d9d2f3f9ab22d4beea73394f0ece805b56ea73f4)), closes [#27](https://github.com/textlint/editor/issues/27)





## [0.9.1](https://github.com/textlint/editor/compare/v0.9.0...v0.9.1) (2021-04-17)

**Note:** Version bump only for package @textlint/webextension





# [0.9.0](https://github.com/textlint/editor/compare/v0.8.2...v0.9.0) (2021-04-17)


### Bug Fixes

* **webextension:** cache worker x script ([8ea8ea5](https://github.com/textlint/editor/commit/8ea8ea515e53985bd1826dcdc19be52f3ba10d24))
* **webextension:** support ext ([a3e86dc](https://github.com/textlint/editor/commit/a3e86dc99b71ccdda98ef7430409ebdb1ee01313))
* **webextension:** support ext ([f4c2284](https://github.com/textlint/editor/commit/f4c2284dd7d69226ed58a2e54bae886fdd3f32ad))
* dot not attach readonly textarea ([236c050](https://github.com/textlint/editor/commit/236c050337596fd1490d98c5f7a2db32d2e880f3)), closes [#26](https://github.com/textlint/editor/issues/26)
* fix Cannot read property 'targetElement' of undefined ([247b236](https://github.com/textlint/editor/commit/247b2360a927c5a9fd1cd88c2ce48ecb99c4e87a)), closes [#25](https://github.com/textlint/editor/issues/25)
* page → browser action ([fc754da](https://github.com/textlint/editor/commit/fc754da14aad24d3f6160aed81a2aa7b266bedcc))
* pin "@adobe/react-spectrum" reg ([337c340](https://github.com/textlint/editor/commit/337c340f0344ad3fcfab72ec24785aa3d8128726))


### Features

* support "ignore" feature ([ef14d33](https://github.com/textlint/editor/commit/ef14d337c48150d99dd853cac243a988d3244727))





## [0.8.1](https://github.com/textlint/editor/compare/v0.8.0...v0.8.1) (2021-01-21)


### Bug Fixes

* fix textlint worker management ([83ccaa6](https://github.com/textlint/editor/commit/83ccaa618fc9d6db3a71be5769c8eda7165eb7fc))
* support Mutation Observer ([dfdc815](https://github.com/textlint/editor/commit/dfdc8157e5469a830bceefe821b67b08d6eb12f2))





# [0.8.0](https://github.com/textlint/editor/compare/v0.7.1...v0.8.0) (2020-10-27)


### Bug Fixes

* fix infinite loop ([6c9a572](https://github.com/textlint/editor/commit/6c9a5726d2efb16a2671b70fd0d13849b5fd4a91))
* update template ([14dd55f](https://github.com/textlint/editor/commit/14dd55fcde9433dbc80d02b880f47ea18e28f1de))
* use textContent ([c2ab4d1](https://github.com/textlint/editor/commit/c2ab4d11b075625d02a2d06d5c45bb8b6b76745b))


### Features

* add parseOptionsFromConfig ([8ece751](https://github.com/textlint/editor/commit/8ece7517f37317108caae8284cae4e7f844729d1))
* add test ([02eed37](https://github.com/textlint/editor/commit/02eed37a7df4830eebd0782bf4d04031648567b6))
* config update support ([7ffa985](https://github.com/textlint/editor/commit/7ffa985deb20eb3f0f4bb6551f10fd7b20dedc41))
* design install ([df2f71e](https://github.com/textlint/editor/commit/df2f71e2637b7ac3defba66ce803eba4b5491f5d))
* support firefox ([1196b59](https://github.com/textlint/editor/commit/1196b59f03214c4dca8fd43b7c5b9d456c4668fe))
* **webextension:** add .ext ([6f8a166](https://github.com/textlint/editor/commit/6f8a1669521aa77c7ae0bb0d56e610883c5bf6fe))





## [0.7.1](https://github.com/textlint/editor/compare/v0.7.0...v0.7.1) (2020-08-09)

**Note:** Version bump only for package @textlint/webextension





# [0.7.0](https://github.com/textlint/editor/compare/v0.6.0...v0.7.0) (2020-08-05)


### Bug Fixes

* **textchecker-element:** remove unused code ([040724d](https://github.com/textlint/editor/commit/040724df18833ac3b0e5cf1ef1c48ab1cb973db1))
* **textchecker-element:** when scroll and resize, update annotations ([b49c608](https://github.com/textlint/editor/commit/b49c6084fa7afa47c526ed44da029ecef6a0d4d3))
* **webextension:** add boot event ([34babc9](https://github.com/textlint/editor/commit/34babc969b22a8c492af51327d39d684118de5ef))
* **webextension:** fix fixAll and fixRule ([291ac1d](https://github.com/textlint/editor/commit/291ac1d5d59f58e573c9fc576d6258f2534ee092))
* **webextension:** support Firefox ([ddfc020](https://github.com/textlint/editor/commit/ddfc0200db0b2e6697ae37e192f199dd839c6654))


### Features

* add textlint-script-parser ([6a746fb](https://github.com/textlint/editor/commit/6a746fb879a5b4961d37d6f9fd4bfd8bd6286028))
* **script-editor:** add metadata to script ([569ef53](https://github.com/textlint/editor/commit/569ef53a682bc471a6af11daa6f31891637d1bd0))





# [0.6.0](https://github.com/textlint/editor/compare/v0.5.0...v0.6.0) (2020-08-02)

**Note:** Version bump only for package @textlint/webextension





# [0.5.0](https://github.com/textlint/editor/compare/v0.4.2...v0.5.0) (2020-08-02)

**Note:** Version bump only for package @textlint/webextension





## [0.4.1](https://github.com/textlint/editor/compare/v0.4.0...v0.4.1) (2020-08-02)

**Note:** Version bump only for package @textlint/webextension





# [0.4.0](https://github.com/textlint/editor/compare/v0.3.0...v0.4.0) (2020-08-02)


### Features

* **textchecker-element:** implement LintEngine API ([8cd5b1a](https://github.com/textlint/editor/commit/8cd5b1a7fa3abcddb85aa42daecb9db511782c41))
* **webextension:** support multiple workers ([79f8a0a](https://github.com/textlint/editor/commit/79f8a0adfcdac2a731861fbd81f17c2485f7a4cd))





# [0.3.0](https://github.com/textlint/editor/compare/v0.2.2...v0.3.0) (2020-07-31)

**Note:** Version bump only for package @textlint/webextension





## [0.2.2](https://github.com/textlint/editor/compare/v0.2.1...v0.2.2) (2020-07-31)

**Note:** Version bump only for package @textlint/webextension





## [0.2.1](https://github.com/textlint/editor/compare/v0.2.0...v0.2.1) (2020-07-30)

**Note:** Version bump only for package @textlint/webextension





# [0.2.0](https://github.com/textlint/editor/compare/v0.1.2...v0.2.0) (2020-07-30)

**Note:** Version bump only for package @textlint/webextension





## [0.1.2](https://github.com/textlint/editor/compare/v0.1.1...v0.1.2) (2020-07-29)

**Note:** Version bump only for package @textlint/webextension





## 0.1.1 (2020-07-29)


### Bug Fixes

* **textchecker-element:** fix position issue ([e53d031](https://github.com/textlint/editor/commit/e53d0314a2c78c9433fefb4a7ac2cf5be78d16b9))
* **webextension:**  support fix it ([386b994](https://github.com/textlint/editor/commit/386b9944776ebf6f4e97b7f33dbf01c12ccc6168))


### Features

* **webextension:** add webextension ([24737b4](https://github.com/textlint/editor/commit/24737b41f9d7e0a1af4109197b990f4bbc8905f9))
