# @textlint/website-generator

A website generator that creates a standalone web application for textlint, allowing users to lint text directly in the browser using your configured textlint rules.

## Overview

`@textlint/website-generator` compiles your textlint configuration and rules into a web worker script and generates a complete website with an interactive text editor. This enables users to experience your textlint rules without any installation.

## Features

- Generates a standalone website with textlint functionality
- Compiles textlint rules to run in web workers
- Creates an interactive text editor with real-time linting
- Supports custom styling with title and placeholder text
- Works with existing `.textlintrc` configuration files
- Automatically infers metadata from `package.json`

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint/website-generator

## Usage

### Basic Usage

Generate a website using your existing `.textlintrc` configuration:

```bash
textlint-website-generator --output-dir ./dist
```

### Command Line Options

    Usage
      $ textlint-website-generator 
 
    Options
      --title                     [String] Website page title
      --placeholder               [String] Placeholder text in generated website
      --cwd                       current working directory
      --textlintrc                [path:String] path to .textlintrc file. Default: load .textlintrc.{json,yaml,js}
      --output-dir                [path:String] output directory for generated website files (required)

    Metadata Options
      Metadata is inferred from package.json by default.
      If you want to set metadata manually, use these flags:
    
      --metadataName              [String] generated script name
      --metadataNamespace         [String] generated script namespace (URL)
      --metadataHomepage          [String] generated script homepage URL
      --metadataVersion           [String] generated script version
 
    Examples
      # Basic usage with package.json metadata
      $ textlint-website-generator --output-dir ./dist
      
      # Custom title and placeholder
      $ textlint-website-generator --output-dir ./dist --title "My Textlint Rules" --placeholder "Type or paste your text here..."
      
      # Manual metadata configuration
      $ textlint-website-generator --output-dir ./dist --metadataName "my-rules" --metadataNamespace "https://example.com"
      
      # Full customization
      $ textlint-website-generator --output-dir ./dist --metadataName "script name" --metadataNamespace "https://example.com" --title "rule tester" --placeholder "default text"

## How It Works

1. **Compilation**: The generator uses `@textlint/script-compiler` to compile your textlint configuration and rules into a web worker script (`textlint-worker.js`)

2. **Template Generation**: It creates an HTML page with:
   - An interactive textarea for text input
   - Integration with `textchecker-element` for real-time linting
   - Support for the textlint-editor browser extension

3. **Output**: The generator produces:
   - `index.html` - The main webpage
   - `textlint-worker.js` - Compiled textlint rules as a web worker
   - `textchecker-element.esm.js` - UI component for text checking

## Configuration

### Using package.json

By default, the generator reads metadata from your `package.json`:

```json
{
  "name": "my-textlint-rules",
  "version": "1.0.0",
  "homepage": "https://github.com/username/my-textlint-rules"
}
```

### Using .textlintrc

The generator automatically loads your textlint configuration from:
- `.textlintrc`
- `.textlintrc.json`
- `.textlintrc.yaml`
- `.textlintrc.js`

Or specify a custom path:

```bash
textlint-website-generator --textlintrc ./config/.textlintrc.json --output-dir ./dist
```

## Development Workflow

### Building the Template

The package includes a script to generate the template files:

```bash
npm run generate-template
```

This runs before packaging to ensure the latest template is included.

### Project Structure

```
packages/@textlint/website-generator/
├── bin/
│   └── cmd.js              # CLI entry point
├── src/
│   ├── cli.ts              # CLI implementation
│   └── website-generator.ts # Core generator logic
├── template/
│   ├── index.html          # HTML template
│   └── textchecker-element.esm.js # UI component
└── lib/                    # Compiled JavaScript output
```

## Integration with textlint-editor

The generated website can work with the [textlint-editor browser extension](https://github.com/textlint/editor) for enhanced functionality. Users can install custom rule scripts using the "Install" button on the generated page. 

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
