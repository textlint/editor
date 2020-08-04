# @textlint/website-generator

Website generator using @textlint/script-compiler

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint/website-generator

## Usage

    Usage
      $ textlint-website-generator 
 
    Options
      --title            [String] Website page title
      --placeholder      [String] Placeholder text in generated website
      --cwd              current working directory
      --textlintrc       [path:String] path to .textlintrc file. Default: load .textlintrc.{json,yaml,js}
      --output-dir       [path:String] output file path that is written of reported result.
 
    Examples
      $ textlint-website-generator --output-dir ./dist
      $ textlint-website-generator --output-dir ./dist --title "rule tester" --placeholder "default text"

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
