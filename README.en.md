# SnapTranslate

A lightweight browser translation extension for Chrome / Edge / Firefox.

## Features

- **Selection Translation** — Translate selected text instantly, with Shadow DOM support
- **Input Translation** — Translate text in input fields, including contentEditable rich text editors
- **Page Translation** — Full page translation with site-specific rules, viewport-first translation, paragraph batching
- **Multiple Engines** — Google Translate and Microsoft Translate
- **Auto Translation** — Automatically translate pages on open, with smart content language detection
- **Translation Revert** — One-click restore original text, preserving full DOM structure
- **Site Rules** — Built-in translation rules for various websites, with remote rule subscription
- **Blacklist** — Per-site control over auto-translation
- **Multi-language** — English / Chinese / Japanese / Korean / Russian / Arabic

## Translation Speed

- **Google Translate**: Fast response, high quality. **Requires access to Google services**, which may not be available in some regions
- **Microsoft Translate**: Accessible in China without special network setup. Relatively slower response time

> 💡 Users in China should use Microsoft Translate. Users with Google access are recommended to use Google Translate for a faster experience

## Installation

### Chrome / Edge

#### Install from Release (Recommended)

1. Download the latest `snap-translate-chrome.zip` from [Releases](https://github.com/mitcehub/SnapTranslate/releases)
2. Extract to a folder
3. Navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** → select the extracted folder

> **Note**: When updating, remove the old version first, then load the new one

#### Load Unpacked (Development)

1. Clone: `git clone https://github.com/mitcehub/SnapTranslate.git`
2. Install: `cd SnapTranslate && npm install`
3. Build: `npm run build`
4. Chrome → `chrome://extensions` → Developer mode → Load unpacked → select the `Translate` directory

### Firefox

1. Download the latest `snap-translate-firefox.xpi` from [Releases](https://github.com/mitcehub/SnapTranslate/releases)
2. Drag and drop the `.xpi` file into the browser window, or go to `about:addons` → gear icon → **Install Add-on From File**

## Version

Current version: **v0.0.3** — [View Release](https://github.com/mitcehub/SnapTranslate/releases/tag/v0.0.3)
