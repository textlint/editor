# @textlint/config-inliner

Inlining config for supporting browser.

Some rules use `fs`, so `fs` module does not work in a browser.
Instead of using `fs`, inlining the content before compiling by `@textlint/script-compiler`.

[textlint-scripts build](https://github.com/textlint/textlint-scripts#textlint-scripts-build) inlining `fs` usage by default.

`@textlint/config-inliner`'s target is `.textlintrc` configration file.

- [ ] TODO: we need to defined common rule for inlining.

## Supported Rules

- [x] [textlint-rule-prh](https://github.com/textlint-rule/textlint-rule-prh)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint/config-inliner

## Usage

```ts
import { loadConfig } from "@textlint/config-loader";
import { inlineConfig } from "@textlint/config-inliner";
const config = await loadConfig();
const inlinedConfig = await inlineConfig(config);
```

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

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
