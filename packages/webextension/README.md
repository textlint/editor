# textlint editor

textlint editor

## Install

    # on root dir
    yarn install 
    yarn run build

    # on this dir
    patch -p1 < diff.patch

### Install textlint scripts

textlint editor install your textlint scripts like Greasemonkey.

An example of textlint script is https://azu.github.io/textlintrc/

## Development

    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run dist chrome
    npm run dist firefox
    npm run dist opera
    npm run dist edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

## Docs

* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Architecture

- Page Scripts
    - postMessage → Content Script
- Content Scripts
    - postMessage → Background Page
    - Pass Page Scripts ← Background Page
- Background Page
    - → message → textlint-worker.js(downloaded)
    - ← message 

Summary

- WebPage(Page Scripts) → Content Script → Background Page → WebWorker(textlint) → Background Page → Content Script → WebPage

**Why use PageScript?**

Chrome and Firefox does work WebComponent in Content Script.

- [390807 - Content scripts can't define custom elements - chromium](https://bugs.chromium.org/p/chromium/issues/detail?id=390807)

## Deploy

- Build
- Firefox
  - `cd dist/firefox && web-ext sign --api-key ....`
