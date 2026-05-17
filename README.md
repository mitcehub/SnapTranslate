# EZ-Translate

轻量级浏览器翻译扩展 — 选中文字即可即时翻译。

> **注意：** 本扩展未发布到 Chrome Web Store 或 Edge 扩展商店，需要手动加载已解压的扩展。
>
> [English README](README.en.md)

## 功能

- 划词翻译（Google 翻译 / Bing 翻译）
- 页面全文翻译
- 输入框翻译
- 弹出窗口与选项页面
- 时间线风格的翻译历史

## 安装方法

### 油猴脚本（推荐）

安装 Tampermonkey 后打开下方链接即可安装：

[**安装 EZ-Translate 油猴版**](userscript/dist/ez-translate.user.js)

或者在 `userscript/dist/ez-translate.user.js` 右键 "Raw" → "Install"。

### Chrome 扩展

1. 从 [Releases 页面](https://github.com/mitcehub/EZ-Translate/releases) 下载最新的 `ez-translate-chrome.zip`
2. 解压到任意文件夹
3. 地址栏输入 `chrome://extensions/`
4. 开启右上角的 **开发者模式**
5. 点击 **加载已解压的扩展程序**
6. 选择解压后的 `Translate` 文件夹

### Edge 扩展

1. 从 [Releases 页面](https://github.com/mitcehub/EZ-Translate/releases) 下载最新的 `ez-translate-edge.zip`
2. 解压到任意文件夹
3. 地址栏输入 `edge://extensions/`
4. 开启左下角的 **开发者模式**
5. 点击 **加载扩展**
6. 选择解压后的 `Translate` 文件夹

## 自行构建

```bash
npm ci
npm run build
```

构建产物在 `Translate/` 目录下。

## 许可

MIT
