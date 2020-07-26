# @textlint/editor

textlint editor project.

## Install

Install with yarn

    yarn install

## Usage

- [ ] Write usage instructions


## Working on

- [ ] textarea
- [ ] contenteditable
- [ ] Google Docs
- [ ] Medium
- [ ] Wordpress
- [ ] CodeMirror
- [ ] ACE

## Purpose

- Work first
    - copy text and overlay mode
- WebComponent
- textlint worker
- Offline support

## WebComponent

Avoid side-effect on website.

- TextChecker
- Controller
- Portal Overlay

## Architecture

- FrontEnd
    - [textchecker-element](packages/textchecker-element) is general web component implementation.
    - Injectable code
    - View
    - multiple implementations
    - For VSCode, TextArea, Google Docs
- BackEnd
    - Web Extension: background.js
    - Server: API server
    - Web Worker: thread
    - spellchecker backend api

FrontEnd and BackEnd is separated.

### Compiler target

[@textlint/compiler](packages/@textlint/compiler) generate bundled JavaScript code. 

Compiler compilertextlint + rule + textlintrc into a single library code.

- Chrome Extension code
    - chrome.storage.local for cache
    - libraryTarget: 
- Web Worker code
    - kvstorage cache
    - libraryTarget: self
- Main Thread code(just web)
    - kvstorage cache
    - libraryTarget: web

### API

The library has some API

- update(config): Promise<void>
    - dynamic update textlintrc config
- lint({text:string}): { range: [number, number], message: string, suggestions: suggesionItem[] };
- fix({ range: [number,number] }): string;
- suggest({ range: [number, numbe })`
    - missing parts of textlint
- `ignore({ word:string }): Promise<void>`
    - [textlint-filter-rule-allowlist](https://github.com/textlint/textlint-filter-rule-allowlist) configuration?


## Changelog

See [Releases page](https://github.com/textlint/editor/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/textlint/editor/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
