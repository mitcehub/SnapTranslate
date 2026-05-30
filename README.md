# SnapTranslate

[English](./README.en.md)

轻量级浏览器划词翻译扩展。

## 功能

- **划词翻译** — 选中文本自动弹出翻译按钮
- **输入框翻译** — 在输入框中直接翻译
- **网页翻译** — 整页翻译，支持站点特定规则
- **多引擎** — 支持 Google 翻译和 Bing 翻译
- **自动翻译黑名单** — 按网站控制是否自动翻译
- **多语言** — 英语/中文/日语/韩语

## 安装

### 从源码加载（开发模式）

1. 克隆仓库：`git clone https://github.com/mitcehub/SnapTranslate.git`
2. 安装依赖：`cd SnapTranslate && npm install`
3. 构建：`npm run build`
4. 打开 Chrome → `chrome://extensions`
5. 开启「开发者模式」
6. 点击「加载已解压的扩展程序」→ 选择 `Translate` 目录

### 从 Release 安装

1. 前往 [Releases](https://github.com/mitcehub/SnapTranslate/releases) 下载最新 `.zip`
2. 解压到本地目录
3. Chrome → `chrome://extensions` → 开发者模式 → 加载已解压的扩展程序 → 选择解压后的目录
