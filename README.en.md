# EZ-Translate

A lightweight browser translation extension — select text on any page and translate it instantly.

> **Note:** This extension is not published on the Chrome Web Store or Edge Add-ons. You need to load it manually as an unpacked extension.

## Features

- Select text → instantly translate (Google Translate / Bing)
- Page translation support
- Input box translation
- Popup & options page
- Timeline-style translation history

## Installation

### Userscript (Recommended)

Install [Tampermonkey](https://www.tampermonkey.net/) first, then open the link below:

[**Install EZ-Translate Userscript**](userscript/dist/ez-translate.user.js)

Or browse to `userscript/dist/ez-translate.user.js` and click "Raw" → "Install".

### Chrome Extension

1. Download the latest `ez-translate-chrome.zip` from the [Releases page](https://github.com/mitcehub/EZ-Translate/releases)
2. Unzip the archive to a folder
3. Open `chrome://extensions/`
4. Enable **Developer mode** (toggle in the top-right corner)
5. Click **Load unpacked**
6. Select the `Translate` folder from the unzipped archive

### Edge Extension

1. Download the latest `ez-translate-edge.zip` from the [Releases page](https://github.com/mitcehub/EZ-Translate/releases)
2. Unzip the archive to a folder
3. Open `edge://extensions/`
4. Enable **Developer mode** (toggle in the bottom-left corner)
5. Click **Load unpacked**
6. Select the `Translate` folder from the unzipped archive

## Build from Source

```bash
npm ci
npm run build
```

The extension output is in the `Translate/` directory.

## License

MIT
