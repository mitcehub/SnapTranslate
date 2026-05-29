# SnapTranslate

轻量级浏览器划词翻译扩展，支持 Chrome / Edge / Firefox。

## 功能

- **划词翻译** — 选中文本自动弹出翻译按钮，支持 Shadow DOM 穿透
- **输入框翻译** — 在输入框中直接翻译，支持 contentEditable 富文本编辑器
- **网页翻译** — 整页翻译，支持站点特定规则、视口优先翻译、段落分组批量翻译
- **多引擎** — 支持 Google 翻译和 Microsoft 翻译
- **自动翻译** — 打开页面自动翻译，智能检测内容语言避免重复翻译
- **翻译还原** — 一键恢复原文，完整保留原始 DOM 结构
- **站点规则** — 内置多种网站翻译规则，支持远程规则订阅
- **黑名单** — 按网站控制是否自动翻译
- **多语言** — 英语 / 中文 / 日语 / 韩语 / 俄语 / 阿拉伯语

## 翻译速度

- **Google 翻译**：速度快，响应快，翻译质量高。**需要能够访问 Google 服务**，国内用户可能无法直接使用
- **Microsoft 翻译**：国内用户可直接访问，无需特殊网络环境。但翻译速度相对较慢，响应时间较长

> 💡 建议国内用户优先使用 Microsoft 翻译引擎，有 Google 访问条件的用户推荐使用 Google 翻译以获得更快的翻译体验

## 安装

### Chrome / Edge

#### 从 Release 安装（推荐）

1. 前往 [Releases](https://github.com/mitcehub/SnapTranslate/releases) 下载最新版 `snap-translate-chrome.zip`
2. 解压到一个文件夹
3. 在浏览器地址栏输入 `chrome://extensions/`（Edge 用 `edge://extensions/`）回车
4. 打开右上角 **开发者模式**
5. 点击 **加载已解压的扩展程序** → 选择解压后的文件夹

> **注意**：每次更新版本需要先移除旧版本，再重新加载新版本

#### 从源码加载（开发模式）

1. 克隆仓库：`git clone https://github.com/mitcehub/SnapTranslate.git`
2. 安装依赖：`cd SnapTranslate && npm install`
3. 构建：`npm run build`
4. Chrome → `chrome://extensions` → 开发者模式 → 加载已解压的扩展程序 → 选择 `Translate` 目录

### Firefox

1. 前往 [Releases](https://github.com/mitcehub/SnapTranslate/releases) 下载最新版 `snap-translate-firefox.xpi`
2. 直接拖入浏览器窗口安装，或在 Firefox 地址栏输入 `about:addons` → 齿轮图标 → **从文件安装附加组件**

## 版本

当前版本：**v0.0.3** — [查看 Release](https://github.com/mitcehub/SnapTranslate/releases/tag/v0.0.3)
