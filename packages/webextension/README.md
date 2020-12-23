# textlint editor

textlint editor

## Install

	$ npm install

## Development

    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run build chrome
    npm run build firefox
    npm run build opera
    npm run build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

## Docs

* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Architecture

- Page Contents
    - postMessage → Background Page
    - show result ← Background Page
- Background Page
    - → message → textlint.js(downloaed)
    - ← message 

Summary

- WebPage → Content Script → Background Page → WebWorker(textlint) → Background Page → Content Script → WebPage

## Deploy

- Build
- Firefox
  - `cd dist/firefox && web-ext sign --api-key ....`
