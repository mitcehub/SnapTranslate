// ==UserScript==
// @name         EZ-Translate
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  轻量级划词翻译 - 选中文字即可即时翻译 (EZ-Translate Userscript Port)
// @author       mitcehub
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      translate.googleapis.com
// @connect      www.bing.com
// @connect      raw.githubusercontent.com
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAARlSURBVFiF7ZdLbFRVGMd/59w7M+1MO9OHlBZKSwuFQoGCtIBiwCw0ISpGYyI+ogvjRrNw4caFGzeaiAt3JmriAokLI4EWEkxAAoFACy20QGmh00Kn0+m8ztcF0+k8mDu3hZ+6yL8493zn/N//+33fd4EMP8ww/hdgGA3fyyDMd/t0H4L/fRD+pxL4Nwh8P59L8E8I/Gdp5r0ECPefDfnaU7AEFvz0K4mX/4cMlED/M0jh5HqSr++i/+zvDA3lCDUvwPdNcmWg65eXKD72IlTyiUS3IIUs4+Rqlt8/TM/1E6i6nYr/MNmhIFqLxh9vRHV76d5zCa1rJcG8QEl5IZ1Xb+L2OFGBE3id64kOtODNbeLqG0FU+T+9N2+m68vz1G14BF+aSs2Fehr2uJi3sYbFMx/h3JWNBOwcMX1EuzcSX7INpZy1LKjhzmfMd66HC0dGuPpCHH+tBVduU7pvYN2LEjaX/BiGbPyzidhSE8ViYQsfYBgG/QeTtG8PE88tJ4D0yh4JK5N3Kk44bJFIpnEHmiAdxGu5XHG4+zYzP9iG5U8G88fH6P0kTCx7D/QLazjnzVw4mMAwJN5QMV7ToPVMmO5KHFkUwYh14sr309JSBBiYhUEMuxIk2qX0efpjP2P1y8bfwjQLbln74PKJVVw6nKJ53uDuHIlDB/C4I4Tz2imr8ROpX0Xzpm0YUJQjCGU6srAJp+LIw4pxs5Pm+Ajk+yir1KmtmM+n61oQQrRsXU0TPsh2H8oH5bMRHwC5vl56SSLLo4Ayo8RAOo6rqgZ/zkqUEDgL/JjGKbQjhoUxVQILQp4FSsmUEKi+EC73OPGyaob/vENvvRWLAIM0AkIYCPwYpp9UWqKUAikkQghKiiIsyJ1Bc16EYXmH+0+2ka2tZSBRTs36mYz+KYUUQhBfsJD25DjBpkUM+J4m0HQNM+ZAr7mHptS7LKicS9mSXTSd2kLF/HmY7mxSYR/Jrs2ku1sZ0Nspbe3DGJ0Cg0GqFuxn/9cKqbj21BF4chcFPR202S0oKcEMl5JdNIfhPVuQ5Y2oogdQjSKMCGXdZcxYDOEKkCr7PobhBmDb60AKSWCygnT8X4BX48rOYbBqFxQFEOWA45h/LkAQKGPA0U3DO1M7ZxmYB2E0FoUNqKFITZBqCqLqB0j0BzECkZQYKeWrYnZkOAG3y4mqXoQq/hiR/wlR2UGwmnczfH0X3tp/U90TQiFmbz4xwwMpSBGB0smo4tlQ6gEdXohpCxDrfYqE4QbApSq4I+8Bm5n1mQACQeHrEHk5y9Q5QCT3J9gBKkYPzxz4k42zTKpa8ujkBnj5QQJTKZJVNhI+gqPmB/LhRpKTKUHB5B9TpAH4X/XBMJhGCWR2OZ2HEkTaDCrbDPx5v8LtN5HFuzmI4/L1Ptz/SSZ3yTANeH19OC4//VSe0CCFsJ8r5+fTfPXMpB5gsUy8K5eB1xW4vwcng5PLwOu/AZgKCIGm2VCHUwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wMi0yMVQxNzowNjoyMCswMDowMNvWrGkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDItMjFUMTc6MDY6MjArMDA6MDC/H9KGAAAAAElFTkSuQmCC
// ==/UserScript==
/* eslint-disable */
(function () {
'use strict';


// ===== rules.json (BUNDLED_RULES) =====
const BUNDLED_RULES = {
  "version": 2,
  "generatedAt": "2026-05-17T06:49:19.801Z",
  "rules": [
    {
      "name": "1688",
      "matches": [
        "www.1688.com"
      ],
      "injectedCss": [
        "[class^='defaultSubNav'],[class^='loginButton'] {height:unset!important;}",
        "[data-tracker='category'] > font {white-space:nowrap!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "1paragraph",
      "matches": [
        "1paragraph.app"
      ],
      "selectors": [
        "#book"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "1password",
      "matches": [
        "*.1password.com"
      ],
      "excludeSelectors": [
        ".secret-key"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ac.nowcoder",
      "matches": [
        "ac.nowcoder.com"
      ],
      "excludeSelectors": [
        ".answer-module",
        ".question-intr",
        ".language-list",
        ".question-oi"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "afreecatv",
      "matches": [
        "www.afreecatv.com"
      ],
      "globalStyles": {
        "a.title": "max-height:unset;-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "aha",
      "matches": [
        "*.ideas.aha.io"
      ],
      "excludeSelectors": [
        ".comment-header",
        ".vote-status",
        ".idea-meta",
        ".filters-title",
        ".ideas-showing-count",
        ".my-ideas-filters-wrapper",
        ".statuses-filters-wrapper",
        ".categories-filters-wrapper",
        "[class^='attachment']",
        "span[class^='attachment-name']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "aliexpress",
      "matches": [
        "*.aliexpress.*"
      ],
      "excludeSelectors": [
        "[class*='multi--price']"
      ],
      "injectedCss": [
        "[class*='multi--title'],.G7dOC {-webkit-line-clamp:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "aljazeera",
      "matches": [
        "www.aljazeera.com"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "allmyfaves",
      "matches": [
        "https://allmyfaves.com/"
      ],
      "selectors": [
        "p"
      ],
      "paragraphMinTextCount": 2,
      "paragraphMinWordCount": 1,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "alphaxiv",
      "matches": [
        "www.alphaxiv.org"
      ],
      "injectedCss": [
        "[class*=line-clamp] {-webkit-line-clamp:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "amazon",
      "matches": [
        "www.amazon.*"
      ],
      "excludeSelectors": [
        "#navFooter",
        ".s-price-instructions-style",
        "[class*='-star ']",
        "[data-hook='acr-average-stars-rating-text']",
        ".a-color-price,.a-price",
        "[data-testid='price-section']",
        "[data-component='dui-badge']",
        "#glow-ingress-block,#nav-link-accountList,#nav-orders,#nav-cart"
      ],
      "extraBlockSelectors": [
        ".a-size-small.a-link-normal.page-banner-link.a-nowrap"
      ],
      "injectedCss": [
        ".a-carousel-viewport {height:unset;}",
        "[class*='clamp'] {max-height: unset!important;-webkit-line-clamp: unset!important;}",
        "[data-rows] {max-height: unset!important;-webkit-line-clamp: unset!important;}",
        "[data-a-expander-name='review_text_read_more'] { max-height: unset;}",
        ".compact.primaryText.primaryTextOnly {max-height: unset;-webkit-line-clamp: unset;}",
        ".format {-webkit-line-clamp: unset;}",
        ".dcl-truncate,[class*='textButton'],span[data-a-max-rows] {max-height:unset!important;-webkit-line-clamp: unset!important;}"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "androidpolice",
      "matches": [
        "www.androidpolice.com"
      ],
      "excludeSelectors": [
        ".author",
        ".w-total-info",
        ".images-header-menu-list",
        ".w-display-card-details",
        ".w-display-card-extra"
      ],
      "injectedCss": [
        ".display-card-title,.display-card-title * {height:unset!important;-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "angel",
      "matches": [
        "www.angel.com"
      ],
      "excludeSelectors": [
        ".bmpui-subtitle-position-vtt *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "annasArchive",
      "matches": [
        "*.annas-archive.org",
        "annas-archive.org"
      ],
      "extraBlockSelectors": [
        "a.custom-a"
      ],
      "globalStyles": {
        "div[id^='link-index-']": "height: unset; max-height: unset;",
        "main div[class*='h-[125]']": "height:auto"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "app.element.io",
      "matches": [
        "app.element.io"
      ],
      "excludeSelectors": [
        ".mx_DisambiguatedProfile",
        ".mx_ReplyChain_wrapper",
        ".mx_ThreadSummary_replies_amount"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "app.rapidlaunch.wtf",
      "matches": [
        "app.rapidlaunch.wtf"
      ],
      "excludeSelectors": [
        "div.border-b.border-gray-700\\/50.flex",
        "a.text-blue-400",
        ".flex.items-center.text-xs.text-gray-400",
        ".flex.items-center.gap-1\\.5.mb-1"
      ],
      "injectedCss": [
        ".max-h-24 { max-height: unset !important; }",
        ".line-clamp-2 {-webkit-line-clamp: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "app.schildi.chat",
      "matches": [
        "app.schildi.chat"
      ],
      "excludeSelectors": [
        ".mx_DisambiguatedProfile",
        ".mx_MessageTimestamp",
        ".mx_EventTile_avatar"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "apple",
      "matches": [
        "developer.apple.com"
      ],
      "excludeSelectors": [
        ".developer-video-player",
        ".vue-recycle-scroller",
        ".developer-video-player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "appleDeveloper",
      "matches": [
        "developer.apple.com/documentation/*"
      ],
      "selectors": [
        ".container",
        "h3.title",
        "div.content"
      ],
      "excludeSelectors": [
        ".vue-recycle-scroller"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "appleinsider",
      "matches": [
        "appleinsider.com"
      ],
      "excludeSelectors": [
        "#topic-nav"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "appsumo",
      "matches": [
        "appsumo.com"
      ],
      "globalStyles": {
        "[class*='line-clamp']": "-webkit-line-clamp: unset"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ar5iv",
      "matches": [
        "ar5iv.labs.arxiv.org"
      ],
      "excludeSelectors": [
        ".ltx_bibliography",
        ".ltx_tag.ltx_tag_item",
        ".ltx_listing.ltx_lstlisting.ltx_listing",
        ".ltx_eqn_table"
      ],
      "stayOriginalSelectors": [
        ".ltx_note"
      ],
      "extraBlockSelectors": [
        ".ltx_p"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "arca",
      "matches": [
        "arca.live"
      ],
      "excludeSelectors": [
        "span.user-info"
      ],
      "globalStyles": {
        ".vrow.column": "height:unset !important;",
        ".body .board-article .article-list .list-table .vrow.column .vcol": "width:unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "archiveofourown",
      "matches": [
        "archiveofourown.org"
      ],
      "excludeSelectors": [
        ".meta,.navigation,.byline,.pagination,.datetime,.stats",
        "#add_comment",
        "#footer",
        ".summary > h3",
        ".notes > h3"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "archiveofourown-chapter",
      "matches": [
        "archiveofourown.org/works*chapters/*"
      ],
      "excludeSelectors": [
        ".meta,.navigation,.byline,.pagination,.datetime,.stats",
        "#add_comment",
        "#footer",
        ".summary > h3",
        ".notes > h3"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "archiveToday",
      "matches": [
        "archive.today",
        "archive.ph",
        "archive.is",
        "archive.md"
      ],
      "excludeSelectors": [
        "#HEADER"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ardmediathek",
      "matches": [
        "www.ardmediathek.*"
      ],
      "excludeSelectors": [
        ".ardplayer-viewport-addon-overlays",
        ".ardplayer-viewport-addon-overlays *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "arena",
      "matches": [
        "lmarena.ai"
      ],
      "excludeSelectors": [
        "table"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "arte",
      "matches": [
        "www.arte.tv"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "artstationArtwork",
      "matches": [
        "www.artstation.com/artwork/*"
      ],
      "selectors": [
        ".project-description",
        "div.project-comment-text",
        ".asset-caption"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "artstationBlog",
      "matches": [
        "https://www.artstation.com/blogs",
        "https://www.artstation.com/blogs/*"
      ],
      "excludeSelectors": [
        "blog-card-thumbnail",
        "blog-card-header",
        ".blog-card-author",
        ".blog-card-meta",
        ".blog-view-header",
        ".blog-grid-title",
        ".post-meta-header"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "artstationLearning",
      "matches": [
        "www.artstation.com/learning/courses/*"
      ],
      "excludeSelectors": [
        ".learning-card-meta",
        ".vjs-text-track-display",
        "#immersive-translate-caption-window",
        ".vjs-text-track-display *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "arxiv",
      "matches": [
        "https://browse.arxiv.org",
        "https://arxiv.org/html/*"
      ],
      "excludeSelectors": [
        ".desktop_header",
        "[class*='ltx_lst_language_']",
        "div.package-alerts",
        ".ltx_toclist",
        ".ltx_authors",
        ".ltx_bibliography"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "arxiv-vanity.com",
      "matches": [
        "www.arxiv-vanity.com"
      ],
      "excludeSelectors": [
        ".arxiv-vanity-wrapper"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "asu",
      "matches": [
        "api.playposit.com"
      ],
      "excludeSelectors": [
        "#overlay-container",
        "#overlay-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "auth0Openai",
      "matches": [
        "auth0.openai.com"
      ],
      "excludeSelectors": [
        "form",
        "header > h1"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "autoHeight",
      "matches": [
        "*.sooplive.*",
        "zen-browser.app",
        "message.alibaba.com",
        "erp.91miaoshou.com",
        "jddonline.com",
        "cis.vemic.com",
        "scripod.com",
        "drjoedispenza.com",
        "www.x-mol.com",
        "webvpn.bnu.*",
        "www.connectedpapers.com",
        "isappscience.org",
        "www.dtmstation.com",
        "kalshi.com",
        "engoo.com",
        "puchipurabu.com",
        "www.wildberries.ru",
        "m.163.com",
        "discord.com/discovery*",
        "zhenghedata.com",
        "yoeshop.ssweet.*"
      ],
      "selectors": [
        "#plugin-product-comment",
        ".plugin-product-comment-collections",
        "[class*='line-clamp-']"
      ],
      "injectedCss": [
        ".side_list a,.title a,.tit,.item-title {-webkit-line-clamp:unset!important;height:unset!important;}",
        "details {height:unset!important;}",
        ".product-title {height:unset!important;-webkit-line-clamp:unset!important;}",
        ".plugin-product-comment-content {height:unset!important;-webkit-line-clamp:unset!important;}",
        "div.jdd-product-info-box {height:unset!important;}",
        "span.hotData-text { -webkit-line-clamp: unset !important; line-clamp: unset !important;}",
        "div.line-clamp-4 { -webkit-line-clamp: unset; max-height: unset;}",
        "[class*='titleTypography'] {-webkit-line-clamp: unset !important;}",
        ".div-text-line-three { -webkit-line-clamp: unset; max-height: unset;}",
        ".data-title { -webkit-line-clamp: unset!important; max-height: unset!important;}",
        ".paper-title,.search-result-abstract.folded,.list-group-item-mod h5 { -webkit-line-clamp: unset!important; max-height: unset!important;}",
        ".kb-advanced-heading-link,.limited-text { -webkit-line-clamp: unset!important; max-height: unset!important;}",
        ".entry-card-title,.entry-card-snippet { -webkit-line-clamp: unset!important; max-height: unset!important;}",
        "span.line-clamp-2 { -webkit-line-clamp: unset!important; max-height: unset!important;}",
        ".css-1yo0yr8 {-webkit-line-clamp: unset!important; max-height: unset!important;}",
        "[class*='line-clamp-'],[class*='line-clamp-'] font {white-space:unset!important;-webkit-line-clamp: unset!important; max-height: unset!important;}",
        ".product-card__brand-wrap {white-space:unset;}",
        ".card-recommend-oneImg article h4 {max-height:unset;-webkit-line-clamp:unset;}",
        ".description__4cb8a {max-height:unset;-webkit-line-clamp:unset;}",
        ".link-container {height:unset!important;-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "babelR-render",
      "selectors": [
        ".babelR-offline-render"
      ],
      "excludeSelectors": [
        ".babelR-offline-reflow-container",
        ".babelR-offline-preserve-container"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "baiduXueshu",
      "matches": [
        "xueshu.baidu.com"
      ],
      "globalStyles": {
        ".abstract_wr": "height: unset; overflow: visible; max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "balthild",
      "matches": [
        "balthild.github.io"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper [aria-hidden=true] {display:none;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bardGoogle",
      "matches": [
        "bard.google.com"
      ],
      "excludeSelectors": [
        "mat-sidenav",
        "div.capabilities-disclaimer",
        "#cdk-overlay-6",
        "message-actions button",
        ".mdc-button__label .ng-star-inserted",
        ".mdc-list-item__primary-text"
      ],
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "barotem",
      "matches": [
        "www.barotem.com"
      ],
      "injectedCss": [
        ".product_name {-webkit-line-clamp: unset!important;}",
        ".lists_goods_content > div {height: unset!important; min-height: 76px}",
        ".immersive-translate-target-inner {font-family: sans-serif !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "barrons",
      "matches": [
        "www.barrons.com"
      ],
      "extraInlineSelectors": [
        "article p span"
      ],
      "injectedCss": [
        "font.immersive-translate-target-wrapper > br {display:none;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "batchUnlimitHeight",
      "matches": [
        "https://www.inven.co.kr/*",
        "*.grandefratello.mediaset.*"
      ],
      "injectedCss": [
        "li {height:unset!important;}",
        ".big_box,article .text,article .title {height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bb-rich",
      "selectors": [
        "bb-rich-text-editor",
        ".bb-editor-root",
        ".ql-editor"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bbc",
      "matches": [
        "*.bbc.*"
      ],
      "excludeSelectors": [
        "section.module--languages",
        ".drop-capped",
        ".smp-toucan-player",
        "smp-subtitles",
        "#subtitle_subtitle2",
        "[data-testid='media-player-container-landscape'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bbc-emp",
      "matches": [
        "https://emp.bbc.*/emp/*"
      ],
      "excludeSelectors": [
        ".p_accessibleHitArea",
        ".p_accessibleHitArea *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bbc-iplayer",
      "matches": [
        "https://www.bbc.*/iplayer*"
      ],
      "excludeSelectors": [
        ".player",
        ".player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bilibili",
      "matches": [
        "www.bilibili.com"
      ],
      "excludeSelectors": [
        ".bpx-player-subtitle-panel-text",
        ".bili-video-card__info--author, .bili-video-card__info--date",
        "#pictures,#note,#info,#footer,#expander-footer,.playinfo,.upname,#bilibili-player"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bing",
      "matches": [
        "https://*.bing.com/search*"
      ],
      "excludeSelectors": [
        ".tptxt"
      ],
      "extraInlineSelectors": [
        "a",
        "i"
      ],
      "globalStyles": {
        "[class*='lineclamp'],.b_title": "-webkit-line-clamp:unset;",
        ".b_gwaDl,.b_snipwithnsl": "height:unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bingNews",
      "matches": [
        "https://*.bing.com/news/search*"
      ],
      "globalStyles": {
        ".newsitem .title": "max-height: none; -webkit-line-clamp: 10",
        ".newsitem .snippet": "max-height: none; -webkit-line-clamp: 10"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bitwarden.com",
      "matches": [
        "bitwarden.com"
      ],
      "excludeSelectors": [
        ".status-widget__state"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bloomberg",
      "matches": [
        "www.bloomberg.com"
      ],
      "excludeSelectors": [
        ".ticker-bar",
        "nav",
        "[aria-label=Banner]",
        "aside",
        "[data-component=ticker-bar]",
        "footer.bb-global-footer",
        ".vjs-text-track-display"
      ],
      "excludeMatches": [
        "https://www.bloomberg.com/live/*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bmvrMarseille",
      "matches": [
        "www.bmvr.marseille.fr"
      ],
      "globalStyles": {
        "a > div": "display:block;",
        "[style*='358px;']": "width: 33.3333%; height: auto; padding: 0px; position: relative; margin: 0px;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "book-douban",
      "matches": [
        "book.douban.com"
      ],
      "excludeSelectors": [
        "a.author-name",
        "p.user > a",
        "div#collector > div > div[style^='padding-left'] > a",
        "div#info a"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "braynzarsoft",
      "matches": [
        "www.braynzarsoft.net"
      ],
      "excludeSelectors": [
        "#content-header",
        ".sidebar-section",
        ".rating-box",
        ".tutorial-stat",
        "#bookmark-btn",
        ".question-footer",
        ".adsbygoogle",
        ".footer",
        ".type",
        ".views",
        ".questioninputcode"
      ],
      "injectedCss": [
        ".tutorial-desc {overflow: scroll !important;}",
        ".question-title {display:inline-flex !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "brown",
      "matches": [
        "cs.brown.edu"
      ],
      "excludeSelectors": [
        ".SCodeFlow"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "brutalist",
      "matches": [
        "brutalist.report"
      ],
      "selectors": [
        "li > a:first-child",
        "aside",
        "nav > a",
        "h1 > a",
        "h3 > a",
        "h2 >a"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bsky.app",
      "matches": [
        "https://bsky.app"
      ],
      "excludeSelectors": [
        "[class='css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-1iln25a']",
        "[class='css-175oi2r r-1la3zjv r-3o4zer']",
        "[data-testid^=homeScreenFeedTabs]",
        "[class='css-146c3p1 r-1loqt21']",
        "[class='css-1jxf684 r-1loqt21']",
        "[data-testid^=repostCount]",
        "[data-testid^=likeCount]",
        "[data-testid^=quoteCount]",
        "[data-testid^=replyBtn]",
        "[aria-label='View profile']"
      ],
      "injectedCss": [
        ".r-xoduu5 {display:inline!important;}",
        "[style*='-webkit-line-clamp'] {-webkit-line-clamp:unset!important;}"
      ],
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "bugsKde",
      "matches": [
        "bugs.kde.org"
      ],
      "excludeSelectors": [
        ".bz_first_comment_head",
        ".bz_comment_head",
        ".related_actions"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "businessinsider",
      "matches": [
        "www.businessinsider.com"
      ],
      "excludeSelectors": [
        "header",
        "nav",
        "section.live-updates-module "
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "casino",
      "matches": [
        "www.casino.org"
      ],
      "excludeSelectors": [
        ".material-symbols-outlined"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "cbsnews",
      "matches": [
        "www.cbsnews.com"
      ],
      "excludeSelectors": [
        ".avia-container",
        ".avia-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ccfddl",
      "matches": [
        "ccfddl.com"
      ],
      "excludeSelectors": [
        "div.conf-timer > span[style^='color: black']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ceros",
      "matches": [
        "view.ceros.com"
      ],
      "injectedCss": [
        ".page-object.group > .page-object.text > p { height: 100% !important; overflow: auto !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "championcross.jp",
      "matches": [
        "https://championcross.jp"
      ],
      "injectedCss": [
        "[class^='Original_section_title'] {overflow:hidden!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "character.ai",
      "matches": [
        "character.ai"
      ],
      "extraInlineSelectors": [
        ".auto-content",
        ".auto-content *",
        "#chat-messages > .group:first-child .prose *",
        "#chat-messages > .group:not(:first-child) .font-display *"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper br {display:none;}",
        "[imt-state=dual] .prose p {margin:0;}"
      ],
      "globalStyles": {
        ".swiper,.rah-static,[class*=max-h],.line-clamp-1": "overflow:scroll;-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chatGoogle",
      "matches": [
        "chat.google.com"
      ],
      "selectors": [
        "[jsname=bgckF]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chatOpenai",
      "matches": [
        "chat.openai.com",
        "chatgpt.com"
      ],
      "excludeSelectors": [
        "div.absolute.bottom-0.left-0.w-full",
        "h1",
        "div#headlessui-portal-root",
        "nav",
        "ul[aria-multiselectable]",
        ".markdown *",
        "div[class='flex flex-col items-start']",
        "div[class='flex items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300']"
      ],
      "globalStyles": {
        "[class*='line-clamp']": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chatpdf",
      "matches": [
        "www.chatpdf.com"
      ],
      "excludeSelectors": [
        ".chat-message-row.ai *",
        ".pdf-viewer"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chatter.hume.ai",
      "matches": [
        "chatter.hume.ai"
      ],
      "extraInlineSelectors": [
        "[class*=' flex-wrap'] > span"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chinadaily",
      "matches": [
        "www.chinadaily.com.cn"
      ],
      "excludeSelectors": [
        ".topNav",
        ".topNav2_art > span",
        ".topNav_art2 > .dropdown",
        ".dibu-three",
        ".topBar"
      ],
      "injectedCss": [
        "a { height: unset !important; }",
        "li { height: unset !important; }",
        "div { height: unset !important; }",
        ".immersive-translate-target-inner {color:black;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chosun",
      "matches": [
        "www.chosun.com"
      ],
      "injectedCss": [
        "body {word-break: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "chromium",
      "matches": [
        "*.chromium.org"
      ],
      "excludeSelectors": [
        "ancestors-breadcrumbs",
        "depth-finder[role='tree']",
        "repository-detail",
        "issue-metadata-sidebar",
        "nav",
        ".bv2-event-user",
        ".b-description-heading",
        "b-attachment-viewer",
        "i"
      ],
      "injectedCss": [
        "font svg {display:none;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "claudeAi",
      "matches": [
        "claude.ai"
      ],
      "excludeSelectors": [
        ".contents *",
        ".code-block__code"
      ],
      "injectedCss": [
        "[data-testid='chat-menu-trigger'] br {display:none;}",
        "[data-test-render-count] {overflow: scroll;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "claudeartifacts",
      "matches": [
        "claudeartifacts.com"
      ],
      "excludeSelectors": [
        "h1",
        "h3 + span.rounded-full",
        "[class='p-6 pt-0 flex justify-between items-center']",
        "[class='text-xs text-gray-500']"
      ],
      "globalStyles": {
        ".line-clamp-3": "-webkit-line-clamp: unset"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "cnbc",
      "matches": [
        "www.cnbc.com"
      ],
      "excludeSelectors": [
        "#GlobalNavigation",
        "#GlobalFooter",
        ".LiveBlogHeader-timestampAndShareBarContainer",
        ".LiveBlogHeader-liveUpdatesPill",
        ".QuoteInBody-inlineButton"
      ],
      "globalStyles": {
        "div.Card-titleContainer > div": "-webkit-line-clamp: unset;max-height: unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "cnet",
      "matches": [
        "www.cnet.com"
      ],
      "globalStyles": {
        "h3,div,span,p": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "cnn",
      "matches": [
        "*.cnn.com"
      ],
      "excludeSelectors": [
        ".ad-slot-header__wrapper",
        "#pageFooter"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "codeium",
      "matches": [
        "codeium.com"
      ],
      "excludeSelectors": [
        "nav a[class*=C]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "codewithchris",
      "matches": [
        "learn.codewithchris.com",
        "*.rachelsenglishacademy.com",
        "www.unrealsenseiacademy.com",
        "www.comsol.com/video/*",
        "www.comsol.com/blogs/*"
      ],
      "excludeSelectors": [
        ".w-captions",
        ".w-captions-line > div > span",
        ".w-captions *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "coindesk",
      "matches": [
        "www.coindesk.com"
      ],
      "excludeSelectors": [
        "[data-subtitles-container='true']",
        "[data-subtitles-container='true'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "coinmarketcap",
      "matches": [
        "coinmarketcap.com"
      ],
      "extraBlockSelectors": [
        "div[class='sc-3502f6cd-0 JxHqg']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "common-query.pdfWebPage",
      "selectors": [
        "[id=pdfCanvasContainer] > iframe[src*=pdf]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "common-vtt-jw",
      "matches": [
        "*.rottentomatoes.com",
        "megaplay.buzz",
        "www.brighttalk.com"
      ],
      "excludeSelectors": [
        ".jw-wrapper",
        ".jw-wrapper *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "common.pdfWebPage",
      "selectors": [
        "embed[type='application/pdf']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "common4.pdfWebPage",
      "selectors": [
        "#statements-pdf"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "comsol",
      "matches": [
        "*.comsol.com"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "construct",
      "matches": [
        "www.construct.net"
      ],
      "excludeSelectors": [
        "div.topNav",
        "div.usernameLink",
        "ul.authorDetails",
        "ul.tagViewer",
        "ul.breadCrumbNav",
        "ul.subForumForums",
        "ul.postTools",
        "li.comment ul.controls",
        "div.forumTopNavWrap",
        "div.downloadWrap",
        "div.articleLeftMenu",
        "div.usernameTextWrap",
        "div.favouriteWrap",
        "div.bannerWrapper",
        "div.viewAddonRightMenu",
        "div.extendedMenu.addonsSubMenu",
        "#BottomLinks.bottomLinks",
        "div#LeftSide.leftSide",
        "div#BottomWrap.bottomWrap",
        "div.courseListWrap div.overview",
        "div.conversationControls",
        "div.contentWrapper h1",
        "td.location a#LocationLink",
        "#TopLevelComments .topBar",
        "#TopLevelComments .controls",
        ".tagViewWrap",
        ".changeCount",
        ".otherStats",
        ".FilterMenu",
        ".mobileTopicStats",
        ".forumControlsWrapper",
        ".forumsBottomNavWrap",
        ".breadCrumbNav",
        ".favouriteWrap",
        ".usernameLink",
        ".followWrapper",
        ".blogPostStats",
        ".manualContent dl dt"
      ],
      "stayOriginalSelectors": [
        "a.usernameReference"
      ],
      "excludeMatches": [
        "preview.construct.net",
        "editor.construct.net"
      ],
      "globalStyles": {
        "td.location a#LocationLink": "padding-top: 4px;",
        "div.articleMain .tutCourseWrap": "align-items: flex-start;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "cooperativa",
      "matches": [
        "cooperativa.cl"
      ],
      "injectedCss": [
        "font.notranslate {display:unset!important}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "coursera1",
      "selectors": [
        ".rc-MetatagsWrapper .rc-VLPContainerWrapperCds"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "coursera2",
      "selectors": [
        ".rc-MetatagsWrapper .rc-Course"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "crunchyroll",
      "matches": [
        "*.crunchyroll.com"
      ],
      "excludeSelectors": [
        "#vilos",
        "#immersive-translate-caption-window",
        "#vilos *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "csust",
      "matches": [
        "tsgvpn2.csust.edu.cn"
      ],
      "injectedCss": [
        "h2 {font-size:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "curiositystream",
      "matches": [
        "curiositystream.com"
      ],
      "excludeSelectors": [
        "[data-testid=\"video-player\"]",
        "[data-testid=\"video-player\"] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "curseforge",
      "matches": [
        "www.curseforge.com"
      ],
      "globalStyles": {
        ".project-card": "height:unset;grid-template-rows: auto auto auto auto;",
        ".project-card .description": "height:unset;-webkit-line-clamp:unset;",
        "ul.details-list": "height:unset;",
        ".project-card .categories": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "czechvideo",
      "matches": [
        "https://czechvideo.co/*"
      ],
      "globalStyles": {
        ".short-story": "height:unset;",
        ".short-title": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dailyDev",
      "matches": [
        "app.daily.dev"
      ],
      "selectors": [
        "h1",
        ".typo-body",
        "article h3",
        "[class^=markdown_markdown]"
      ],
      "globalStyles": {
        ".line-clamp-3": "-webkit-line-clamp: unset"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dailymotion",
      "matches": [
        "*.dailymotion.com"
      ],
      "excludeSelectors": [
        ".player",
        ".player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dash-immersive",
      "matches": [
        "https://dash.immersivetranslate.com/*",
        "http://localhost:8000/dist/userscript/options*"
      ],
      "selectors": [
        ".hello"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "datacamp",
      "matches": [
        "projector.datacamp.com"
      ],
      "excludeSelectors": [
        ".video",
        ".video *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "datalab.naver",
      "matches": [
        "datalab.naver.com"
      ],
      "injectedCss": [
        ".tab_list_area .list_itm {height: unset !important;}",
        ".section.main_tab_opt .select {height: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dcinside",
      "matches": [
        "*.dcinside.com"
      ],
      "excludeSelectors": [
        ".num",
        ".time"
      ],
      "injectedCss": [
        ".time_best .typet_list li a {font-size:unset !important;}",
        "font {background:unset!important;padding:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "deeplearning",
      "matches": [
        "learn.deeplearning.ai"
      ],
      "excludeSelectors": [
        "[data-layout=\"video\"]",
        "[data-layout=\"video\"] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "deepwiki",
      "matches": [
        "deepwiki.com"
      ],
      "excludeSelectors": [
        "[class*='flex items-center break-all rounded-l px-2 py-1.5 bg-[#e5e5e5] text-[#333333] dark:bg-[#252525] dark:text-[#e4e4e4] rounded-r']",
        "[class*='mb-1 mr-1 inline-flex items-stretch font-mono text-xs !no-underline transition-opacity hover:opacity-75']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "descript",
      "matches": [
        "www.descript.com"
      ],
      "excludeSelectors": [
        "h1.home-hero"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper, .immersive-translate-target-wrapper *{color:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "developerChrome",
      "matches": [
        "developer.chrome.com"
      ],
      "excludeSelectors": [
        "web-tabs",
        "ul.code-sections--summary"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "devEpicGames",
      "matches": [
        "dev.epicgames.com"
      ],
      "excludeSelectors": [
        ".vjs-poster",
        ".vjs-poster *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "digitaltrends",
      "matches": [
        "www.digitaltrends.com"
      ],
      "extraBlockSelectors": [
        ".b-mem-post__title"
      ],
      "injectedCss": [
        ".b-mem__inner .b-mem-post:first-child h3{-webkit-line-clamp: 2;}",
        ".b-mem__inner .b-mem-post:first-child .b-mem-post__excerpt{display:inline;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "digitimes",
      "matches": [
        "www.digitimes.com"
      ],
      "excludeSelectors": [
        ".main-nav-frame",
        ".sub-header-wrapper",
        ".footer",
        ".date"
      ],
      "globalStyles": {
        "a,.title,.abstract,.display-5,.top": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "discord",
      "matches": [
        "https://discord.com/channels/*"
      ],
      "selectors": [
        "li[id^=chat-messages] div[id^=message-content]",
        "div[class^=headerText]",
        "section[aria-label='Search Results'] div[id^=message-content]",
        "div[class^=messagesPopout]",
        "[class^='embedTitle']",
        "[class^='embedDescription']",
        "[class^='promptContent']",
        "li[class^='container'] > div[class^='header']"
      ],
      "excludeSelectors": [
        "[class*='username']",
        "[class*='repliedMessage']"
      ],
      "extraBlockSelectors": [
        "[class^='embedFieldValue']",
        "li[class^='card'] div[class^='message']",
        "[data-list-item-id^='forum-channel-list'] div[class^='headerText']"
      ],
      "injectedCss": [
        "main div[class^=headerText],main div[class^=message],main div[class^=text] {max-height: unset;}",
        "h3[data-text-variant='heading-lg/semibold'] {-webkit-line-clamp: unset;line-height: unset;}",
        "[class*='guildDetails'] > [class*='description'] {-webkit-line-clamp: unset;}"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "discussions.apple",
      "matches": [
        "discussions.apple.com"
      ],
      "excludeSelectors": [
        ".page-number"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "disneyplus",
      "matches": [
        "www.disneyplus.com"
      ],
      "excludeSelectors": [
        ".dss-hls-subtitle-overlay",
        ".dss-hls-subtitle-overlay *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "doc2x",
      "matches": [
        "doc2x.com",
        "doc2x.noedgeai.com"
      ],
      "excludeSelectors": [
        "#md-scroll-top-dom"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docs-swift",
      "matches": [
        "docs.swift.org"
      ],
      "selectors": [
        ".content",
        "#menu"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docs-tutorials",
      "matches": [
        "docs.pytorch.org"
      ],
      "extraBlockSelectors": [
        ".tutorial-filter"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docs.unity.cn",
      "matches": [
        "docs.unity.cn"
      ],
      "stayOriginalSelectors": [
        ".tooltip"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docs.unity3d",
      "matches": [
        "docs.unity3d.com"
      ],
      "stayOriginalSelectors": [
        ".tooltip"
      ],
      "injectedCss": [
        ".immersive-translate-target-inner .tooltiptext {display: none;}",
        ".immersive-translate-target-inner .tooltip {cursor:pointer;border-bottom:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docubay",
      "matches": [
        "www.docubay.com"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "docusaurus",
      "selectors": [
        "#__docusaurus"
      ],
      "excludeSelectors": [
        ".DocSearch-Modal"
      ],
      "extraBlockSelectors": [
        ".hash-link"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dolmods",
      "matches": [
        "dolmods.net"
      ],
      "globalStyles": {
        "[class*='max-h']": "max-height:unset!important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "domestika",
      "matches": [
        "www.domestika.org"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "donghuaworld",
      "matches": [
        "dwserver.donghuaworld.com"
      ],
      "excludeSelectors": [
        ".jw-media",
        ".jw-media *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "doupocangqiong",
      "matches": [
        "www.doupocangqiong.org"
      ],
      "injectedCss": [
        "#play_0 ul { display: grid; grid-template-columns: repeat(3, 1fr); }",
        "#play_0 ul li { height: unset !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dr",
      "matches": [
        "*.dr.dk"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display > div",
        "#immersive-translate-caption-window",
        ".vjs-text-track-display > div *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "drizzle",
      "matches": [
        "orm.drizzle.team"
      ],
      "excludeSelectors": [
        "[class^='codetabs_tab']",
        ".npm__tab"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dtmstation",
      "matches": [
        "www.dtmstation.com"
      ],
      "extraBlockSelectors": [
        ".entry-card-title,.entry-card-snippet"
      ],
      "injectedCss": [
        ".entry-card-title,.entry-card-snippet { -webkit-line-clamp: unset!important; max-height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "duckduckgo",
      "matches": [
        "duckduckgo.com"
      ],
      "globalStyles": {
        "div[data-result='snippet'] > div > span": "-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dw",
      "matches": [
        "www.dw.com"
      ],
      "excludeSelectors": [
        ".focus-menu-shown"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "dynamic-repets",
      "matches": [
        "khovar.tj"
      ],
      "excludeSelectors": [
        ".slide_container [style*='position: absolute']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ebay",
      "matches": [
        "www.ebay.com"
      ],
      "excludeSelectors": [
        "headers",
        "[itemprop=offers]",
        ".dne-itemtile-original-price"
      ],
      "injectedCss": [
        ".iS4T .zgfQ .uHzw .Ep66 {-webkit-line-clamp: unset;max-height: unset;}",
        "[itemprop=name],.merch-item-title {-webkit-line-clamp: unset;max-height: unset;}"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "economist",
      "matches": [
        "www.economist.com"
      ],
      "excludeSelectors": [
        "footer.ds-footer"
      ],
      "extraInlineSelectors": [
        "span[data-caps='initial']"
      ],
      "injectedCss": [
        "a::before {position:relative!important;}",
        "[class^=button] span font {white-space:pre-wrap;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "edclub.com",
      "matches": [
        "www.edclub.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "edx",
      "matches": [
        "*.edx.org",
        "courses.mitxonline.mit.edu"
      ],
      "excludeSelectors": [
        ".closed-captions",
        ".wrapper-video-bottom-section",
        ".secondary-controls"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "eightfold",
      "matches": [
        "*.eightfold.ai"
      ],
      "injectedCss": [
        ".flexbox{width:100%}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "epam",
      "matches": [
        "*.epam.com"
      ],
      "excludeSelectors": [
        "#blog-page-sidebar-wrapper"
      ],
      "globalStyles": {
        "[class*='ContentAnchorLinkList']": "word-break:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "epubReader",
      "matches": [
        "epub-reader.online"
      ],
      "globalStyles": {
        "span.slide-contents-item-label": "overflow:visible;max-height:unset;white-space:normal;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "espn",
      "matches": [
        "*.espn.com"
      ],
      "excludeSelectors": [
        "#fittPageContainer",
        "#fittPageContainer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "explainpaper",
      "matches": [
        "https://www.explainpaper.com/reader*"
      ],
      "selectors": [
        ".leading-relaxed",
        ".chat-messages p",
        ".text-sm"
      ],
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "explainshell",
      "matches": [
        "explainshell.com"
      ],
      "selectors": [
        "[class='help-box']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "f1tv",
      "matches": [
        "f1tv.formula1.com"
      ],
      "excludeSelectors": [
        "#main-embeddedPlayer",
        "#main-embeddedPlayer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "f95zone",
      "matches": [
        "f95zone.to"
      ],
      "excludeSelectors": [
        ".pageNavWrapper",
        ".message-userExtras",
        ".message-name"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "facebook",
      "matches": [
        "*.facebook.com"
      ],
      "selectors": [
        "div[dir=auto][style]",
        "div[dir=auto][class]",
        "span[lang]",
        "[data-pagelet=BizInboxMessengerMessageListContainer] span",
        "[data-pagelet=BizInboxContextCardDetail] span",
        ".xod5an3",
        "[class='x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1sur9pj xkrqix3 xzsf02u x1pd3egz']",
        "#PNG_EXPORT",
        ".fb_content.clearfix",
        "[role='main']",
        "[role='region']",
        "[role='presentation']",
        "form#platformDialogForm"
      ],
      "excludeSelectors": [
        "[data-ad-comet-preview=message] [role=button]",
        "object[type='nested/pressable']",
        "[data-ad-rendering-role=profile_name]"
      ],
      "excludeMatches": [
        "www.facebook.com/business/*",
        "business.facebook.com/*",
        "www.facebook.com/help*",
        "www.facebook.com/settings*",
        "www.facebook.com/ads/library/*",
        "developers.facebook.com/*",
        "www.facebook.com/v20.0/plugins/*",
        "www.facebook.com/support*",
        "www.facebook.com/terms*",
        "www.facebook.com/privacy*"
      ],
      "injectedCss": [
        "._4ik4._4ik5 {max-height:unset!important;}"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fanbox",
      "matches": [
        "*.fanbox.cc"
      ],
      "excludeSelectors": [
        "[class^='Body__PostBodyText']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fandom",
      "matches": [
        "*.fandom.com"
      ],
      "excludeSelectors": [
        "header.fandom-community-header",
        "div.ph-registration-buttons"
      ],
      "extraBlockSelectors": [
        ".mp-nav a"
      ],
      "injectedCss": [
        ".immersive-translate-target-translation-block-wrapper {display: unset!important;}"
      ],
      "globalStyles": {
        "#mw-content-text > div > div:nth-child(1)": "height:100%;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fautv",
      "matches": [
        "www.fau.tv"
      ],
      "excludeSelectors": [
        ".jw-wrapper",
        ".jw-wrapper *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "feeder",
      "matches": [
        "https://feeder.co/*"
      ],
      "globalStyles": {
        ".item-summary": "-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "feedly",
      "matches": [
        "feedly.com"
      ],
      "excludeSelectors": [
        ".Leftnav"
      ],
      "globalStyles": {
        ".TitleOnlyLayout,.SelectedEntryScroller > div": "height:unset !important;",
        ".EntrySummary--u4,.EntrySummary--u5": "-webkit-line-clamp: unset;max-height:unset;",
        ".EntryTitleLink": "-webkit-line-clamp: unset;",
        ".SelectedEntryScroller > div :nth-child(2) :last-child": "-webkit-line-clamp: unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "feishu",
      "matches": [
        "*.feishu.cn",
        "*.larkoffice.com",
        "*.larksuite.com"
      ],
      "excludeSelectors": [
        ".catalogue__list"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "feynmanlectures",
      "matches": [
        "www.feynmanlectures.caltech.edu"
      ],
      "excludeSelectors": [
        ".videoview",
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ffmpeg",
      "matches": [
        "ffmpeg.org"
      ],
      "excludeSelectors": [
        ".memproto",
        ".memtitle"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fibery",
      "matches": [
        "the.fibery.io"
      ],
      "stayOriginalSelectors": [
        ".entity-node-view-container"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "figmaCommunity",
      "matches": [
        "www.figma.com/community/*"
      ],
      "excludeSelectors": [
        "div[class*='metadataRight']",
        "div[class*='commentMetaAndOptions']"
      ],
      "stayOriginalSelectors": [
        "[data-tooltip='tooltip-user-info']"
      ],
      "globalStyles": {
        "div[class*='mini_cardBottomRowSizing']": "height: 3em;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "finalCommon.pdfWebPage",
      "matches": [
        "https://obgyn.onlinelibrary.wiley.com/doi/pdf/*",
        "https://onlinelibrary.wiley.com/doi/pdf/*",
        "https://docs.amd.com/v/u/*/*",
        "https://arxiv.org/pdf/*"
      ],
      "selectors": [
        "embed[type='application/pdf']",
        "iframe[type='application/pdf']",
        "[id=myPdfIframe][src*=pdf]",
        "#article [type='application/pdf'][src*=pdf]",
        ".textFrame [type='application/pdf'][src*=pdf]",
        ".ggPdf",
        "[id=pdfCanvasContainer] > iframe[src*=pdf]",
        ".viewercontent-container  iframe[src*=documents]",
        "object[type='application/pdf']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fiverr",
      "matches": [
        "https://www.fiverr.com/inbox/*"
      ],
      "selectors": [
        ".message-body",
        "article[data-testid=index-container]"
      ],
      "excludeSelectors": [
        "[data-testid=basic-message-header]",
        "[data-testid=message-header-timestamp]",
        "time",
        ".user-name",
        ".user-info",
        ".header"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fiverr-main",
      "matches": [
        "*.fiverr.com"
      ],
      "excludeSelectors": [
        ".popular"
      ],
      "globalStyles": {
        "h3 > a": "-webkit-line-clamp:unset;overflow:unset;",
        "h3": "-webkit-line-clamp:unset;overflow:unset;",
        "h5": "-webkit-line-clamp:unset;overflow:unset;",
        "p": "-webkit-line-clamp:unset;overflow:unset;",
        ".YLycza2.u9KHmsf": "height:unset;max-height:unset;",
        ".lt2ar2q.EhHcMiw": "height:unset; max-height: unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fix-header",
      "matches": [
        "societyforpsychotherapy.org",
        "cbtm.manifestlao.com",
        "notefolio.net"
      ],
      "selectors": [
        "article header",
        "header h1",
        "header h2",
        "header h3",
        "header p",
        "header nav"
      ],
      "excludeSelectors": [
        ".site-header"
      ],
      "extraBlockSelectors": [
        ".btn"
      ],
      "injectedCss": [
        "[class*='line-clamp-'] {-webkit-line-clamp: unset!important; max-height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "floatSites",
      "matches": [
        "docs.stripe.com"
      ],
      "injectedCss": [
        ".immersive-translate-target-translation-block-wrapper {display: inline !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "flutterDev",
      "matches": [
        "docs.flutter.dev",
        "docs.flutter.cn"
      ],
      "excludeSelectors": [
        "span.expander.material-symbols",
        "span.material-symbols"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fmoviesz",
      "matches": [
        "fmovies24.to",
        "*.fmovies.co",
        "vidplay.online",
        "c8365730d4.nl",
        "kerapoxy.cc",
        "vid41c.site",
        "https://*/*sub.info=*fmovies24.to*",
        "https://*/*sub.info=*bflixhd.to*",
        "mcloud.vvid30c.site",
        "rabbitstream.net",
        "kerolaunochan.*",
        "megacloud.*",
        "netusa.xyz",
        "cdnstreame.net",
        "9animetv.to",
        "hianime.to",
        "videostr.net",
        "anthropic.skilljar.com",
        "streameeeeee.site"
      ],
      "excludeSelectors": [
        ".jw-wrapper",
        "#immersive-translate-caption-window",
        ".jw-wrapper *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "followis",
      "matches": [
        "https://app.follow.is/feeds/*"
      ],
      "excludeSelectors": [
        ".bg-native",
        "main > div > div.h-full:first-child span"
      ],
      "injectedCss": [
        "[class*='line-clamp'] {-webkit-line-clamp:unset;}"
      ],
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "folo",
      "matches": [
        "app.folo.is"
      ],
      "excludeSelectors": [
        "[role=button]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "fontFmaily",
      "matches": [
        "skyvipservices.com",
        "book.novelpia.com"
      ],
      "injectedCss": [
        "font {display:block !important;}",
        "#book-box font {font-family:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "forum.unity",
      "matches": [
        "forum.unity.com"
      ],
      "excludeSelectors": [
        ".bbCodeCode"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "forums.zotero",
      "matches": [
        "forums.zotero.org"
      ],
      "selectors": [
        ".page-sidebar",
        ".page-content"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "foxnews",
      "matches": [
        "www.foxnews.com"
      ],
      "excludeSelectors": [
        ".site-footer",
        ".components-MessageDetails-index__message-details-wrapper",
        "div[class^=SlideDown__container]",
        ".components-MessageActions-index__messageActionsWrapper",
        "span[data-openweb-allow-amp]",
        "div.spcv_typing-users"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "freecodecamp",
      "matches": [
        "www.freecodecamp.org"
      ],
      "excludeSelectors": [
        ".monaco-mouse-cursor-text",
        ".challenge-preview"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "frontendmasters",
      "matches": [
        "frontendmasters.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ft",
      "matches": [
        "www.ft.com"
      ],
      "excludeSelectors": [
        "header",
        "[aria-labelledby=cookie-banner-aria-label]",
        "footer",
        "[aria-label='Primary navigation']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "futuretools",
      "matches": [
        "www.futuretools.io"
      ],
      "globalStyles": {
        ".collection-item-6": "height: unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gagaoolala",
      "matches": [
        "www.gagaoolala.com"
      ],
      "excludeSelectors": [
        "#gl-id-video-container",
        "#gl-id-video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gaia",
      "matches": [
        "www.gaia.com"
      ],
      "excludeSelectors": [
        "video-js",
        "video-js *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ganjingworld",
      "matches": [
        "www.ganjingworld.com"
      ],
      "excludeSelectors": [
        ".vidPlayerWrap",
        ".vidPlayerWrap *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gemini.google",
      "matches": [
        "gemini.google.com"
      ],
      "injectedCss": [
        "[data-test-id=conversation] {height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "genuine",
      "matches": [
        "blog.genuine.com"
      ],
      "excludeSelectors": [
        "div.enlighter"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "getpocket",
      "matches": [
        "getpocket.com"
      ],
      "selectors": [
        "h2",
        "div.excerpt p",
        "article",
        "h1"
      ],
      "globalStyles": {
        "h2.title": "max-height:unset;-webkit-line-clamp:unset;",
        "div.excerpt p": "max-height:unset;-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gitbook",
      "selectors": [
        ".gitbook-root"
      ],
      "excludeSelectors": [
        "[spellcheck='false']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "github",
      "matches": [
        "github.com"
      ],
      "selectors": [
        "h1",
        "[aria-label=Issues] .markdown-title",
        "[aria-labelledby=discussions-list] .markdown-title",
        "h3 .markdown-title",
        ".markdown-body",
        ".Layout-sidebar p",
        "div > span.search-match",
        "li.repo-list-item p",
        "#responsive-meta-container p",
        "article p",
        "feed-container article ul li a span",
        "feed-container article .FormControl-caption",
        "div.repo-description p",
        "[itemprop=description]",
        ".integrations-auth-wrapper",
        ".new-feed-onboarding-notice",
        "article section[aria-label='card content'] > div > div > div  > div:nth-child(2)",
        ".js-notice h2, .js-notice p",
        ".TimelineItem-body a span, .TimelineItem-body a div, .TimelineItem-body form span, .TimelineItem-body form div",
        "[role=\"navigation\"] p",
        "[data-testid=\"commit-row-item\"] h4",
        ".font-mktg",
        ".search-title,.search-match",
        ".pinned-item-desc",
        "#repo-content-turbo-frame .markdown-title",
        "[app-name='blackbird-search'] [data-hpc='true']",
        ".topic-box > a > p:nth-of-type(2)",
        "[data-testid=\"listitem-title-link\"]",
        "#repo-content-turbo-frame p",
        "#repo-content-turbo-frame h4",
        "[aria-label=\"card content\"] .flex-column > div:nth-child(2)",
        "[class*=TitleHeader]",
        ".bpDald",
        ".discussion-title",
        ".copilotPreview__footer",
        ".heading-element",
        ".js-feed-item-component h3 a[data-hovercard-type=pull_request]",
        "[aria-labelledby=outline-id] nav",
        "[data-testid='issue-pr-title-link']",
        "div.user-profile-bio",
        "div.news > div.js-notice",
        "#memex-project-view-root a [class^='prc-Text-Text']",
        "[class^=OverviewContent] [class*=DirectoryRichtextContent]",
        "[id^=pullrequestreview]",
        "[class^='ChatMessage']",
        "a[data-hovercard-type='issue']",
        "[class*=prc-FormControl] > [class*=prc-Text], [class*=prc-FormControl] [class*=prc-FormControl-LabelContainer] [class*=prc-Text]",
        "[data-testid='beginners-playlist-section']",
        "[data-testid='getting-started-checklist-section']",
        "[data-testid='docs-section']",
        "[data-testid='recommendations-section']",
        ".Layout-main react-partial pre",
        ".feed-item-content section[data-view-component] [class='flex-1 d-flex flex-column'] div:nth-child(2)",
        "#org-new-form",
        ".trial-info-large",
        ".dfd-trial__container-form",
        "dialog-helper",
        ".blankslate-heading",
        ".activity-overview-box",
        "#spaces-list",
        "[class*='ContentView-module__serviceDescription']",
        ".BannerDescription",
        "copilot-user-settings",
        "h2:has(~ copilot-user-settings)",
        "div:has(~ copilot-user-settings)",
        "[class='f4 color-fg-muted col-md-6 mx-auto']",
        "[class='col-lg-9 position-relative pr-lg-5 mb-6 mr-lg-5']",
        "[class*='IssueIndexPage-module__middlePaneGrid'] div[class='p-4 text-center rounded-2 border color-border-muted']",
        "[class*='ModelsPlaygroundRoute-module__playgroundContainer']",
        "article [class='f6 color-fg-muted mt-1']"
      ],
      "excludeSelectors": [
        "[data-test-selector='commit-tease-commit-message']",
        "[data-test-selector='create-branch.developmentForm']",
        "div.Box-header.position-relative",
        "div.blob-wrapper-embedded",
        "div.Box.Box--condensed.my-2",
        "div.jp-CodeCell",
        "[aria-label=\"Account\"] .markdown-title",
        ".js-repos-container .markdown-title",
        "a.anchor",
        "div.file-navigation + div.Box",
        "[data-testid^='breadcrumbs']",
        "[data-ga-click*=Star]",
        ".markdown-body h3",
        "div.vcard-names-container",
        "div.js-disable-context-menu",
        ".BorderGrid-cell a[role='link']",
        ".BorderGrid-cell .topic-tag-link",
        "table[class*='Table-module__Box']",
        ".author,.assignee",
        ".blob-code",
        ".timeline-comment-header",
        ".review-thread-reply",
        ".codeRepository",
        "a[data-hovercard-type]",
        "[title='Label: Private']",
        "[aria-label*='language']",
        ".js-suggested-changes-blob.diff-view",
        "h1[data-component=PH_Title] span[class*='issueNumberText']",
        ".react-blob-sticky-header *"
      ],
      "stayOriginalSelectors": [
        ".issue-link"
      ],
      "extraInlineSelectors": [
        "g-emoji",
        "a.anchor"
      ],
      "extraBlockSelectors": [
        "bdi"
      ],
      "excludeMatches": [
        "https://github.com/*/*/settings",
        "https://github.com/*/*/settings/*",
        "https://github.com/settings/*",
        "https://github.com/sponsors/*",
        "https://github.com/readme/*",
        "https://github.com/readme/",
        "https://github.com/features/*",
        "https://github.com/codespaces",
        "https://github.com/customer-stories/*",
        "https://github.com/signup",
        "https://github.com/login",
        "https://github.com/marketplace",
        "https://github.com/github-copilot*",
        "https://github.com/collections*",
        "https://github.com/resources/events*",
        "https://github.com/pricing*"
      ],
      "injectedCss": [
        ".bpDald,.discussion-title {-webkit-line-clamp:unset!important;}",
        "li>div[class*='Box-sc'],div[class*='Box-sc']>button[class*='prc-Token-TokenBase'],li[class*='card-label-module']>button[class*='prc-Token-TokenBase'] {height:unset!important;}",
        "#memex-project-view-root [class*=table-row__StyledTableRow-sc],#memex-project-view-root [class*=base-cell-module__Box] {height:unset!important;}",
        "[class*='GridCard-module__description'] {-webkit-line-clamp: unset;}"
      ],
      "globalStyles": {
        ".TimelineItem-body .Link--primary": "-webkit-line-clamp: unset;"
      },
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "github-blog",
      "matches": [
        "github.blog"
      ],
      "injectedCss": [
        "font {word-break: break-all !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "githubBlog",
      "matches": [
        "github.blog"
      ],
      "globalStyles": {
        ".font-mktg": "word-break:normal;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "githubGist",
      "matches": [
        "gist.github.com"
      ],
      "selectors": [
        ".markdown-body",
        ".readme"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "githubNotebook",
      "matches": [
        "notebooks.githubusercontent.com"
      ],
      "excludeSelectors": [
        "div.jp-CodeCell"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gitlab",
      "matches": [
        "gitlab.com"
      ],
      "excludeSelectors": [
        ".tree-content-holder",
        "nav",
        ".home-panel-metadata",
        "div[data-testid=project_topic_list]",
        ".commit"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gitpod",
      "matches": [
        "www.gitpod.io/docs/*"
      ],
      "selectors": [
        ".content-docs"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "glasp",
      "matches": [
        "glasp.co"
      ],
      "excludeSelectors": [
        ".home_overview_list_content_wrapper"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "goodreads",
      "matches": [
        "www.goodreads.com"
      ],
      "excludeSelectors": [
        ".badgeYear",
        ".gr-mediaBox__desc",
        ".bookVotedRow",
        ".minirating",
        "div[itemprop='aggregateRating']",
        ".wtrButtonContainer",
        ".RatingsHistogram__labelTitle",
        ".FollowButton",
        ".siteHeader__topLevelLink",
        "#books > thead",
        "td[class*='rating']",
        "td[class*='shelves']",
        "td[class*='date_read']",
        "td[class*='date_added']",
        "td[class*='actions']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleIndex",
      "matches": [
        "https://www.google.com/",
        "https://www.google.com.hk/"
      ],
      "excludeSelectors": [
        "#gb",
        "#SIvCob"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleMail",
      "matches": [
        "mail.google.com"
      ],
      "globalStyles": {
        "[role='listitem'] > div": "height:auto!important;white-space:unset!important;"
      },
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleMeet",
      "matches": [
        "meet.google.com"
      ],
      "excludeSelectors": [
        ".iOzk7[jsname='dsyhDe']",
        ".ygicle.VbkSUe",
        ".iOzk7[jsname='dsyhDe'] *"
      ],
      "extraInlineSelectors": [
        ".ygicle.VbkSUe"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleNews",
      "matches": [
        "news.google.com"
      ],
      "excludeSelectors": [
        ".EyERq",
        ".AOl7G.eejsDc",
        "[aria-label='Home']",
        "[aria-label='For you']",
        "[aria-label='Following']",
        "[aria-label='World']",
        "[aria-label='Local']",
        ".gb_Fc",
        ".wBQf7b",
        ".yPI8Rb",
        ".jKHa4e",
        ".u43Gd",
        ".Zgjpyb",
        "[role='button']",
        "[jsname='rymPhb']",
        ".cbz1ld",
        ".VfPpkd-P5QLlc",
        ".XvhY1d",
        "time",
        ".bInasb"
      ],
      "injectedCss": [
        ".oovtQ,.MCAGUe,.To2ZZb.DbQnIe {height: unset;}",
        "h4,.IBr9hb,.gPFEn{-webkit-line-clamp: unset!important;}",
        ".cp7Yvc > h2 {display: block;}"
      ],
      "blockMinTextCount": 26,
      "blockMinWordCount": 5,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googlePlay",
      "matches": [
        "play.google.com"
      ],
      "excludeSelectors": [
        ".vlGucd",
        ".ubGTjb",
        ".page-nums"
      ],
      "globalStyles": {
        ".Epkrse": "-webkit-line-clamp:unset;",
        "div[data-g-id='description']": "-webkit-line-clamp:unset;max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleScholar",
      "matches": [
        "scholar.google.*/*",
        "scholar.google.com.*/*",
        "scholar.google.co.*/*"
      ],
      "selectors": [
        "h3 a[data-clk]",
        "div.gs_rs",
        "td a.gsc_a_at",
        "td div.gs_gray:last-of-type",
        "div.gsc_oci_value",
        "#gs_opinion",
        ".gs_rt",
        ".gsh_csp",
        ".gs_fma_wpr",
        "#gs_as_hp_main"
      ],
      "extraInlineSelectors": [
        "br"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "googleSearch",
      "matches": [
        "www.google.*/search*"
      ],
      "excludeSelectors": [
        "a h3 + div",
        "div#sfooter",
        ".b5ZQcf",
        ".CEMjEf",
        ".MgUUmf.NUnG9d",
        "#result-stats",
        "[role=navigation]",
        "div.sCuL3",
        "div.eFM0qc.BCF2pd",
        "div.WZ8Tjf",
        "div.adDDi",
        "#headerSection",
        "#rateChatDiv",
        ".title-D5Lgyj",
        "[data-attrid='VisualDigestVideoResult']",
        ".search-enhance-WDIEkP h4",
        ".SPZz6b h2",
        ".CtCigf",
        ".VLkRKc",
        ".EbH0bb",
        ".Wr0c6d",
        ".jleFbf",
        "#searchform",
        ".yg51vc",
        ".CbAZb",
        ".B6fmyf.byrV5b.Mg1HEd",
        "[class='SPa6uf Hqu6dd OSrXXb']",
        "[class='ZtihLe YrbPuc']",
        "[class='kb0PBd A9Y9g'] .TXwUJf,[class='kb0PBd cvP2Ce'] .TXwUJf",
        "[class='wep10b vDF3Oc jIrdcd'],[class='gqF9jc YrbPuc']",
        "span[data-ts]",
        "[jscontroller='UsftYd']"
      ],
      "extraBlockSelectors": [
        ".MUFPAc",
        "[role=heading]"
      ],
      "injectedCss": [
        ".V82bz,.uAKcGb,.F0FGWb,.Hdw6tb,.M1Sizc,.XVPTd,.Yt787.JGD2rd,.ITZIwc {-webkit-line-clamp: unset!important;max-height: unset!important;}",
        ".pe7FNb {-webkit-line-clamp: unset!important;}",
        ".promotion-3PDMAb {display: none!important;}",
        "div[data-content-feature='1'] > div {-webkit-line-clamp: unset!important;max-height: unset!important;}",
        "div[style='-webkit-line-clamp:*'] {-webkit-line-clamp: unset!important;max-height: unset!important;}",
        ".Pw4Ldf.RsCEN {height:unset!important;}",
        ".related-question-pair {overflow:auto!important;}"
      ],
      "blockMinTextCount": 32,
      "blockMinWordCount": 3,
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gradio-app",
      "excludeSelectors": [
        "[data-testid=\"block-label\"]",
        ".prose h1 + p",
        "#model_selector_md > div > div > span > h3",
        "table",
        ".tabs .md.svelte-8tpqd2.prose > p:nth-child(1)",
        ".tabs h4"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gradioappdocs",
      "matches": [
        "www.gradio.app/docs/*"
      ],
      "selectors": [
        "div.obj"
      ],
      "excludeSelectors": [
        "div#examples"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "graphcore",
      "matches": [
        "www.graphcore.ai"
      ],
      "excludeSelectors": [
        ".morph"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "graphpad",
      "matches": [
        "www.graphpad.com"
      ],
      "excludeSelectors": [
        "div[data-handle='captions']",
        "#immersive-translate-caption-window",
        "div[data-handle='captions'] *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ground",
      "matches": [
        "ground.news"
      ],
      "globalStyles": {
        ".line-clamp-3": "-webkit-line-clamp: unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "gta5-mods",
      "matches": [
        "www.gta5-mods.com"
      ],
      "excludeSelectors": [
        "#main-nav"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "h5_nicovideo",
      "matches": [
        "sp.*.nicovideo.*/watch/mg*"
      ],
      "excludeSelectors": [
        ".stream_comment"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hackerNews",
      "matches": [
        "news.ycombinator.com"
      ],
      "selectors": [
        ".titleline > a",
        ".comment > .commtext",
        ".toptext",
        "a.hn-item-title",
        ".hn-comment-text",
        ".hn-story-title"
      ],
      "excludeSelectors": [
        ".reply",
        ".comhead",
        ".subtext"
      ],
      "excludeMatches": [
        "https://news.ycombinator.com/submit",
        "https://news.ycombinator.com/newsfaq.html",
        "https://news.ycombinator.com/newsguidelines.html",
        "https://news.ycombinator.com/security.html"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper {content-visibility:auto;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hadoop.apache.org",
      "matches": [
        "hadoop.apache.org"
      ],
      "excludeSelectors": [
        ".xleft",
        ".xright",
        "#navcolumn"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hbomax",
      "matches": [
        "play.max.com",
        "play.hbomax.com"
      ],
      "excludeSelectors": [
        "[data-testid='playerContainer']",
        "[data-testid='CueBoxContainer']",
        "[data-testid='playerContainer'] *",
        "[data-testid='CueBoxContainer'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "healthline",
      "matches": [
        "www.healthline.com"
      ],
      "excludeSelectors": [
        ".icon-hl-trusted-source-after"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "help.maxon.net",
      "matches": [
        "help.maxon.net"
      ],
      "excludeSelectors": [
        "#contentBody"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hentai",
      "matches": [
        "e-hentai.org"
      ],
      "excludeSelectors": [
        "#i3"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hikaritv",
      "matches": [
        "boosterx.stream"
      ],
      "excludeSelectors": [
        ".jw-wrapper",
        ".jw-wrapper *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hnAlgolia",
      "matches": [
        "hn.algolia.com"
      ],
      "selectors": [
        ".Story_title > a:first-child",
        ".Story_comment > span"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hoyolab",
      "matches": [
        "www.hoyolab.com"
      ],
      "excludeSelectors": [
        ".reply-card__nickname",
        ".mhy-user-card__name",
        ".mhy-account-title__name"
      ],
      "extraBlockSelectors": [
        ".reply-card__content__detail p:first-child",
        ".reply-card-inner-reply__content > p:first-child"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hstream",
      "matches": [
        "hstream.moe"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "htdp",
      "matches": [
        "htdp.org"
      ],
      "stayOriginalSelectors": [
        ".RktIn"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "htmlLangFirst",
      "selectors": [
        "[lang=he-IL]",
        "[lang=nl-NL]",
        "[lang=ar-SA]",
        "[lang=fa-IR]",
        "[lang=fi]",
        "[lang=fi-FI]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hub.logseq",
      "matches": [
        "hub.logseq.com"
      ],
      "globalStyles": {
        "[class*=':h-[']": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hubspotvideo",
      "matches": [
        "*.hubspotvideo.com"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "huggingface",
      "matches": [
        "huggingface.co"
      ],
      "excludeSelectors": [
        "thead",
        "ul.text-base",
        "a.group > div.flex-1",
        "div.absolute.truncate",
        "nav",
        "ul[class*='dark:border-gray-800']",
        "div[class*='from-gray-100-to-white']"
      ],
      "globalStyles": {
        ".line-clamp-2": "-webkit-line-clamp:unset;max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "hulu",
      "matches": [
        "https://*.hulu.com",
        "https://*.hulu.*"
      ],
      "excludeSelectors": [
        ".PlayerMetadata__subTitle",
        ".CaptionBox"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "iaabcfoundation",
      "matches": [
        "learning.iaabcfoundation.org"
      ],
      "excludeSelectors": [
        "[data-testid=\"video-player\"]",
        "[data-testid=\"video-player\"] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ieee",
      "matches": [
        "spectrum.ieee.org"
      ],
      "extraBlockSelectors": [
        "small"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ieeexplore",
      "matches": [
        "ieeexplore.ieee.org"
      ],
      "stayOriginalSelectors": [
        "a[ref-type]",
        ".inline-formula",
        ".display-formula"
      ],
      "excludeMatches": [
        "ieeexplore.ieee.org/*/getPDF.jsp*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ietf",
      "matches": [
        "*.ietf.org/doc/html/*"
      ],
      "extraBlockSelectors": [
        "[href^='#page']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "iflix",
      "matches": [
        "www.iflix.com",
        "wetv.vip"
      ],
      "excludeSelectors": [
        ".text-track",
        ".player-wrapper *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "imdb",
      "matches": [
        "www.imdb.com",
        "m.imdb.com"
      ],
      "excludeSelectors": [
        ".jw-text-track-container",
        ".jw-text-track-container *"
      ],
      "injectedCss": [
        "[class*=overflow] {max-height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "imigresen-online",
      "matches": [
        "imigresen-online.imi.gov.my"
      ],
      "excludeSelectors": [
        "#clock"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "immersive",
      "matches": [
        "https://immersivetranslate.*",
        "https://*.immersivetranslate.*",
        "http://localhost:38001",
        "https://app.infread.com",
        "https://*.immersivetranslate.*/*"
      ],
      "excludeSelectors": [
        "#imt-navbar *",
        ".preview-original-body *",
        "#imt-navbar"
      ],
      "injectedCss": [
        ".docx-wrapper p {line-height: unset!important;}"
      ],
      "blockMinTextCount": 0,
      "blockMinWordCount": 0,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "immersive-word",
      "matches": [
        "https://*.immersivetranslate.*/word*",
        "https://*.immersivetranslate.*/*/word*",
        "https://immersivetranslate.com/*/document/word/*"
      ],
      "excludeSelectors": [
        "#imt-navbar *",
        ".preview-original-body *",
        "#imt-navbar"
      ],
      "paragraphMinTextCount": 0,
      "paragraphMinWordCount": 0,
      "blockMinTextCount": 0,
      "blockMinWordCount": 0,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "immersiveTranslateIosOnBoarding",
      "selectors": [
        "meta[name=immersiveTranslateIosOnBoarding]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "immersiveTranslateIosOnBoardingStep1",
      "selectors": [
        "meta[name=immersiveTranslateIosOnBoardingStep1]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "indeed",
      "matches": [
        "*.indeed.com"
      ],
      "globalStyles": {
        "span,.css-19rjr9w.e1wnkr790": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "indiehackers",
      "matches": [
        "www.indiehackers.com"
      ],
      "excludeSelectors": [
        ".portal-entry__date",
        ".portal-entry__byline",
        ".firestore-post__header-metadata",
        ".story__counts",
        ".story__time-ago",
        ".story__byline",
        ".partnerships__age",
        ".job__pay",
        ".author-bio__name-link",
        ".comment__footer"
      ],
      "injectedCss": [
        ".meetups__meetup-name,.partnerships__title { -webkit-line-clamp: unset!important;max-height: unset!important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "inoreader",
      "matches": [
        "www.inoreader.com",
        "*.inoreader.com"
      ],
      "selectors": [
        ".article_header_title",
        ".article_title_link",
        ".article_content",
        ".article_magazine_title_link",
        ".blog-post-page",
        "#welcome_center",
        ".gad_overview_articles_wrapper",
        ".library_article_text h4",
        ".header_name",
        ".blog-content"
      ],
      "excludeMatches": [
        "https://www.inoreader.com/features*",
        "https://www.inoreader.com/blog*",
        "https://www.inoreader.com/discover*",
        "https://www.inoreader.com/contact*",
        "https://www.inoreader.com/pricing*",
        "https://www.inoreader.com/enterprise*"
      ],
      "injectedCss": [
        ".article_title_link,.library_article_text h4,.gadget_overview_article_title,.article_magazine_title_link,.reader_pane_view_style_2 .column_view_title {-webkit-line-clamp: unset!important;max-height: unset!important;}",
        ".article_tile_content_wraper,div.article_tile {overflow:auto}",
        ".article_header_title {white-space:normal;max-height: unset!important;}",
        ".article_header_title span {display:flex !important;flex-direction: column;}",
        ".ar.article_no_thumbnail,[data-type=article] {height:unset!important;}",
        ".view_style_2 #reader_pane .ar .article_header_text .column_view_info {position:relative!important;}"
      ],
      "observeUrlChange": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "instagramMessage",
      "matches": [
        "https://www.instagram.com/direct/*"
      ],
      "selectors": [
        "div[dir=auto].html-div"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "instagramPost",
      "matches": [
        "https://www.instagram.com/p/*",
        "https://www.instagram.com/reels/*"
      ],
      "selectors": [
        "h1",
        "ul li h3+div span[dir=auto]",
        "hr+div span[dir=auto][style]",
        "div > div[dir=auto]",
        "div:not([class]) > div > div:nth-child(2)"
      ],
      "excludeSelectors": [
        "hr+div span[dir=auto][style] > span"
      ],
      "paragraphMinTextCount": 2,
      "blockMinTextCount": 1,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "internetfundamentals",
      "matches": [
        "internetfundamentals.com"
      ],
      "excludeSelectors": [
        "#vjs_video_3",
        "#immersive-translate-caption-window",
        "#vjs_video_3 *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ipinfo",
      "matches": [
        "ipinfo.io"
      ],
      "injectedCss": [
        ".text-bali-hai-primary:last-child {display:none!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "isEbook",
      "selectors": [
        "meta[name='immersive-translate-ebook-viewer'][content='true']"
      ],
      "excludeSelectors": [
        "#drop-target",
        "#drop-target h1",
        "#side-bar",
        "h1#side-bar-title"
      ],
      "extraInlineSelectors": [
        "span.dropcaps"
      ],
      "injectedCss": [
        ".immersive-translate-target-translation-block-wrapper {display:block;}"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "blockMinTextCount": 1,
      "blockMinWordCount": 1,
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "isEbookBuilder",
      "matches": [
        "https://*.immersivetranslate.*/ebook/make*",
        "https://*.immersivetranslate.*/ebook/make/*",
        "https://app.infread.com/ebook/make*",
        "http://localhost:38001/ebook/make*",
        "http://localhost:3000/*/ebook-make*",
        "https://*.immersivetranslate.*/*/*/ebook-make*",
        "https://immersivetranslate.*/*/*/ebook-make*",
        "https://immersivetranslate.com/*/document/ebook-make/*"
      ],
      "selectors": [
        "meta[name='immersive-translate-ebook-builder'][content='true']"
      ],
      "excludeSelectors": [
        "h1.notranslate",
        "#drop-target",
        "#drop-target h1",
        "#side-bar",
        "h1#side-bar-title",
        "#tool",
        ".Code",
        "[default-translate]"
      ],
      "injectedCss": [
        ".immersive-translate-target-translation-block-wrapper {display:block;}"
      ],
      "paragraphMinTextCount": 1,
      "paragraphMinWordCount": 1,
      "blockMinTextCount": 1,
      "blockMinWordCount": 1,
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "isSubtitleBuilder",
      "matches": [
        "https://*.immersivetranslate.*/subtitle*",
        "https://*.immersivetranslate.*/*/download-subtitle",
        "http://localhost:38001/*/download-subtitle*",
        "https://*.immersivetranslate.*/*/subtitle*",
        "https://immersivetranslate.com/*/document/subtitle/*",
        "https://immersivetranslate.com/*/document/download-subtitle/*"
      ],
      "selectors": [
        "meta[name='immersive-translate-subtitle-builder'][content='true']"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "iview",
      "matches": [
        "iview.abc.net.au"
      ],
      "excludeSelectors": [
        ".jwplayer",
        ".jwplayer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jable",
      "matches": [
        "https://jable.tv/*"
      ],
      "globalStyles": {
        ".title": "white-space:unset;max-height:unset;",
        ".img-box > a": "position:relative;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "janitorai",
      "matches": [
        "https://janitorai.com"
      ],
      "excludeSelectors": [
        "[data-testid=virtuoso-scroller] .css-104fsj *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "javbus",
      "matches": [
        "https://www.javbus.com/*"
      ],
      "excludeSelectors": [
        ".item-tag",
        "date"
      ],
      "globalStyles": {
        ".photo-info": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "javdb",
      "matches": [
        "https://javdb*.com/*"
      ],
      "excludeSelectors": [
        ".video-number",
        ".score",
        ".has-addons"
      ],
      "globalStyles": {
        ".video-title": "white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jddonline.com",
      "matches": [
        "jddonline.com"
      ],
      "injectedCss": [
        ".article-body {column-count:unset;-webkit-column-count:unset;-moz-column-count:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "JeffyReader",
      "selectors": [
        "br-span"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jetbrains",
      "matches": [
        "https://*.jetbrains.com"
      ],
      "excludeSelectors": [
        ".toolbar__ee8",
        "[data-test=\"left-sidebar\"]",
        ".comment__info",
        ".symbol.monospace"
      ],
      "extraBlockSelectors": [
        "[data-test=prompt]"
      ],
      "globalStyles": {
        ".card p,.card h4": "-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jfrog",
      "matches": [
        "jfrog.com"
      ],
      "stayOriginalSelectors": [
        ".readercontent-topic-codeblockcontainer"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jira",
      "matches": [
        "jira.*.com/browse/*",
        "jira.*.com/projects/*"
      ],
      "selectors": [
        "[id=descriptionmodule]",
        "[id=summary-val]",
        "div.action-body",
        "td.stsummary"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jmir",
      "matches": [
        "*.jmir.org"
      ],
      "stayOriginalSelectors": [
        ".article-content .footers"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "journals.aps",
      "matches": [
        "journals.aps.*"
      ],
      "stayOriginalSelectors": [
        "button"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jscires",
      "matches": [
        "jscires.org"
      ],
      "excludeSelectors": [
        ".jatsa_contrib_info"
      ],
      "extraBlockSelectors": [
        ".jatsauthtab_title"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jstor",
      "matches": [
        "www.jstor.org"
      ],
      "excludeSelectors": [
        ".audio-duration",
        "[data-qa='card-item-count']"
      ],
      "excludeMatches": [
        "www.jstor.org/stable/pdf*"
      ],
      "globalStyles": {
        ".card__heading": "-webkit-line-clamp:unset;",
        "search-results-vue-pharos-image-card,search-ui-pharos-image-card": "display:flex;",
        "search-results-vue-pharos-link": "display:inline;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "jwxs",
      "matches": [
        "www.jwxs.org/book/*"
      ],
      "injectedCss": [
        "#list dd { height: 5rem !important; line-height: unset !important; }",
        ".readbtn .chapterlist { margin: unset !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "kadaza",
      "matches": [
        "https://www.kadaza.com/"
      ],
      "selectors": [
        ".header span.title",
        ".custom-content-footer"
      ],
      "paragraphMinTextCount": 2,
      "paragraphMinWordCount": 1,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "kaggle",
      "matches": [
        "www.kaggle.com"
      ],
      "excludeSelectors": [
        ".sc-kHItYk.kCjSZT",
        ".sc-hagvSa.guBIfV",
        ".sc-jhZTHU.btgPPn",
        "#editor-sidebar-scroll-container"
      ],
      "injectedCss": [
        ".km-listitem--large {height:unset !important;}",
        ".km-listitem--large .jWyUHl {height:unset !important;}",
        "[role=listitem] {overflow:scroll;}",
        "[role=listitem] div {-webkit-line-clamp:unset;}",
        "[class*='km-listitem--medium'] {height:unset !important;}",
        ".MuiListItem-root a > div :nth-child(2) {height:unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "kanopy",
      "matches": [
        "*.kanopy.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "khanacademy",
      "matches": [
        "www.khanacademy.org"
      ],
      "stayOriginalSelectors": [
        ".mathjax-wrapper"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "khflix",
      "matches": [
        "khflix.com",
        "watch.globaltv.com"
      ],
      "excludeSelectors": [
        "#video-playlist",
        "#video-playlist *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "klibs",
      "matches": [
        "klibs.io"
      ],
      "excludeSelectors": [
        "[class*='styles_footerWrapper']",
        "[class*='styles_searchFilterContainerWrapper']",
        "[class*='styles_headingWrapper']",
        "[class*='styles_navigation']",
        "[class*='styles_rightSideColumnWrapper']",
        ".breadcrumb"
      ],
      "injectedCss": [
        "[class*='styles_card'] {height:unset!important; -webkit-line-clamp:unset!important; max-height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "law.mit.edu",
      "matches": [
        "law.mit.edu"
      ],
      "injectedCss": [
        "@media screen and (min-width: 768px) { .pub-header-theme-light {top:-80% !important;} }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "learningSap",
      "matches": [
        "learning.sap.com"
      ],
      "excludeSelectors": [
        ".playkit-subtitles",
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "learnopengl",
      "matches": [
        "learnopengl.com"
      ],
      "globalStyles": {
        "function": "position:relative;z-index:1000;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lecturio",
      "matches": [
        "app.lecturio.com"
      ],
      "excludeSelectors": [
        "#vjs_video_3",
        "#vjs_video_3 *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lesswrong",
      "matches": [
        "www.lesswrong.com"
      ],
      "excludeSelectors": [
        ".PostsPagePostHeader-authorAndSecondaryInfo",
        ".Answer-answerHeader",
        "time",
        ".CommentsItemMeta-root",
        ".CommentsListMeta-root",
        ".CommentsTableOfContents-tocPostedAt",
        ".CommentsTableOfContents-commentAuthor",
        ".CommentBottom-bottom"
      ],
      "extraBlockSelectors": [
        "span.commentOnSelection"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "letsjelly",
      "matches": [
        "app.letsjelly.com"
      ],
      "selectors": [
        ".message-content",
        ".h1-subject-button",
        ".cil-subject",
        ".cil-body-wrapper",
        ".text-body"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "libreddit",
      "matches": [
        "libreddit.de"
      ],
      "selectors": [
        "h2.post_title",
        ".comment_body > .md"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "linkedinFeed",
      "matches": [
        "https://linkedin.com/feed/*"
      ],
      "selectors": [
        "h1",
        ".feed-shared-update-v2__description-wrapper"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "linkin",
      "matches": [
        "*.linkedin.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "injectedCss": [
        ".linked-area * {max-height: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "live_attach_basic",
      "selectors": [
        "meta[name='immersive-translate-live-attach-basic'][content='true']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lobste",
      "matches": [
        "lobste.rs"
      ],
      "selectors": [
        ".u-repost-of",
        ".comment_text",
        ".story_text"
      ],
      "excludeMatches": [
        "https://lobste.rs/about",
        "https://lobste.rs/chat"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lookintobitcoin",
      "matches": [
        "https://www.lookintobitcoin.com/charts/*"
      ],
      "excludeSelectors": [
        "svg"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lowendtalk",
      "matches": [
        "lowendtalk.com"
      ],
      "selectors": [
        "[role=heading]",
        "h1",
        ".userContent",
        ".DismissMessage",
        ".PanelColumn",
        ".Meta-Discussion"
      ],
      "excludeSelectors": [
        ".ClearFix .Count"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "lowstresshandling",
      "matches": [
        "university.lowstresshandling.com"
      ],
      "excludeSelectors": [
        "div[data-vjs-player]",
        "div[data-vjs-player] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "luminousfox",
      "matches": [
        "www.luminousfox.com/book/*"
      ],
      "injectedCss": [
        "#detail_chapter .box_content ul li { height: unset !important; overflow: visible !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mail-yandex",
      "matches": [
        "mail.yandex.com"
      ],
      "selectors": [
        "article",
        ".Text_color_primary",
        ".mail-MessageSnippet-Item_subject"
      ],
      "globalStyles": {
        ".mail-MessageSnippet": "height: unset; line-height:unset;",
        ".immersive-translate-target-translation-block-wrapper": "margin:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mangaplus-shueisha",
      "matches": [
        "mangaplus.shueisha.*"
      ],
      "excludeSelectors": [
        ".zao-surface"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "marketsurge",
      "matches": [
        "marketsurge.investors.com"
      ],
      "excludeSelectors": [
        ".jwplayer",
        ".jwplayer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "marquee-gs",
      "matches": [
        "marquee.gs.com"
      ],
      "excludeSelectors": [
        "[class*='article-header-sub-header']",
        "[role=img]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "masterclass",
      "matches": [
        "www.masterclass.com",
        "learn.microsoft.com"
      ],
      "excludeSelectors": [
        ".mc-video--text-track",
        ".mc-video--text-track *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mastodon",
      "matches": [
        "mastodon.social",
        "mastodon.online",
        "kolektiva.social",
        "indieweb.social",
        "mastodon.world",
        "infosec.exchange"
      ],
      "selectors": [
        "div.status__content__text",
        ".about__section__body",
        ".content",
        ".form-container",
        ".account__header__extra",
        "div#mastodon"
      ],
      "isTranslateTitle": false,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mathsisfun",
      "matches": [
        "www.mathsisfun.com"
      ],
      "stayOriginalSelectors": [
        ".center.large"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "maxroll",
      "matches": [
        "maxroll.gg"
      ],
      "excludeSelectors": [
        "span[class^='text-opac'] + span[class^='text-']"
      ],
      "extraInlineSelectors": [
        ".d4t-sprite-icon",
        ".d4t-icon"
      ],
      "injectedCss": [
        "font {font-family: sans-serif !important;}",
        ".d4t-sprite-icon {display: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "medbridge",
      "matches": [
        "www.medbridge.com"
      ],
      "excludeSelectors": [
        "#player-video",
        "#player-video *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mediadelivery",
      "matches": [
        "iframe.mediadelivery.net"
      ],
      "excludeSelectors": [
        ".plyr__captions",
        "#immersive-translate-caption-window",
        ".plyr__captions *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mediaspace",
      "matches": [
        "mediaspace.illinois.edu"
      ],
      "excludeSelectors": [
        ".playkit-overlay-action ",
        ".playkit-overlay-action  *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "medici",
      "matches": [
        "www.medici.tv"
      ],
      "excludeSelectors": [
        "#player-movie-page",
        "#player-movie-page *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "medium",
      "matches": [
        "medium.com",
        "*.medium.com"
      ],
      "selectors": [
        "h1,h2,h3",
        "article section",
        "[aria-hidden='false'] pre",
        "article p",
        ".postMetaInline",
        "a .u-fontSize24",
        "pre .ha",
        "pre > div > div > div",
        "div > p > span",
        "section p,section span",
        "a div span",
        ".ppapp-form-info,.request-form",
        "meta[property='al:ios:url'][content^='medium://']"
      ],
      "excludeSelectors": [
        "[aria-label='Post Preview Reading Time']",
        ".speechify-ignore",
        "article pre",
        "pre > span"
      ],
      "injectedCss": [
        ".u-lineClamp4,.u-lineClamp3,.u-lineClamp2 {-webkit-line-clamp:unset!important;max-height:unset!important;}"
      ],
      "globalStyles": {
        "h2,h3": "-webkit-line-clamp: unset;max-height:unset;",
        "article p": "-webkit-line-clamp: unset;max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mfacebook",
      "matches": [
        "m.facebook.com"
      ],
      "selectors": [
        "div[dir=auto][style]",
        "div[dir=auto][class]",
        "span[lang]",
        "[data-pagelet=BizInboxMessengerMessageListContainer] span",
        "[data-pagelet=BizInboxContextCardDetail] span",
        "[data-type=container][data-mcomponent=MContainer][class='m displayed'] .native-text",
        "[data-mcomponent=ServerTextArea] .native-text"
      ],
      "excludeSelectors": [
        "[data-ad-comet-preview=message] [role=button]",
        "[role=button]"
      ],
      "injectedCss": [
        ".native-text.rslh {line-height:unset!important;}"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mgtv",
      "matches": [
        "w.mgtv.com"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "microsoft",
      "matches": [
        "https://apps.microsoft.com/store/detail/*"
      ],
      "globalStyles": {
        ".line-clamp": "-webkit-line-clamp:unset;max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "migadu",
      "matches": [
        "webmail.migadu.com"
      ],
      "selectors": [
        ".bodyText"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mindvalley",
      "matches": [
        "home.mindvalley.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "missav",
      "matches": [
        "https://missav.*/*"
      ],
      "excludeSelectors": [
        ".leading-normal",
        "[class='absolute bottom-1 right-1 rounded-lg px-2 py-1 text-xs text-nord5 bg-gray-800 bg-opacity-75']",
        "[class='absolute bottom-1 left-1 rounded-lg px-2 py-1 text-xs text-nord5 bg-blue-800 bg-opacity-75']"
      ],
      "globalStyles": {
        ".truncate": "white-space:unset;",
        ".overflow-y-hidden": "max-height:unset;overflow-y:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mitre",
      "matches": [
        "cwe.mitre.org"
      ],
      "globalStyles": {
        "span.list_entry": "height: unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mkdocs-material",
      "selectors": [
        "article",
        ".md-sidebar__inner",
        ".md-container[data-md-component]"
      ],
      "injectedCss": [
        ".md-sidebar__inner .immersive-translate-target-wrapper {display: inline-flex;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ml4vis",
      "matches": [
        "ml4vis.github.io"
      ],
      "excludeSelectors": [
        ".jss45"
      ],
      "globalStyles": {
        ".jss42": "height:unset;",
        ".jss44": "max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "mobalytics",
      "matches": [
        "mobalytics.gg"
      ],
      "extraInlineSelectors": [
        "p.xlpi6m9.x5qbwci.xw7yly9 span span"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "modelhub",
      "matches": [
        "https://www.modelhub.com/*"
      ],
      "globalStyles": {
        ".videoTitle": "height:unset;",
        "a": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "moltbook",
      "matches": [
        "www.moltbook.com"
      ],
      "excludeSelectors": [
        "[class='flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#7c7c7c] mb-1.5 sm:mb-2 flex-wrap']",
        "[class='flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#7c7c7c]']",
        "[class='flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group animate-fadeIn bg-gradient-to-r from-[#ffd700]/10 to-transparent hover:from-[#ffd700]/20']",
        "[class='flex flex-col items-center gap-0.5 sm:gap-1 text-center min-w-[32px] sm:min-w-[40px]']",
        "[class='bg-white border border-[#e0e0e0] rounded-lg overflow-hidden'] .p-2",
        "[class='text-xs text-[#818384] mb-2']",
        "[class='w-12 bg-[#161617] rounded-l-lg flex flex-col items-center py-3 text-sm']",
        "[class='bg-[#1a1a1b] px-4 py-3 flex items-center justify-between sticky top-[52px] z-40 rounded-t-lg border border-[#333] shadow-md']",
        "[class='flex items-center gap-3 text-xs text-[#818384]']",
        "a[class='text-[#d7dadc] font-medium hover:underline']"
      ],
      "injectedCss": [
        "[class*='line-clamp']{-webkit-line-clamp:unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "monmouthcoffee",
      "matches": [
        "www.monmouthcoffee.*"
      ],
      "excludeSelectors": [
        "#basket"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "motrix.app",
      "matches": [
        "motrix.app"
      ],
      "excludeSelectors": [
        ".download-section__right .el-tabs__nav"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "movie-web",
      "matches": [
        "movie-web.app/media*",
        "movie-web-me.vercel.app/media*",
        "*.vidbinge.com",
        "vidsrc.xyz"
      ],
      "excludeSelectors": [
        "#root",
        "#root *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "msn",
      "matches": [
        "www.msn.com"
      ],
      "excludeSelectors": [
        ".attribution",
        ".super-nav-container",
        "#follow-button",
        ".media-info-container",
        ".ad-label",
        ".provider-name",
        ".weather-container",
        ".money-info-content",
        "casual-games-card",
        ".match-data",
        ".me-stripe-container"
      ],
      "injectedCss": [
        ".root {overflow-y: scroll!important;}",
        ".heading {-webkit-line-clamp: unset!important;}",
        ".content .text {overflow-y: scroll !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "murlok",
      "matches": [
        "murlok.io"
      ],
      "injectedCss": [
        ".vi-media-object {display:flex;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nature",
      "matches": [
        "https://www.nature.com/articles/*"
      ],
      "excludeSelectors": [
        ".c-header",
        ".c-recommendations-header",
        ".c-recommendations-list-container",
        ".c-article-references__links",
        ".c-article-identifiers",
        ".c-article-author-list",
        ".c-article-metrics-bar__wrapper",
        ".c-article__pill-button",
        "#author-information-content",
        "#article-info-section",
        ".pdf-content"
      ],
      "excludeMatches": [
        "https://www.nature.com/articles/*.pdf"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper {content-visibility:auto;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nbcnews",
      "matches": [
        "www.nbcnews.com"
      ],
      "excludeSelectors": [
        ".jw-wrapper.jw-reset",
        ".jw-wrapper.jw-reset *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nebula",
      "matches": [
        "nebula.tv"
      ],
      "excludeSelectors": [
        "[data-subtitles-container='true']",
        "[data-subtitles-container='true'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nebula.starbreeze",
      "matches": [
        "https://nebula.starbreeze.com/support"
      ],
      "injectedCss": [
        "main section>div {overflow-y:scroll !important;}",
        "main section>div::-webkit-scrollbar {display: none;width: 0px;background: transparent;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "netflav",
      "matches": [
        "https://netflav*.com/*"
      ],
      "extraBlockSelectors": [
        ".genre_filter_item",
        "button"
      ],
      "globalStyles": {
        ".grid_title": "max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "netflix",
      "matches": [
        "www.netflix.com"
      ],
      "excludeSelectors": [
        ".player-timedtext",
        ".player-timedtext *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "newsminimalist",
      "matches": [
        "https://www.newsminimalist.com/"
      ],
      "extraBlockSelectors": [
        ".inline-flex"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "newyorker",
      "matches": [
        "www.newyorker.com"
      ],
      "excludeSelectors": [
        "[data-testid=PersistentTop]",
        "[data-testid=StackedNavigationHeader]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "next_westlaw",
      "matches": [
        "*.next.westlaw.com"
      ],
      "stayOriginalSelectors": [
        ".docLinkWrapper"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nextjs",
      "matches": [
        "nextjs.org"
      ],
      "injectedCss": [
        "[imt-state=dual] .styled-scrollbar ul li ul li ul li ul li a {white-space:nowrap!important;}",
        "[imt-state=dual] .styled-scrollbar ul li font.immersive-translate-target-wrapper {text-align: right;width: 100%;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nexusmods",
      "matches": [
        "www.nexusmods.com"
      ],
      "excludeMatches": [
        "https://www.nexusmods.com/games/*"
      ],
      "injectedCss": [
        "[class*='line-clamp-'] {-webkit-line-clamp: unset!important; max-height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nicovideo",
      "matches": [
        "seiga.nicovideo.*/watch/mg*"
      ],
      "excludeSelectors": [
        ".page",
        ".stream_comment"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nikkei",
      "matches": [
        "www.nikkei.com"
      ],
      "globalStyles": {
        "h3,div,span,p": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nitter",
      "selectors": [
        ".tweet-content",
        ".quote-text",
        "meta[property='og:site_name'][content='Nitter']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nmaart",
      "matches": [
        "www.nma.art"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "noon",
      "matches": [
        "www.noon.com"
      ],
      "excludeSelectors": [
        "[class*='priceContainer']",
        "[class*='ProductImageFooter']",
        "[class*='Nudges_nudges']"
      ],
      "injectedCss": [
        "[class*='ProductDetailsSection'] {-webkit-line-clamp:unset!important;}",
        "[class*='title'] {-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "notateslaapp",
      "matches": [
        "www.notateslaapp.com"
      ],
      "extraBlockSelectors": [
        ".nav > *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "notionSite",
      "matches": [
        "notion.site",
        "*.notion.site"
      ],
      "selectors": [
        ".notion-html body",
        ".notion-app"
      ],
      "excludeSelectors": [
        ".notion-code-block"
      ],
      "injectedCss": [
        "[aria-label='Templates'] font br {display:none;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "NoTranslate",
      "matches": [
        "*.tiktok.com",
        "altis.world",
        "*.newthingsunderthesun.com",
        "*.gumroad.com",
        "edstem.org",
        "actions.tldrnewsletter.com",
        "community.linkingyourthinking.com",
        "winaero.com",
        "community.afforai.com",
        "www.perplexity.ai",
        "hdsr.mitpress.mit.edu",
        "rent.men",
        "*.rwth-aachen.*",
        "www.backcountry.com",
        "intranet.alxswe.com",
        "www.steepandcheap.com",
        "whoer.is",
        "community.seniorswc.com",
        "www.skool.com",
        "sfget.jp",
        "talentcentral.eu.shl.com",
        "www.crd.york.ac.*",
        "www.campo.fau.de",
        "s.hoothin.com",
        "feedback.featurebase.app",
        "typefully.com",
        "*.affine.*",
        "*.shopify.com",
        "*.marscode.com",
        "nexus.evenant.com",
        "portal.achieve3000.net",
        "triumph-cubic.com",
        "ieeeforms.wufoo.com",
        "www.midjourney.com",
        "fifakitcreator.com",
        "app.voxy.com",
        "www.zome.*",
        "electrical-engineering-portal.com",
        "www.surveymonkey.com",
        "www.rawpixel.com",
        "mail.cstnet.cn",
        "mail.nudt.edu.cn",
        "lkml.org",
        "mail.qq.com",
        "kalimat.anghami.com",
        "changewindows.org",
        "scispace.com",
        "ww2.mathworks.cn",
        "paragon-eu.amazon.com"
      ],
      "selectors": [
        "html[translate=no]",
        "body[translate=no]",
        "body[class=notranslate]",
        "body[class^='notranslate']",
        "#app[translate=no]",
        "#root[translate=no]",
        "#editor-core-root [translate=no]",
        ".notranslate.chrome",
        ".main-content [translate=no]",
        "body.notranslate.rtb-desktop",
        ".survey-body .notranslate",
        ".ProseMirror[translate=no]",
        "#mainWrapper[translate=no]",
        "body.notranslate"
      ],
      "excludeMatches": [
        "eproofing.springer.com/*/journals/*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "novel-site",
      "matches": [
        "www.piaotia.com",
        "www.zhenhunxiaoshuo.com",
        "www.hetushu.com"
      ],
      "injectedCss": [
        ".centent ul { display: flex; }",
        ".centent ul li { height: unset !important; float: none !important; }",
        "article.excerpt { white-space: normal !important; overflow: visible !important; }",
        "#dir dd { white-space: normal !important; overflow: visible !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "npmjs",
      "matches": [
        "https://www.npmjs.com/package/*"
      ],
      "selectors": [
        "#tabpanel-readme > div:first-child"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nrk",
      "matches": [
        "tv.nrk.no"
      ],
      "excludeSelectors": [
        "tv-player[data-testid=\"tv-player\"]",
        "#immersive-translate-caption-window",
        "tv-player[data-testid=\"tv-player\"] *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "nytimes",
      "matches": [
        "www.nytimes.com"
      ],
      "excludeSelectors": [
        "#app > div > div > header",
        "#app > div > div > div > div > header",
        "#in-story-masthead",
        "[data-testid=masthead-container]",
        "[data-testid=user-header]",
        "[data-testid^='recommend-button']",
        "[data-testid=copy-link]",
        ".css-mydst6 > a"
      ],
      "injectedCss": [
        "a::after {position:relative!important;}",
        "footer {line-height: unset!important;;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ocrtraining",
      "matches": [
        "ocrtraining.cit.nih.gov",
        "videocast.nih.gov"
      ],
      "excludeSelectors": [
        "#videocastPlayer",
        "#videocastPlayer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "oldReddit",
      "matches": [
        "old.reddit.com/*/.compact",
        "old.reddit.com/.compact",
        "www.reddit.com/*/.compact",
        "www.reddit.com/.compact"
      ],
      "selectors": [
        ".title > a",
        ".usertext-body"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ollama",
      "matches": [
        "ollama.com"
      ],
      "excludeSelectors": [
        "#file-explorer",
        "span[x-test-search-response-title]",
        "a[x-test-model-name]",
        "span[x-test-size]",
        "span[x-test-capability]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "openaiDocs",
      "matches": [
        "https://platform.openai.com/docs*"
      ],
      "excludeSelectors": [
        ".pheader"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "openrouter",
      "matches": [
        "openrouter.ai"
      ],
      "excludeSelectors": [
        ".line-clamp-1.text-lg",
        ".text-muted-foreground.text-sm.col-span-4.text-right",
        "div[title='Tokens this week']",
        ".text-green-600.font-medium",
        ".text-xl.text-slate-11",
        "button[role='tab']",
        "[data-badge-type=http-method]",
        "div[role='region'] > div > ul"
      ],
      "globalStyles": {
        "button.text-primary-foreground": "height: 100%;white-space: normal;word-wrap: break-word;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "orchestraltools",
      "matches": [
        "www.orchestraltools.com"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper *, .immersive-translate-target-wrapper {font-size: inherit !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "orvehogar",
      "matches": [
        "www.orvehogar.com"
      ],
      "injectedCss": [
        "h3.vtex-product-summary-2-x-productNameContainer{height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "osmosis",
      "matches": [
        "*.osmosis.org"
      ],
      "excludeSelectors": [
        "#video-player-container",
        "#immersive-translate-caption-window",
        "#video-player-container *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "other-chatapps",
      "matches": [
        "app.salesmartly.com/chat"
      ],
      "selectors": [
        ".chat__inbox_item_text_ordinary",
        ".ivu-tooltip [title]"
      ],
      "injectedCss": [
        "._ss_2FLBr4_u {height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "otherGoogle",
      "matches": [
        "*.google.com",
        "dart.dev",
        "*.google",
        "*.googleapis.com"
      ],
      "excludeSelectors": [
        ".o_35",
        "[style*='Google Symbols']",
        "md-icon-button",
        ".material-symbols-outlined",
        ".cfc-result-card-table",
        ".material-symbols",
        ".gemini-large-text__overlay",
        "code",
        "view-line",
        "#modelSelector",
        ".leaderboard-content",
        "#selected-count",
        "#selected-cat"
      ],
      "extraInlineSelectors": [
        "ms-cmark-node > strong > ms-cmark-node",
        "p ms-cmark-node",
        "span > button"
      ],
      "injectedCss": [
        ".scSearchSearch_results_listSearchresultslistsnippet { -webkit-line-clamp:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "otherInstagram",
      "matches": [
        "https://www.instagram.com/*"
      ],
      "selectors": [
        "h1",
        "article span[dir=auto] > span[dir=auto]",
        "._ab1y",
        "ul li h3+div span[dir=auto]",
        "hr+div span[dir=auto][style]",
        "span[dir=auto] > div > span",
        "div > h1[dir=auto]",
        ".x1fkh5qu.x1ddbhtg.x1dlrdel",
        "a[href*='explore/locations/']"
      ],
      "excludeMatches": [
        "https://www.instagram.com/b/*"
      ],
      "paragraphMinTextCount": 2,
      "blockMinWordCount": 1,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "otherMathSites",
      "selectors": [
        "math",
        "mjx-container",
        "[class*='MathJax']",
        "[class*='math-']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "otherOldReddit",
      "matches": [
        "old.reddit.com"
      ],
      "selectors": [
        "p.title > a",
        "[role=main] .md-container",
        ".media-gallery .usertext",
        ".expando .usertext",
        ".res-expando-box .md"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "outlook",
      "matches": [
        "outlook.live.com"
      ],
      "excludeSelectors": [
        ".jHAG3.XG5Jd",
        ".OZZZK",
        ".lDdSm",
        ".ZfoST.VlT6S.azUpZ",
        ".GssDD,.xpAva,.oHwUF,.D1eg_",
        "[id=CenterRegion]",
        "[id=RibbonRoot]",
        "[role=toolbar]",
        ".qQbyL,.bkYAr,.gpJ9q,.threeColumnCirclePersonaDivWidth",
        "[class='_rWRU Ejrkd qq2gS D8iyG']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "overflow-sites",
      "matches": [
        "www.highfrequencyelectronics.com",
        "www.uzh.ch",
        "www-mail.icloud-sandbox.com",
        "*.cpaaustralia.com.*",
        "www.8du8.net/*",
        "ieltscat.xdf.*",
        "moddota.com",
        "www.nogizaka46.com"
      ],
      "injectedCss": [
        "#main-content {overflow:unset;}",
        ".TextImage--inner {overflow:auto !important;}",
        "body{overflow-y:scroll!important;}",
        "li.expanded > div{ overflow:scroll; }",
        ".book_list ul li { height: unset !important; overflow: visible !important; }",
        "#tabs-content-wrap {overflow:scroll;}",
        ".ReactVirtualized__Grid__innerScrollContainer {overflow:scroll!important;}",
        ".b--wrap {overflow:scroll!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "panopto",
      "matches": [
        "southampton.cloud.panopto.eu_no_subitle"
      ],
      "excludeSelectors": [
        ".primaryPlayer",
        ".primaryPlayer *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "paramountplus",
      "matches": [
        "*.paramountplus.com"
      ],
      "excludeSelectors": [
        ".aa-player-skin",
        ".aa-player-skin *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "patreon",
      "matches": [
        "www.patreon.com"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pbs",
      "matches": [
        "*.pbs.org"
      ],
      "excludeSelectors": [
        ".wrapper",
        "#immersive-translate-caption-window",
        ".wrapper *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pdf",
      "matches": [
        "https://app.immersivetranslate.*/pdf",
        "https://test-app.immersivetranslate.*/pdf",
        "https://app.immersivetranslate.*/pdf/*",
        "https://test-app.immersivetranslate.*/pdf/*",
        "https://immersivetranslate.com/*/document/pdf/*",
        "https://app.infread.com/pdf/*",
        "http://localhost:38001/pdf*"
      ],
      "selectors": [
        "#viewerContainer p",
        "meta[name='immersive-translate-pdf-viewer'][content='true']"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper {display: contents!important;position:absolute;}",
        ".immersive-translate-target-wrapper br {display: none;!important;}",
        ".immersive-translate-target-wrapper span {position: relative;!important;}",
        ".immersive-translate-error-wrapper {padding:0px !important;margin:0px !important;}",
        ".immersive-translate-target-translation-block-wrapper {display: unset!important;}",
        ".immersive-translate-target-inner div div {border:unset!important;padding:0!important;}",
        ".immersive-translate-target-wrapper[dir='rtl'] {text-align: right;display: inline-block!important;position:unset;}"
      ],
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "excludeSelectorsRegexes": {
        "p": [
          "/^$/"
        ]
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "peacocktv",
      "matches": [
        "*.peacocktv.com"
      ],
      "injectedCss": [
        ".video-player__subtitles__line > font,.video-player__subtitles__line:only-child{display:block;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "perplexity",
      "matches": [
        "https://www.perplexity.ai"
      ],
      "excludeSelectors": [
        "[data-framer-name='Desktop']"
      ],
      "stayOriginalSelectors": [
        "a.citation",
        "[class='my-md pb-xs pt-sm']"
      ],
      "excludeMatches": [
        "https://www.perplexity.ai/hub/*",
        "https://www.perplexity.ai/*/hub/*",
        "https://www.perplexity.ai/onboarding",
        "https://www.perplexity.ai/enterprise*",
        "https://www.perplexity.ai/2024recap"
      ],
      "globalStyles": {
        "[class*=line-clamp]": "-webkit-line-clamp: unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "piAi",
      "matches": [
        "pi.ai/talk"
      ],
      "globalStyles": {
        "[class*='text-brand-green']": "flex-direction:column;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pinboard",
      "matches": [
        "pinboard.in"
      ],
      "injectedCss": [
        "div.blurb_box,div.homepage_quad,div.signup_button {height: unset !important;}",
        "h1.magazine_title {line-height: 1.2 !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pixiv",
      "matches": [
        "www.pixiv.net"
      ],
      "injectedCss": [
        "[id*='expandable-paragraph'] {max-height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pkg",
      "matches": [
        "https://pkg.go.dev/*"
      ],
      "selectors": [
        "div.UnitDetails",
        "#_nav_group_README",
        "p.SearchSnippet-infoLabel",
        ".go-Container"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pkgStd",
      "matches": [
        "https://pkg.go.dev/std"
      ],
      "selectors": [
        "td.UnitDirectories-desktopSynopsis"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "plati",
      "matches": [
        "plati.market"
      ],
      "injectedCss": [
        ".card .custom-link{-webkit-line-clamp: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "player.vimeo",
      "matches": [
        "https://player.vimeo.com/video/*",
        "www.physeo.com"
      ],
      "selectors": [
        "iframe[src*='player.vimeo.com']"
      ],
      "excludeSelectors": [
        ".vp-captions-line",
        ".vp-captions *",
        ".vp-captions-line *"
      ],
      "extraBlockSelectors": [
        "span.vp-captions-line",
        "span[class^=CaptionsRenderer_]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pluto",
      "matches": [
        "pluto.tv"
      ],
      "excludeSelectors": [
        ".video-player-layout",
        ".video-player-layout *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "podcasts",
      "matches": [
        "podcasts.apple.com"
      ],
      "excludeSelectors": [
        ".detailed-play-button-wrapper"
      ],
      "injectedCss": [
        ".multiline-clamp { display: flex!important;flex-direction: column; }",
        ".headings__title,.powerswoosh__title,[data-testid=truncate-text] {-webkit-line-clamp:unset!important;}",
        ".show-artwork {height:fit-content!important;}",
        ".powerswoosh__lockup-details-container,.powerswoosh__chin,[data-testid=amp-review__text] {max-height:unset!important;height:unset!important;}",
        ".episode-hero__overlay {overflow:auto!important;}",
        "ul .multiline-clamp {display:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "poe",
      "matches": [
        "https://poe.com/*"
      ],
      "excludeSelectors": [
        ".Markdown_markdownContainer__Tz3HQ *",
        ".MarkdownLink_linkifiedLink__KxC9G",
        "menu",
        "aside"
      ],
      "globalStyles": {
        "[class^='BotListItem_botDescription']": "-webkit-line-clamp: unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "poeditor",
      "matches": [
        "https://poeditor.com/projects/*"
      ],
      "selectors": [
        ".comment-body",
        ".reference_language .source-string"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "polymarket",
      "matches": [
        "polymarket.com"
      ],
      "excludeSelectors": [
        "number-flow-react",
        "button",
        "a.inline-flex"
      ],
      "injectedCss": [
        "div[data-index] p.decoration-2 {-webkit-line-clamp:unset;}",
        "div[data-index] .items-start.relative.gap-2.px-3.flex.w-full {height:unset; max-height:unset;}",
        "div[data-index] .absolute.w-full {overflow:scroll;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pornhub",
      "matches": [
        "*.pornhub.com",
        "pornhub.com"
      ],
      "extraBlockSelectors": [
        ".trendingNow",
        ".searchItem",
        ".tagcloud > a"
      ],
      "excludeMatches": [
        "*.pornhub.com/insights/*",
        "pornhub.com/insights/*"
      ],
      "globalStyles": {
        "span.title": "height:unset; max-height:unset;",
        ".detailedInfo": "max-height:unset;",
        ".pcVideoListItem": "max-height:unset;",
        ".wrap": "height:unset;",
        ".entry-header": "height:unset;",
        ".entry-title > a": "height:unset;-webkit-line-clamp:unset;"
      },
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "preSites",
      "matches": [
        "mail.163.com",
        "mail.jabber.org",
        "antirez.com",
        "patchwork.kernel.org",
        "lists.apache.org",
        "manned.org",
        "bugs.webkit.org",
        "bugzilla.mozilla.org",
        "scriptbin.works",
        "bugs.gentoo.org",
        "lwn.net/Articles/*",
        "docs.haproxy.org",
        "*.freebsd.org",
        "www.oreilly.com/openbook/opensources/book/*",
        "gamefaqs.gamespot.com",
        "bugs.java.com/bugdatabase/view_bug.do",
        "rachelsenglish.com",
        "privatter.net",
        "www.asuswrt-merlin.net",
        "tic80.com",
        "www.impo.*",
        "sotf-mods.com",
        "www.bls.gov",
        "www.sreality.cz",
        "alar.95chat.cloud",
        "novel.prcm.jp",
        "im.jinritemai.com",
        "lftp.yar.ru",
        "*.mercadolibre.com",
        "corpus-texmex.irisa.*",
        "www.imageen.com",
        "seller-id.tokopedia.com",
        "tortoisegit.org",
        "www.dove.com",
        "man7.org",
        "phrack.org"
      ],
      "selectors": [
        "pre.changelog"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "primevideo",
      "matches": [
        "www.primevideo.com",
        "https://*.amazon.co.*/*video*",
        "https://*.amazon.com/*video*",
        "https://*.amazon.*/*video*"
      ],
      "excludeSelectors": [
        "#dv-web-player",
        "#dv-web-player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pro-pdf-immersive",
      "matches": [
        "https://*.immersivetranslate.*/pdf-pro*",
        "https://immersivetranslate.com/*/document/pdf-pro/*"
      ],
      "excludeSelectors": [
        ".mmd-context-menu",
        ".preview-original-body *",
        "#imt-navbar"
      ],
      "extraInlineSelectors": [
        ".sub-table",
        ".sub-table td",
        ".sub-table tr"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper {white-space: unset;}",
        "[data-immersive-translate_rtl] .immersive-translate-target-translation-block-wrapper {width:100%}",
        "* {text-decoration:unset;}"
      ],
      "detectParagraphLanguage": true,
      "excludeSelectorsRegexes": {
        "[class='inline-tabular'] > table > tbody > tr > td": [
          "/^[A-Z0-9\\-_.]+$/g",
          "^[0-9,]+\\s+tokens$",
          "^Up to [a-zA-Z]*\\s+\\d*$",
          "^(/[A-Z0-9\\-_.]+)+$"
        ]
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "producthunt",
      "matches": [
        "www.producthunt.com"
      ],
      "excludeSelectors": [
        ".styles_extraInfo__Xs_5Y",
        "[data-test=\"show-more-shoutouts-button\"]",
        ".styles_buttons__kKy_S",
        ".styles_count___6_8F"
      ],
      "excludeMatches": [
        "https://www.producthunt.com/stories/*"
      ],
      "globalStyles": {
        "h5 + p": "height:unset;",
        ".noOfLines-1,.noOfLines-2,.noOfLines-3,.styles_noOfLines-2__k_Ta_,[data-test=\"post-name-481116\"]": "-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "proko",
      "matches": [
        "www.proko.com"
      ],
      "excludeSelectors": [
        ".proko-preview-statistic-wrap",
        ".lesson-instructors-wrap",
        ".proko-comments-item-title",
        ".proko-comments-item-vote-wrap",
        ".course-card__details .border-outline075",
        ".category-subscribe"
      ],
      "injectedCss": [
        ".lesson-video-banner-skip,.lesson-title,.lesson-content,.course-card__details {height:unset!important;overflow:scroll;}",
        "[class*='clamp'],.course-card__description{-webkit-line-clamp:unset!important;overflow:unset;}",
        "proko-button{z-index:1;}",
        ".truncate {white-space:unset;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "promptingguide",
      "matches": [
        "www.promptingguide.ai"
      ],
      "selectors": [
        "article",
        "li"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pubmed",
      "matches": [
        "pubmed.ncbi.nlm.nih.gov",
        "pubmed*.pubmed*",
        "*.ncbi.nlm.nih.gov"
      ],
      "excludeSelectors": [
        ".docsum-journal-citation",
        ".citation-part",
        ".docsum-authors",
        ".top-wrapper",
        ".article-source",
        ".citation-doi",
        ".identifiers",
        ".cite",
        ".share",
        ".arrow-link",
        ".multiple-results-actions",
        ".sort-dropdown .option-label",
        ".display-options .button-label",
        ".actions-buttons.sidebar",
        ".title-copy",
        "#Scholarscope_HighlightContent",
        "#Scholarscope_HighlightContent span"
      ],
      "extraBlockSelectors": [
        ".mixed-citation"
      ],
      "excludeMatches": [
        "*.ncbi.nlm.nih.gov/*.pdf",
        "pubmed*.pubmed*/*.pdf"
      ],
      "injectedCss": [
        "#Scholarscope_HighlightOrigin > p font,#Scholarscope_HighlightContent > p font {display: inline!important;}",
        "#Scholarscope_HighlightOrigin > p font br,#Scholarscope_HighlightContent > p font br {display: none!important;}",
        ".title-translate {display:block;}",
        ".immersive-translate-target-inner br{display:none;}",
        ".immersive-translate-target-wrapper {content-visibility:auto;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pubs.acs.org",
      "matches": [
        "pubs.acs.org"
      ],
      "excludeSelectors": [
        ".articleHeaderDropzone2",
        "header"
      ],
      "excludeMatches": [
        "pubs.acs.org/doi/pdf*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pubs.rsc.org",
      "matches": [
        "pubs.rsc.org"
      ],
      "stayOriginalSelectors": [
        "[class*='eqn']"
      ],
      "excludeMatches": [
        "https://pubs.rsc.org/*/articlepdf/*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "pytorch",
      "matches": [
        "pytorch.org"
      ],
      "excludeSelectors": [
        ".with-down-arrow",
        ".hello-bar",
        "[data-cta='join']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "qidian",
      "matches": [
        "www.qidian.com"
      ],
      "extraBlockSelectors": [
        ".type-list a"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "qqMail",
      "matches": [
        "*.mail.qq.com"
      ],
      "excludeSelectors": [
        ".xmail-cmp-account"
      ],
      "globalStyles": {
        ".mail-list-page-wide-item": "height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "quantinsti",
      "matches": [
        "quantra.quantinsti.com"
      ],
      "excludeSelectors": [
        "#vjs_video_3",
        "#vjs_video_3 *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "quark",
      "matches": [
        "pan.quark.*"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "queenslibrary.org",
      "matches": [
        "queenslibrary.org"
      ],
      "excludeSelectors": [
        "#Web-QBPL-Menu"
      ],
      "injectedCss": [
        "font.notranslate { all: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "quora",
      "matches": [
        "*.quora.com",
        "quora.com"
      ],
      "excludeSelectors": [
        ".dom_annotate_multifeed_bundle_AskQuestionPromptBundle",
        ".dom_annotate_feed_switcher",
        "[class='q-box qu-py--small qu-color--gray_light']",
        "[class='q-box spacing_log_answer_header']",
        "[class='q-box qu-flex--auto']",
        "[class='q-text qu-dynamicFontSize--small qu-mt--small qu-color--gray_light qu-passColorToLinks']",
        ".AnswerFooter___StyledFlex-sc-2xbo88-0",
        "[class='q-box qu-mb--small']",
        "button.q-click-wrapper",
        "[class='q-text qu-dynamicFontSize--tiny qu-pb--tiny qu-mt--small qu-color--gray_light qu-passColorToLinks']",
        "[class='q-text qu-dynamicFontSize--tiny qu-mt--small qu-color--gray_light qu-passColorToLinks']",
        ".qt_read_more",
        "[class='q-flex qu-alignItems--flex-start']",
        "[class='q-box qu-pl--tiny']",
        ".qu-zIndex--action_bar"
      ],
      "globalStyles": {
        ".qu-truncateLines--3": "-webkit-line-clamp: unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "react",
      "matches": [
        "react.dev"
      ],
      "injectedCss": [
        "[class*='h-\\[40px\\]'] {height: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "read.amazon",
      "matches": [
        "read.amazon.com"
      ],
      "extraInlineSelectors": [
        "span.kg-a11y-rel[role=text]"
      ],
      "injectedCss": [
        "font { color:#333!important; white-space: pre-wrap;}",
        "p > font { position:absolute;left:0;right:0; }",
        ".kg-a11y-rel { background:white!important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "readwise",
      "matches": [
        "read.readwise.io"
      ],
      "selectors": [
        "div[class^='_titleRow_']",
        "#document-text-content"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "realpython",
      "matches": [
        "realpython.com"
      ],
      "selectors": [
        "h1",
        "h2",
        ".my-0",
        ".my-1",
        ".article-body",
        "table-of-contents",
        "#disqus_recommendations"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "rebang",
      "matches": [
        "rebang.today"
      ],
      "globalStyles": {
        ".multirow-ellipsis-3": "-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "reddit",
      "matches": [
        "*.reddit.com/*"
      ],
      "selectors": [
        "#search-results-tab-slot",
        "h1",
        ".PostHeader__post-title-line",
        "[data-click-id=body] h3",
        "[data-click-id=background] h3",
        "[data-testid=comment]",
        "[data-adclicklocation='title'] h3",
        "[data-testid='post-title-text']",
        "[data-testid=search-subreddit-desc-text]",
        "[slot=comment]",
        "[data-adclicklocation=media]",
        ".PostContent",
        ".post-content",
        ".Comment__body",
        "faceplate-batch .md",
        "[slot=text-body]",
        "p.title > a",
        "[role=main] .md-container",
        "#-post-rtjson-content",
        ".RichTextJSON-root",
        "[slot='title']",
        ".room-message-text",
        "[source=re_reddit] div > a.text-neutral-content-weak",
        "#response-container",
        "#streaming-response",
        "[noun='recommendation']",
        "#subgrid-container h1, #subgrid-container h2",
        ".i18n-subreddit-description",
        "#response-container_streaming",
        "search-telemetry-tracker > a.text-neutral-content-strong",
        "span[data-testid='guides-title']",
        ".rendererd-rtjson > p",
        "community-recommendation p"
      ],
      "excludeSelectors": [
        ".text-neutral-content-weak"
      ],
      "excludeMatches": [
        "https://www.reddit.com/r/*/wiki/*",
        "https://www.reddit.com/settings/*",
        "https://www.reddit.com/message/sent/*"
      ],
      "globalStyles": {
        "div.XPromoBottomBar": "display:none",
        "[class*='line-clamp']": "-webkit-line-clamp: unset"
      },
      "paragraphMinTextCount": 5,
      "paragraphMinWordCount": 2,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "redditList",
      "matches": [
        "https://www.reddit.com/r/*/comments/*/*",
        "https://www.reddit.com/",
        "https://www.reddit.com/hot/",
        "https://www.reddit.com/new/",
        "https://www.reddit.com/top/"
      ],
      "selectors": [
        "h1",
        ".PostHeader__post-title-line",
        "[data-click-id=body] h3",
        "[data-click-id=background] h3",
        "[data-testid=comment]",
        "[data-adclicklocation='title'] h3",
        "[data-adclicklocation=media]",
        "[data-testid='post-title-text']",
        ".PostContent",
        ".post-content",
        ".Comment__body",
        "faceplate-batch .md",
        "[slot=comment]",
        ".RichTextJSON-root",
        "[slot=title]",
        "[slot=text-body]",
        "p.title > a",
        "[role=main] .md-container",
        ".room-message-text",
        ".crosspost-title",
        "div.md[id^=t3_]",
        ".pt-md"
      ],
      "excludeSelectors": [
        "shreddit-comment-action-row",
        "faceplate-hovercard"
      ],
      "excludeMatches": [
        "https://www.reddit.com/r/*/wiki/*"
      ],
      "globalStyles": {
        "div.XPromoBottomBar": "display:none",
        "[class*='line-clamp']": "-webkit-line-clamp: unset",
        "a.pointer-events-none": "pointer-events: unset",
        "a.absolute.inset-0": "inset: unset !important;"
      },
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "remove_em",
      "matches": [
        "git-scm.com",
        "models.com"
      ],
      "stayOriginalSelectors": [
        "em"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "researchgate",
      "matches": [
        "www.researchgate.net"
      ],
      "excludeSelectors": [
        ".nova-legacy-v-publication-item__meta-data",
        ".nova-legacy-v-publication-item__person-list",
        ".js-authors-list"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "reuters",
      "matches": [
        "www.reuters.com"
      ],
      "excludeSelectors": [
        "[promotext]",
        "[data-testid=Leaderboard]",
        "[data-testid=HomeTickerV2]",
        "[data-testid=SiteFooter]",
        "[class^=refinitiv-promo-bar__container]",
        "[data-testid=ResponsiveAdSlot]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "rmit",
      "matches": [
        "www.rmit.edu.au"
      ],
      "injectedCss": [
        ".colfeature-content{height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "rtve",
      "matches": [
        "www.rtve.*"
      ],
      "injectedCss": [
        ".errorHead * {font-size: 3.2rem!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ru-sites",
      "matches": [
        "www.wildberries.ru",
        "www.ozon.ru"
      ],
      "excludeSelectors": [
        ".product-card__tip--sale",
        ".price,[class^=priceWrap]",
        ".j-big-media-placements-block",
        "[class^='priceBlock'],[class^='product-card__rating'],[class^=productLinePrice],[class^=sizesList]",
        ".c35_3_16-a0,.pdp_jb1,.b5_6_3-a3,.tsHeadline600Large,.tsHeadline500Medium"
      ],
      "injectedCss": [
        ".product-page,.comment-card,.comment-card__message {block-size:unset!important;}",
        "[class^=supplierName],[class^=supplierName] * {white-space:unset;}",
        "[class*=categoryLinkNav] {width:min-content;}",
        ".bq03_5_3-a6,.bq03_5_3-a5,.a2p5_6_9-a0 {-webkit-line-clamp:unset!important;height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "runoob",
      "matches": [
        "www.runoob.com"
      ],
      "excludeSelectors": [
        ".example_code"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sakura",
      "matches": [
        "www.sakura.fm"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper, .immersive-translate-target-translation-block-wrapper, .immersive-translate-target-inner span { opacity: 1 !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "scholar.cnki.net",
      "matches": [
        "scholar.cnki.net"
      ],
      "injectedCss": [
        ".result .searchItem {height: auto!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "science",
      "matches": [
        "www.science.org"
      ],
      "excludeSelectors": [
        ".core-self-citation",
        ".contributors"
      ],
      "stayOriginalSelectors": [
        ".open-in-viewer"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sciencedirect",
      "matches": [
        "www.sciencedirect.com"
      ],
      "excludeSelectors": [
        ".bibliography",
        ".author-group"
      ],
      "stayOriginalSelectors": [
        "span.display",
        "span.math"
      ],
      "extraBlockSelectors": [
        "span.display",
        "span.captions",
        "span[id^=cap]"
      ],
      "excludeMatches": [
        "www.sciencedirect.com/*/pdf/download/*"
      ],
      "injectedCss": [
        "h2 {font-size:unset;}",
        ".u-clamp-2-lines {-webkit-line-clamp:unset!important;}",
        ".immersive-translate-target-wrapper {content-visibility:auto;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "scmp",
      "matches": [
        "www.scmp.com"
      ],
      "globalStyles": {
        ".topic__article-list": "height: unset;",
        ".adverisers__adveriser": "height: unset;",
        ".advertiser__content": "height: unset;",
        ".content-title__link": "display:unset;overflow:unset;-webkit-line-clamp:unset;",
        ".title__text": "max-height:unset; -webkit-line-clamp:unset;",
        ".news-list-item__news-title": "max-height:unset; -webkit-line-clamp:unset;",
        "a[class*='link'] > .link__headline": "max-height:unset; -webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "scrimba",
      "matches": [
        "scrimba.com"
      ],
      "injectedCss": [
        "[class*='trunc'] {-webkit-line-clamp: unset !important;}",
        ".tile {overflow: scroll;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sdk-cooperate",
      "matches": [
        "pandaily.com"
      ],
      "excludeSelectors": [
        "[data-discover]",
        "header"
      ],
      "extraInlineSelectors": [
        "h3"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "section.blog.naver.com",
      "matches": [
        "section.blog.naver.com"
      ],
      "excludeSelectors": [
        ".comments",
        ".time"
      ],
      "extraBlockSelectors": [
        ".item",
        ".heading a",
        ".info_find a"
      ],
      "globalStyles": {
        ".text,.title_post,.text_post,p,strong,div": "-webkit-line-clamp:unset;max-height:unset;height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "seekingalpha",
      "matches": [
        "seekingalpha.com/article/*",
        "seekingalpha.com/news/*"
      ],
      "selectors": [
        "[data-test-id=card-container]",
        "[data-test-id=comments-section]"
      ],
      "excludeSelectors": [
        "[data-test-id=post-page-meta]",
        "header > div:first-child"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "seller-tiktok",
      "matches": [
        "seller.tiktok.com",
        "seller-my.tiktok.com",
        "affiliate.tiktok*.com",
        "seller.*.tiktokglobalshop.com",
        "seller.tiktokshopglobalselling.com"
      ],
      "excludeSelectors": [
        ".chatd-message-userName"
      ],
      "injectedCss": [
        "[data-tid=m4b_overflow_text_multiply] {height:unset!important;-webkit-line-clamp:unset!important;}",
        "[class^=replyText],[class^=productItemInfo],[class^=reviewText] {height:unset!important;-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sentry",
      "matches": [
        "docs.sentry.io"
      ],
      "extraInlineSelectors": [
        ".term-wrapper",
        "span.description"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "service-now",
      "matches": [
        "*.service-now.com"
      ],
      "selectors": [
        "article",
        ".email-content",
        "section"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "shangpaAcademy",
      "matches": [
        "shangpa-academy.mn.co"
      ],
      "excludeSelectors": [
        ".mighty-video-player-container",
        ".mighty-video-player-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "shonenjumpplus",
      "matches": [
        "shonenjumpplus.com",
        "viewer.heros-web.com",
        "comic-days.com",
        "www.corocoro.jp",
        "tonarinoyj.jp",
        "rimacomiplus.jp",
        "kuragebunch.com",
        "comic-gardo.com",
        "ichicomi.com",
        "rookie.shonenjump.com"
      ],
      "selectors": [
        "img.page-image.js-page-image"
      ],
      "injectedCss": [
        "[class^='Original_section_title'] {overflow:hidden!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "shopee",
      "matches": [
        "seller.shopee.*",
        "shopee.*"
      ],
      "injectedCss": [
        ".WBVL_7,.ellipsis-content {-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "skillshare",
      "matches": [
        "www.skillshare.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "skinstore",
      "matches": [
        "www.skinstore.com"
      ],
      "excludeSelectors": [
        ".responsiveFlyoutMenu_levelOneLink"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "skool",
      "matches": [
        "www.skool.com"
      ],
      "excludeSelectors": [
        "[class^=styled__ShowMore]",
        "[class^=styled__UserNameText]",
        "[class^=styled__GroupNameWrapper]",
        "[class^=styled__ButtonWrapper]",
        "[class^=styled__LeaderboardsPreviewTitle]",
        "[class^=styled__ExpandRepliesWrapper]",
        "[class^=styled__GroupFeedLinkLabel]",
        "[class^=styled__HeaderLinks]",
        "[class^=styled__RecentActivityLabel]",
        "[class^=styled__PostedDate]",
        "[class^=styled__MemberInfo]",
        "[class^=styled__UserRoleTag]",
        "[class^=styled__DateAndLabelWrapper]",
        "[class^=styled__PinnedOverlay]",
        "[class^=styled__CommentsCount]",
        "[class^=styled__LastMessageTime]",
        "[class^=styled__LikeLabel]",
        "[class^=styled__TypographyWrapper]",
        "[class^=styled__MemberPercentage]",
        "[class^=styled__LevelBlockTitle]"
      ],
      "injectedCss": [
        ".erGJuk {max-height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "slack",
      "matches": [
        "*.slack.com"
      ],
      "selectors": [
        ".p-rich_text_block",
        ".p-message_pane__foreword",
        ".c-alert__message",
        "[data-qa=message_attachment_text]"
      ],
      "stayOriginalSelectors": [
        "[data-qa=emoji]"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "slideslive",
      "matches": [
        "slideslive.com"
      ],
      "excludeSelectors": [
        ".slp__video",
        ".slp__video *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "smokingbehindthesupermarket.com",
      "matches": [
        "smokingbehindthesupermarket.com"
      ],
      "selectors": [
        "div.post-single-content#content"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "smzdm",
      "matches": [
        "www.smzdm.com"
      ],
      "excludeSelectors": [
        ".z-highlight",
        ".feed-block-info",
        ".z-feed-foot",
        ".feed-block-descripe",
        "#J_column_tab_box",
        ".crumbs"
      ],
      "globalStyles": {
        ".feed-block-title": "height:unset"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sobqg",
      "matches": [
        "www.sobqg.com/book/*"
      ],
      "excludeSelectors": [
        "#hot .g_book > span"
      ],
      "injectedCss": [
        "#volumes { display: flex; flex-wrap: wrap; }",
        "a.ell { white-space: normal !important; overflow: visible !important; }",
        "#hot .g_book > a > h3 { white-space: normal; overflow: visible; max-height: none; -webkit-line-clamp: none; }",
        "#hot .g_book { height: 330px; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "soundcloud",
      "matches": [
        "soundcloud.com"
      ],
      "excludeSelectors": [
        ".searchTitle__textContent",
        ".searchOptions__container",
        ".compactTrackListItem__additional",
        ".soundTitle__tagContainer",
        ".searchResultGroupHeading",
        ".sc-ministats-group",
        ".compactTrackList__moreLink",
        ".sound__soundActions"
      ],
      "injectedCss": [
        ".compactTrackListItem {height: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sp-codeSites",
      "matches": [
        "docs.wxwidgets.org"
      ],
      "excludeSelectors": [
        ".doxygen-awesome-fragment-wrapper"
      ],
      "injectedCss": [
        ".textblock p > font{display:flex;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sp.nexusmods",
      "injectedCss": [
        "[class*='line-clamp'] {-webkit-line-clamp:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "spankbang",
      "matches": [
        "https://spankbang.com/*"
      ],
      "excludeSelectors": [
        ".stats",
        ".thumb"
      ],
      "extraBlockSelectors": [
        ".searches > a",
        ".tag > a",
        ".extra > a",
        ".positions > li"
      ],
      "globalStyles": {
        ".video-item > a": "white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "sphinx-rtd-theme",
      "selectors": [
        ".wy-nav-side"
      ],
      "excludeSelectors": [
        "header[default-translate]",
        "footer[default-translate]",
        "dt"
      ],
      "stayOriginalSelectors": [
        ".math.notranslate"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "stackoverflow",
      "matches": [
        "stackoverflow.com",
        "*.stackexchange.com",
        "superuser.com",
        "askubuntu.com",
        "serverfault.com"
      ],
      "excludeSelectors": [
        ".votecell",
        "header",
        "#footer",
        "#question-header + div",
        "div.postcell div.mb0",
        "div[id^=comments-link-]",
        "#answers-header",
        ".new-post-login",
        ".form-submit",
        "a[href='/questions/ask']",
        "#left-sidebar",
        "a.comment-user",
        "span.comment-date",
        "div.s-prose.js-post-body + div",
        ".bottom-notice",
        "div[data-campaign-name=stk]",
        ".s-post-summary--stats",
        ".s-post-summary--meta"
      ],
      "extraBlockSelectors": [
        "span.comment-copy"
      ],
      "globalStyles": {
        ".s-post-summary--content-excerpt": "-webkit-line-clamp:unset;"
      },
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "startme",
      "matches": [
        "start.me"
      ],
      "selectors": [
        ".rss-article__title",
        ".rss-articles-list__article-link",
        ".rss-showcase__title",
        ".rss-showcase__text"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "starz",
      "matches": [
        "www.starz.com"
      ],
      "excludeSelectors": [
        "starz-player",
        "starz-player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "statista",
      "matches": [
        "www.statista.com"
      ],
      "globalStyles": {
        ".itemContent__text": "height:unset;max-height:unset;",
        ".itemContent__subline": "height:unset;max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "steamcommunity",
      "matches": [
        "steamcommunity.com"
      ],
      "excludeSelectors": [
        ".forum_paging",
        ".forum_topic_reply_count",
        ".forum_topic_lastpost",
        ".forum_topic_award_count",
        ".discussion_search_pagingcontrols",
        ".found_helpful,.vote_header,.date_posted,.early_access_review,.apphub_CardContentAuthorBlock"
      ],
      "extraBlockSelectors": [
        ".apphub_sectionTab"
      ],
      "injectedCss": [
        ".forum_topic,.rightbox_list_option,.appHubShortcut {height: unset;}",
        ".forum_topic_name {white-space:normal;line-height: 1.25rem; padding: 6px 20px 0 0;}",
        ".forum_topic_op {clear: left; padding: 0 0 6px 2rem;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "steampoweredApp",
      "matches": [
        "store.steampowered.com/app/*"
      ],
      "excludeSelectors": [
        "#global_actions",
        "#store_controls",
        "#foryou_tab",
        "[class*=persona]",
        "a.btn_medium",
        ".persona_name",
        ".hours.ellipsis",
        ".checkcol",
        ".postedDate",
        ".dev_row .summary",
        ".already_in_library",
        ".game_header_image_ctn .grid_content",
        ".ds_flag.ds_wishlist_flag",
        ".early_access_review.tooltip",
        ".communitylink_achievement_images",
        ".user_reviews_summary_row.summary",
        ".review_award_ctn",
        ".add_to_wishlist_area",
        ".next_in_queue_content",
        ".glance_tags.popular_tags",
        ".game_purchase_action",
        ".vote_button_ctn",
        "#VoteUpDownBtnCtn",
        "#footer",
        "#ViewAllReviewssummary",
        ".user_reviews",
        ".ReviewContentCtn .title",
        ".author_counts,.control_block,.vote_info"
      ],
      "extraInlineSelectors": [
        ".pulldown"
      ],
      "globalStyles": {
        ".game_description_snippet": "max-height:unset; overflow: scroll;",
        ".game_purchase_area_friends_want": "height: auto; padding-bottom: 6px;",
        ".div.early_access_banner": "height: 84px",
        ".franchise_notice > *": "height: 84px"
      },
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "substack",
      "matches": [
        "*.substack.com",
        "newsletter.rootsofprogress.org"
      ],
      "selectors": [
        "link[href^='https://substackcdn.com/bundle/'][rel=preload]"
      ],
      "excludeSelectors": [
        ".publication-footer",
        ".subscribe-footer",
        ".main-menu",
        ".navbar-title-link",
        "[data-testid='navbar']",
        ".navbar-title",
        ".captioned-button-wrap",
        ".subscription-widget-wrap",
        ".tweet-header",
        ".tweet-link-bottom",
        ".expanded-link",
        ".meta-subheader",
        ".comment-meta",
        ".comment-actions"
      ],
      "extraBlockSelectors": [
        ".reader2-post-title",
        ".tweet-link-top",
        ".tweet-link-bottom",
        ".expanded-link"
      ],
      "globalStyles": {
        ".reader2-clamp-lines": "max-height: unset; -webkit-line-clamp: unset;",
        "[class*='clamp-']": "max-height: unset; -webkit-line-clamp:unset;",
        ".blurb-text": "max-height: unset;",
        ".comment-body": "max-height: unset;",
        "[class*='_hideSelectio']": "overflow: scroll;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "svelte",
      "matches": [
        "svelte.dev/docs/*",
        "learn.svelte.dev"
      ],
      "selectors": [
        ".text"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "swaycloud",
      "matches": [
        "sway.cloud.microsoft"
      ],
      "injectedCss": [
        ".text_wrapper ul li {max-height:unset!important;}",
        ".container {overflow:scroll;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tandfonline",
      "matches": [
        "*.tandfonline.com"
      ],
      "extraInlineSelectors": [
        "span.off-screen"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "taobao",
      "matches": [
        "*.taobao.com"
      ],
      "excludeSelectors": [
        ".text-price"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tass",
      "matches": [
        "tass.ru"
      ],
      "globalStyles": {
        "#__next": "font-size: 19px;line-height:28px;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "teacherspayteachers",
      "matches": [
        "www.teacherspayteachers.com/browse/*"
      ],
      "injectedCss": [
        ".ProductRowCard-module__cardTitleLink--YPqiC { display:unset !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "team",
      "matches": [
        "teams.live.com",
        "teams.microsoft.com"
      ],
      "excludeSelectors": [
        ".ui-box .ui-box[class='ui-box']",
        "[data-tid='author']",
        ".fui-ChatMessageCompact__author",
        ".ui-box .ui-box[class='ui-box'] *"
      ],
      "stayOriginalSelectors": [
        "span[title][style='min-width: 20px; height: 20px;']"
      ],
      "extraInlineSelectors": [
        "[data-tid='closed-caption-text']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ted",
      "matches": [
        "www.ted.com"
      ],
      "excludeSelectors": [
        "#video",
        "#video *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "telegram",
      "matches": [
        "web.telegram.org/z/*",
        "web.telegram.org/a/*",
        "web.telegram.org/k/*",
        "web.telegram.org/k/"
      ],
      "selectors": [
        ".text-content",
        ".message",
        ".reply-markup-button-text",
        ".bot-commands-list-element-description",
        "[class*='tabs-tab page-password active']",
        "#auth-qr-form"
      ],
      "excludeSelectors": [
        ".time",
        ".peer-title",
        ".document-wrapper",
        ".message.spoilers-container custom-emoji-element"
      ],
      "extraBlockSelectors": [
        ".message.spoilers-container em",
        ".message.spoilers-container strong"
      ],
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "termynal",
      "selectors": [
        "link[href*='termynal.css']"
      ],
      "stayOriginalSelectors": [
        ".termy"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "thaipbs",
      "matches": [
        "www.thaipbs.*",
        "players.brightcove.net"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "theatlantic",
      "matches": [
        "www.theatlantic.com",
        "https://mashable.com/*"
      ],
      "excludeSelectors": [
        "footer:last-of-type",
        "nav",
        "header div.subtitle-2.w-full"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "thehackernews",
      "matches": [
        "thehackernews.com"
      ],
      "excludeSelectors": [
        "span#blog-pager-older-link",
        "span.h-datetime"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "thehill",
      "matches": [
        "thehill.com"
      ],
      "excludeSelectors": [
        "div.featured-cards__byline",
        "div.list-item__meta",
        ".tags__item",
        "div.extended-scroll__header",
        ".submitted-by",
        ".site-header--has-alert-banner",
        ".homepage__container__opinion__item__byline",
        ".homepage__container__header",
        ".archive__item__meta"
      ],
      "injectedCss": [
        ".most-popular-item { max-height: unset !important; }",
        ".most-popular-item__link { -webkit-line-clamp: unset !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "themotionmagic",
      "matches": [
        "player.hotmart.com"
      ],
      "selectors": [
        "iframe[src*='player.hotmart.com']"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "theverge",
      "matches": [
        "www.theverge.com"
      ],
      "excludeSelectors": [
        ".k8dtcj0",
        "._2xqpwjf._2xqpwj0"
      ],
      "extraBlockSelectors": [
        "[role='article'] p"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "threads",
      "matches": [
        "www.threads.net"
      ],
      "excludeSelectors": [
        ".x6s0dn4.x40hh3e.xrvj5dj.xxfwaov",
        ".x6s0dn4.x78zum5",
        ".xpvyfi4.x1xdureb.x1agbcgv",
        ".xpvyfi4.x1npkx4u.x1ms6mhf"
      ],
      "stayOriginalSelectors": [
        ".x1rg5ohu",
        ".xat24cr.xdj266r a"
      ],
      "globalStyles": {
        "span,.x569fbc": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "threejs-journey",
      "matches": [
        "threejs-journey.com"
      ],
      "excludeSelectors": [
        ".video-area",
        ".video-area *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tiktok",
      "matches": [
        "https://www.tiktok.com/*/video/*",
        "https://www.tiktok.com/*"
      ],
      "excludeSelectors": [
        "[class*='DivInfoPosition']",
        "[data-e2e*='-count']",
        "[data-e2e='nav-foryou']",
        "[data-e2e*='view-more']",
        "[data-e2e*='comment-reply']",
        "[data-e2e*='comment-username']",
        "[class*='DivCommentSubContentSplitWrapper']",
        "[class*='DivViewRepliesContainer']",
        "[class*='DivInfoPosition'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "time",
      "matches": [
        "time.com"
      ],
      "excludeSelectors": [
        ".date-and-duration"
      ],
      "globalStyles": {
        ".headline": "-webkit-line-clamp:unset;overflow:unset;height:unset;",
        "h3": "-webkit-line-clamp:unset;overflow:unset;",
        "p": "-webkit-line-clamp:unset;overflow:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tinytask",
      "matches": [
        "https://www.tinytask.net"
      ],
      "globalStyles": {
        "table > tbody > tr > td > center > table > tbody > tr > td > ul > li": "height: 100%"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "toneking",
      "matches": [
        "www.toneking.com"
      ],
      "injectedCss": [
        "ul li {text-wrap:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "trade",
      "matches": [
        "axiom.trade"
      ],
      "extraInlineSelectors": [
        "[class^=tweet-body_root]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "transformer-circuits.pub",
      "matches": [
        "transformer-circuits.pub"
      ],
      "stayOriginalSelectors": [
        "d-cite"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "translation-font-size-unset",
      "matches": [
        "m.yxlady.com",
        "web3.fireverseai.com"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper, .immersive-translate-target-translation-block-wrapper, .immersive-translate-target-inner { font-size: unset; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tripadvisor",
      "matches": [
        "www.tripadvisor.com"
      ],
      "injectedCss": [
        ".ZTpaU,.alvrA {-webkit-line-clamp:unset;}"
      ],
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tubitv",
      "matches": [
        "tubitv.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tumblr",
      "matches": [
        "www.tumblr.com"
      ],
      "selectors": [
        "article h1",
        "article > header + div",
        "[data-testid=notes-root] p",
        "div.k31gt",
        "p",
        "article ul",
        "article h2",
        "article h3",
        "article h4",
        "article h5",
        "article h6",
        "article blockquote",
        "article ol"
      ],
      "excludeSelectors": [
        "div.fAAi8",
        "div.wvu3V"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tv.adobe",
      "matches": [
        "https://*.tv.adobe.com"
      ],
      "excludeSelectors": [
        ".mpc-player",
        ".mpc-player *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "tver",
      "matches": [
        "tver.jp"
      ],
      "excludeSelectors": [
        "div[class*=\"player_container\"]",
        "#immersive-translate-caption-window",
        "div[class*=\"player_container\"] *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "twitch",
      "matches": [
        "www.twitch.tv"
      ],
      "excludeSelectors": [
        ".persistent-player",
        ".chat-line__username-container",
        ".chat-line__no-background span[aria-hidden=true]",
        "[data-a-target=animated-channel-viewers-count],.live-time"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "twitter",
      "matches": [
        "twitter.com",
        "mobile.twitter.com",
        "tweetdeck.twitter.com",
        "pro.twitter.com",
        "platform.twitter.com/embed*",
        "x.com",
        "mobile.x.com",
        "tweetdeck.x.com",
        "pro.x.com",
        "platform.x.com/embed*"
      ],
      "selectors": [
        "[data-testid='tweetText']",
        "[style*='-webkit-line-clamp']",
        ".tweet-text",
        "[data-testid='tweet'] [class='css-175oi2r r-13awgt0 r-eqz5dr r-iphfwy r-3o4zer r-ttdzmv']",
        "[data-testid='tweet'] .css-175oi2r span",
        ".js-quoted-tweet-text",
        "[data-testid='card.layoutSmall.detail'] > div:nth-child(2)",
        "[data-testid='developerBuiltCardContainer'] > div:nth-child(2)",
        "[data-testid='card.layoutLarge.detail'] > div:nth-child(2)",
        "[data-testid='cellInnerDiv'] div[data-testid='UserCell'] > div> div:nth-child(2)",
        "[data-testid='UserDescription']",
        "[data-testid='HoverCard'] div[dir=auto]",
        "[data-testid='HoverCard'] span[dir=auto]",
        "[data-testid='HoverCard'] [role='dialog'] div[dir=ltr]",
        "[data-testid='birdwatch-pivot'] div[dir=ltr]",
        "[data-testid='twitterArticleReadView']",
        "[aria-label='Grok']",
        "[role=dialog]",
        "[class='css-175oi2r r-1awozwy r-13awgt0 r-1rnoaur r-13qz1uu']",
        "[class='css-175oi2r r-kemksi r-1kqtdi0 r-1q9bdsx r-1phboty r-rs99b7 r-1udh08x r-13qz1uu']",
        "[class='css-175oi2r r-uef6q5 r-dnmrzs r-97e31f r-13qz1uu r-13awgt0 r-dgnwoc r-1me0s30 r-t3sqpr r-1dqxon3']",
        "[class='css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0']",
        "[data-testid='inlinePrompt']",
        "span[class='css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-n6v787 r-1cwl3u0']",
        "[data-testid=primaryColumn] [class='css-175oi2r r-kzbkwu r-3pj75a'] > div > span[class='css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3']"
      ],
      "excludeSelectors": [
        "[aria-describedby][role=button]",
        "header",
        "[data-testid='radioGroupplayback_rate'] div",
        "[data-testid='userFollowIndicator']",
        "[class='css-901oao r-14j79pv r-37j5jr r-n6v787 r-16dba41 r-1cwl3u0 r-bcqeeo r-qvutc0']",
        "[class='css-175oi2r r-1wbh5a2 r-dnmrzs']",
        "[aria-label=Grok] button",
        "[aria-label=Grok] [style*='rgb(89, 93, 98)']",
        "[aria-label=Grok] .r-uho16t",
        "[data-testid=User-Name]",
        "[data-testid=socialContext]",
        "[data-testid=tweet-text-show-more-link]",
        "[aria-label=Grok] [class='css-175oi2r r-1habvwh r-vqp9x9 r-1q9bdsx r-1loqt21 r-9njtsq r-1wtj0ep r-nsbfu8 r-xbdcod r-13c7hvr'] > div:last-child",
        "[role='tab']",
        "[data-testid=hoverCardParent] [role=menuitem]",
        "[data-testid=sidebarColumn]",
        "h2[role=heading]",
        "[class='css-175oi2r r-1awozwy r-18u37iz r-1wtj0ep r-6gpygo'],[class='css-175oi2r r-1d09ksm r-18u37iz r-1wbh5a2 r-1471scf'],[class='css-175oi2r r-1kbdv8c r-18u37iz r-1wtj0ep r-1ye8kvj r-1s2bzr4']",
        ".imt-caption-container *",
        "[data-testid=videoComponent]"
      ],
      "stayOriginalSelectors": [
        "[data-testid=\"tweetText\"] a",
        "[data-testid='UserDescription'] a",
        "[data-testid='HoverCard'] a",
        "[data-testid='UserCell'] a",
        "[data-testid='birdwatch-pivot'] a",
        ".DocsMarkdown--link-external-icon"
      ],
      "extraInlineSelectors": [
        "[data-testid=\"tweetText\"] div.r-xoduu5",
        "[data-testid=\"tweetText\"] span",
        "[data-testid=\"UserDescription\"] div",
        "[data-testid='HoverCard'] div[dir=auto] div",
        "[data-testid='HoverCard'] span[dir=auto] div"
      ],
      "extraBlockSelectors": [
        "[data-testid=\"tweetText\"] div.r-6koalj"
      ],
      "excludeMatches": [
        "twitter.com/i/premium_sign_up",
        "twitter.com/settings/subscription",
        "twitter.com/jobs/*",
        "x.com/i/premium_sign_up",
        "x.com/settings/subscription",
        "x.com/settings/account",
        "x.com/jobs/*",
        "x.com/*/tos*",
        "x.com/*/privacy*",
        "x.com/account/access*",
        "x.com/i/account_analytics*",
        "x.com/i/chat*",
        "x.com/settings*"
      ],
      "injectedCss": [
        "[data-testid='card.layoutLarge.detail'] > div:nth-child(2) {-webkit-line-clamp: unset!important;}",
        "[data-testid='card.layoutSmall.detail'] > div:nth-child(2) {-webkit-line-clamp: unset!important;}",
        "[data-testid='tweetText'],[style*='-webkit-line-clamp'] {-webkit-line-clamp: unset!important;}",
        "[role=dialog] [style*='webkit-line-clamp'] {-webkit-line-clamp: unset!important;}",
        ".r-h9hxbl{width:unset;}",
        "[aria-label=Grok] [data-testid=ScrollSnap-SwipeableList] [role=presentation] > div > div { max-height: unset !important; }",
        ".css-9pa8cd.imt-img {top: 50%!important;left: 50%!important;transform: translate(-50%, -50%)!important;position:absolute!important;height:unset!important;object-fit: cover !important;}"
      ],
      "paragraphMinTextCount": 2,
      "paragraphMinWordCount": 1,
      "blockMinTextCount": 0,
      "blockMinWordCount": 0,
      "isTranslateTitle": false,
      "observeUrlChange": false,
      "excludeSelectorsRegexes": {
        "[data-testid=tweetText] span": [
          "^[0-9a-zA-Z]{30,}$"
        ]
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "txt",
      "matches": [
        "*://*/*.txt",
        "file://*/*.txt"
      ],
      "selectors": [
        "body > pre",
        ".transcripts > pre"
      ],
      "excludeSelectors": [
        ".api-code",
        "pre.highlight.def",
        "body"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "typora",
      "matches": [
        "typora.io"
      ],
      "excludeSelectors": [
        ".tab-slider--nav"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ubuntu",
      "matches": [
        "manpages.ubuntu.com"
      ],
      "selectors": [
        "pre"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "ucdavis",
      "matches": [
        "aggievideo.canvas.ucdavis.edu"
      ],
      "excludeSelectors": [
        "[data-testid=\"video-player\"]",
        "[data-testid=\"video-player\"] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "udacity",
      "matches": [
        "*.udacity.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "udemy",
      "matches": [
        "*.udemy.com"
      ],
      "excludeSelectors": [
        "[data-purpose='captions-cue-text']",
        ".shaka-text-container",
        "[data-purpose='captions-cue-text'] *",
        ".shaka-text-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "uni-trier",
      "matches": [
        "dblp.uni-trier.de"
      ],
      "selectors": [
        "h1",
        "h2",
        ".title",
        ".external",
        "dd p"
      ],
      "excludeSelectors": [
        ".side-column"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "updraft",
      "matches": [
        "updraft.cyfrin.io"
      ],
      "excludeSelectors": [
        "#immersive-translate-caption-window",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "urlComment",
      "selectors": [
        "meta[name='generator'][content^='Discourse']"
      ],
      "excludeSelectors": [
        ".username",
        ".post-infos",
        ".topic-category",
        ".topic-timeline",
        ".topic-map",
        ".topic-list-header",
        ".number",
        ".activity"
      ],
      "extraBlockSelectors": [
        "header ol li a"
      ],
      "injectedCss": [
        "header.d-header {height: 6em !important;}",
        ".topic-list .main-link .raw-topic-link > font {pointer-events:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "urplay",
      "matches": [
        "urplay.se"
      ],
      "excludeSelectors": [
        ".jw-media",
        ".jw-media *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "uxtension",
      "matches": [
        "www.uxento.io"
      ],
      "selectors": [
        "[class='px-4 pb-4 text-sm leading-relaxed break-words text-white overflow-hidden']",
        "[class='text-xs leading-relaxed break-words text-[#AAAAB9] mb-2 overflow-hidden']",
        "[class='px-4 pb-4 text-sm leading-relaxed break-words text-white']",
        "[class='text-xs leading-relaxed break-words text-[#AAAAB9] mb-2']",
        "[class='flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip'] section",
        "h2",
        "article",
        "article h2",
        "article p"
      ],
      "excludeSelectors": [
        "article div[class='flex justify-between items-center px-3']",
        "article div[class='flex items-center gap-2 mb-2']",
        "article div[class='flex justify-between items-center pr-4']",
        "article div[class='px-3 pb-3 pt-1 grid grid-cols-2 gap-4']",
        "article div[class='flex flex-wrap gap-1 mt-1']",
        "article div[class='flex items-center gap-3 pr-12']"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "vaseven",
      "matches": [
        "www.vaseven.com"
      ],
      "excludeSelectors": [
        ".et_pb_main_blurb_image"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "vdi-nachrichten",
      "matches": [
        "www.vdi-nachrichten.com"
      ],
      "excludeSelectors": [
        ".header-menu__item > a",
        ".linkbar__item",
        ".header__button-group"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "vercel",
      "matches": [
        "vercel.com"
      ],
      "excludeSelectors": [
        "[class^=fade-in-words]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "viki",
      "matches": [
        "www.viki.com"
      ],
      "excludeSelectors": [
        ".vjs-text-track-display",
        ".vjs-text-track-display *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "vimeo",
      "matches": [
        "vimeo.com",
        "training.leveleffect.com"
      ],
      "excludeSelectors": [
        ".vp-captions",
        ".vp-captions *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "visualstudioMarketplace",
      "matches": [
        "marketplace.visualstudio.com"
      ],
      "excludeSelectors": [
        ".core-info-second-row",
        ".core-info-third-row",
        ".meta-data-list",
        ".item-title",
        ".breadcrumb",
        ".itemDetails-right",
        ".ux-user-name",
        ".ux-updated-date",
        ".ux-item-second-row-wrapper",
        ".stats-and-offer",
        ".header-container"
      ],
      "globalStyles": {
        ".item-details-control-root.ux-item-shortdesc": "height: unset; overflow: visible; max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "viu",
      "matches": [
        "www.viu.com"
      ],
      "excludeSelectors": [
        ".bmpui-ui-viu-subtitle-overlay",
        ".bmpui-ui-viu-subtitle-overlay *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "vodtw",
      "matches": [
        "www.vodtw.com/book/*"
      ],
      "injectedCss": [
        "dl { display: flex; flex-wrap: wrap; }",
        "dl dd { white-space: normal !important; overflow: visible !important; }",
        "#info p { height: unset !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wandb",
      "matches": [
        "wandb.ai"
      ],
      "stayOriginalSelectors": [
        "span[data-slate-inline=true]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wattpad",
      "matches": [
        "www.wattpad.com"
      ],
      "globalStyles": {
        ".story-info .item-description": "overflow: scroll;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wayfair",
      "matches": [
        "www.wayfair.com"
      ],
      "injectedCss": [
        "[data-enzyme-id=\"Collapse-Collapsible\"] {height:unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "webofscience",
      "matches": [
        "https://www.webofscience.com/*",
        "https://webofscience.clarivate.*/*",
        "www-webofscience-com-*.*",
        "webofscience-clarivate*.*",
        "*.ustc.edu.*/*wos*"
      ],
      "selectors": [
        "app-wos.mat-typography"
      ],
      "excludeSelectors": [
        "app-custom-breadcrumbs",
        ".summary-left-panel",
        ".authors",
        "app-full-record-keywords mark",
        "mat-sidenav",
        "[name=pubdate]",
        "[data-ta^=Summary-]",
        "app-summary-authors",
        ".search-text",
        ".mat-drawer-inner-container",
        "[class*='sidenav-panel']"
      ],
      "extraBlockSelectors": [
        "app-summary-authors + div",
        "app-full-record-keywords span span",
        "[data-ta=summary-record-title-link]",
        "[cdxanalyticscategory=wos-recordCard_ExpandAbstract]"
      ],
      "globalStyles": {
        ".abstract": "height:auto !important;",
        ".show-more-lines": "height:unset !important;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "weibo",
      "matches": [
        "weibo.com",
        "*.weibo.*"
      ],
      "selectors": [
        "div[class^='detail_wbtext']",
        ".weibo-text",
        ".m-feed",
        ".wbpro-feed-content",
        ".wbpro-list .text"
      ],
      "stayOriginalSelectors": [
        ".expand"
      ],
      "excludeMatches": [
        "passport.weibo.com/sso/signin*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "weverse",
      "matches": [
        "weverse.io"
      ],
      "excludeSelectors": [
        ".pzp-pc__video",
        ".pzp-pc__video *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "whatsapp",
      "matches": [
        "web.whatsapp.com"
      ],
      "selectors": [
        "._akbu",
        "[role=list]",
        ".copyable-text",
        ".quoted-mention"
      ],
      "excludeSelectors": [
        "[aria-hidden=true]"
      ],
      "extraInlineSelectors": [
        ".x1lliihq"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wikipedia",
      "matches": [
        "*.wikipedia.org"
      ],
      "excludeSelectors": [
        ".mw-editsection",
        ".mw-cite-backlink",
        "#p-lang-btn",
        "#right-navigation",
        "#p-associated-pages",
        ".vector-header",
        ".lazy-image-placeholder"
      ],
      "stayOriginalSelectors": [
        ".chemf",
        ".mwe-math-element",
        "[role=math]",
        ".nowrap"
      ],
      "extraInlineSelectors": [
        ".chemf",
        ".mwe-math-element",
        "[role=math]",
        ".nowrap"
      ],
      "injectedCss": [
        ".immersive-translate-target-translation-block-wrapper { display: block !important; }",
        ".mwe-popups-extract {max-height:unset!important;height:unset!important;}",
        ".immersive-translate-target-wrapper {content-visibility:auto;}"
      ],
      "globalStyles": {
        ".no-article-text-sister-projects li": "height:unset;"
      },
      "paragraphMinTextCount": 4,
      "paragraphMinWordCount": 2,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wiley",
      "matches": [
        "*.wiley.com"
      ],
      "excludeSelectors": [
        ".loa-authors",
        ".MuiBox-root > .MuiTypography-root.MuiTypography-body2"
      ],
      "excludeMatches": [
        "onlinelibrary.wiley.com/action/downloadSupplement*",
        "onlinelibrary.wiley.com/doi/pdf/*",
        "onlinelibrary.wiley.com/doi/am-pdf/*"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wisdom",
      "matches": [
        "wisdom.nec.com"
      ],
      "injectedCss": [
        "a > font {width: max-content;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wistia",
      "matches": [
        "ahrefs.com",
        "*.wistia.net",
        "*.thinkific.com",
        "courses.kevinpowell.co",
        "learn.ni.com",
        "cgcookie.com",
        "academy.yoast.com",
        "courses.mavenanalytics.io",
        "apclassroom.collegeboard.org"
      ],
      "selectors": [
        ".wistia_embed"
      ],
      "excludeSelectors": [
        "div[data-handle='captions']",
        "#immersive-translate-caption-window",
        "div[data-handle='captions'] *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wistia-hook",
      "matches": [
        "agencysupremacy.io",
        "dynamous.ai",
        "dynamous.wistia.com"
      ],
      "excludeSelectors": [
        "div[data-handle='captions']",
        "div[data-handle='captions'] *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "wsj",
      "matches": [
        "www.wsj.com",
        "cn.wsj.com"
      ],
      "excludeSelectors": [
        "header",
        "footer",
        "nav",
        "[aria-label='Markets summary']"
      ],
      "extraBlockSelectors": [
        ".series-nav__link-thumbnail"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper br {display:none;}",
        ".spcv_list-item .immersive-translate-target-translation-block-wrapper {display:inline-block;margin-top:8px;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.acrobiosystems.com",
      "matches": [
        "www.acrobiosystems.com"
      ],
      "injectedCss": [
        ".productDetialDetail .productLink {overflow: hidden;}",
        ".productDetialDetail .productLink .box a {display: flex; justify-content: center; white-space: nowrap;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.dgl.ai",
      "matches": [
        "www.dgl.ai"
      ],
      "excludeSelectors": [
        "header"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.ey.com",
      "matches": [
        "www.ey.com"
      ],
      "injectedCss": [
        ".up-rich-text__container {height: unset!important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.iq.com",
      "matches": [
        "www.iq.com"
      ],
      "excludeSelectors": [
        ".iqp-subtitle",
        ".iqp-subtitle *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.metacritic.com",
      "matches": [
        "www.metacritic.com"
      ],
      "injectedCss": [
        ".c-finderProductCard_info .c-finderProductCard_meta {display: block;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "www.sixthtone.com",
      "matches": [
        "www.sixthtone.com"
      ],
      "excludeSelectors": [
        "#footer",
        "[class^=index_time]",
        "[class^=index_anthorList]",
        "[class^=index_node]",
        "[class^=index_popupWrapper]"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "xianqihaotianmi",
      "matches": [
        "www.xianqihaotianmi.org"
      ],
      "injectedCss": [
        ".list-charts { display: flex; flex-wrap: wrap; }",
        ".list-charts li { white-space: normal !important; overflow: visible !important; }"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "xiaohongshu.com",
      "matches": [
        "www.xiaohongshu.com"
      ],
      "excludeSelectors": [
        ".author-wrapper",
        ".info",
        ".side-bar",
        ".interactions",
        ".show-more",
        ".bottom-container",
        ".total",
        ".reds-sticky"
      ],
      "globalStyles": {
        "a.title": "-webkit-line-clamp:3"
      },
      "blockMinTextCount": 6,
      "blockMinWordCount": 1,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "xiaosaas",
      "matches": [
        "*.xiaosaas.com"
      ],
      "excludeSelectors": [
        "p.marginRight10",
        "p.marginLeft10"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "xiapi",
      "matches": [
        "*.xiapibuy.*"
      ],
      "globalStyles": {
        ".WBVL_7,.tauwWr.jqRqhn": "-webkit-line-clamp:unset;max-height:unset;height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "xvideos",
      "matches": [
        "https://www.xvideos.com/*"
      ],
      "excludeSelectors": [
        ".video-hd-mark"
      ],
      "globalStyles": {
        ".title": "-webkit-line-clamp:unset;max-height:unset;",
        ".mozaique": "display:flex; flex-wrap:wrap;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yahoo",
      "matches": [
        "*.yahoo.*"
      ],
      "excludeSelectors": [
        "._ys_jiqava",
        "#Col2-5-Rmp-Proxy",
        ".readmore",
        ".ticker-item-wrapper",
        ".ticker-list",
        ".footer"
      ],
      "extraBlockSelectors": [
        ".SIPGg",
        ".sc-kzMCTH.pSZXj"
      ],
      "injectedCss": [
        "[class*='line-clamp'],h3.clamp {-webkit-line-clamp:unset!important;}",
        "#atomic .Mt\\(20px\\) {margin-top: 100px;}",
        "[class*='LineClamp'] {-webkit-line-clamp:unset;max-height:unset;}",
        "a[class*='js-content-viewer']> div[class*='Td\\(n\\)'] {overflow: scroll;}",
        "[class*='_ys_24482e'] {-webkit-line-clamp:unset;}",
        "#Aside > :first-child {overflow:scroll;}"
      ],
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yandex",
      "matches": [
        "https://yandex.com/video/*"
      ],
      "selectors": [
        ".serp-item__title",
        ".serp-item__text",
        ".Keypoints-ItemTitle",
        ".bes-epmjnzm-idtktyj",
        ".OrganicTitle-LinkText",
        "h1.VideoTitle"
      ],
      "globalStyles": {
        ".serp-item__title": "-webkit-line-clamp: unset;max-height:unset;",
        ".serp-item__text": "-webkit-line-clamp: unset;max-height:unset;",
        ".OrganicTitle-LinkText": "-webkit-line-clamp: unset;max-height:unset;",
        "h1.VideoTitle": "-webkit-line-clamp: unset;max-height:unset;",
        ".link .serp-item__keypoints": "bottom:2px;",
        ".OrganicTitle": "max-height:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yandexIndex",
      "matches": [
        "https://yandex.com/"
      ],
      "selectors": [
        ".tabs__item-text"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yandexSearch",
      "matches": [
        "https://yandex.com/search/*"
      ],
      "excludeSelectors": [
        ".KeyValue-Row",
        ".EntityFeedbackFooter",
        ".Organic-Subtitle",
        ".SerpFooter-Content",
        ".serp-user",
        ".Pager"
      ],
      "globalStyles": {
        ".ExtendedText-Toggle": "white-space:normal;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yna",
      "matches": [
        "*.yna*"
      ],
      "injectedCss": [
        "font > br {display:none}"
      ],
      "globalStyles": {
        "a,strong": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;",
        "div,p,li,.item-box01,.news-con": "height:unset;max-height:unset;-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yodayo.chat",
      "matches": [
        "https://yodayo.com/*/chat/*"
      ],
      "extraBlockSelectors": [
        ".inline-flex span"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "you",
      "matches": [
        "https://you.com/search"
      ],
      "excludeSelectors": [
        "div.hpIWZO"
      ],
      "globalStyles": {
        "h3": "max-height:unset;-webkit-line-clamp:unset;",
        ".caKYaC": "max-height:unset;-webkit-line-clamp:unset;",
        ".dDwDsu": "max-height:unset;-webkit-line-clamp:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "youku.tv",
      "matches": [
        "www.youku.tv"
      ],
      "excludeSelectors": [
        "#subtitle",
        "#subtitle *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yourporn",
      "matches": [
        "https://www.youporn.com/*"
      ],
      "extraBlockSelectors": [
        ".button"
      ],
      "globalStyles": {
        ".video-box": "max-height:unset;",
        ".video-box-title": "white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "youtube",
      "matches": [
        "www.youtube.com"
      ],
      "selectors": [
        "yt-formatted-string[slot=content].ytd-comment-renderer",
        "yt-formatted-string.ytd-video-renderer",
        "yt-formatted-string#content-text",
        "h1",
        "yt-formatted-string#video-title",
        ".ytLockupMetadataViewModelTitle,.shortsLockupViewModelHostOutsideMetadataTitle",
        "yt-formatted-string.span",
        "span#video-title",
        "a#video-title",
        "yt-formatted-string.ytd-transcript-segment-renderer",
        "#description-inline-expander > yt-attributed-string > span",
        "yt-attributed-string > span",
        "yt-formatted-string > span",
        "ytd-notification-renderer .message",
        "#message",
        ".yt_to_text_transcript_text",
        "video-summary-content-view-model",
        ".yt-core-attributed-string",
        "#title",
        ".product-item-title",
        ".product-item-price",
        "#commentCanvas .cmt",
        ".ytwTranscriptSegmentViewModelHost"
      ],
      "excludeSelectors": [
        ".ytp-caption-window-container",
        "text",
        ".imt-caption-container",
        "ytd-button-renderer",
        ".ytp-sfn-content div :last-child",
        "ytd-live-chat-frame",
        "yt-button-shape",
        "ytd-comments-header-renderer",
        "yt-content-metadata-view-model",
        "yt-description-preview-view-model button",
        ".yt-page-header-view-model__page-header-title",
        ".imt-caption-container *"
      ],
      "extraBlockSelectors": [
        "yt-formatted-string.ytd-transcript-segment-renderer",
        ".caption-visual-line"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper img { width: 16px; height: 16px }",
        ".metadata-snippet-container {max-height: unset !important;}",
        ".immersive-translate-target-wrapper {text-align: left;}",
        ".immersive-translate-target-wrapper[dir=rtl] {text-align: right;}",
        "#commentCanvas .cmt {display:flex;flex-direction: column;}",
        "#commentCanvas .cmt font br {display: none;}",
        "#video-title,h1.ytd-watch-metadata,.ytd-video-renderer,.yt-lockup-metadata-view-model-wiz__title {-webkit-line-clamp: unset !important;max-height: unset !important;}",
        "yt-formatted-string#video-title,.ShortsLockupViewModelHostOutsideMetadataTitle {-webkit-line-clamp: unset !important;max-height: unset !important;}",
        "ytd-expander.ytd-comment-renderer {--ytd-expander-max-lines: 1000;}",
        ".page-header-view-model-wiz__page-header-title--page-header-title-large {-webkit-line-clamp: unset !important;max-height: unset !important;}",
        "#title,#video-title,.yt-lockup-metadata-view-model__title,.ytLockupMetadataViewModelTitle,.shortsLockupViewModelHostOutsideMetadataTitle,h1.ytd-watch-metadata,.ytwFeedAdMetadataViewModelHostTextsStyleStandardHeadline {-webkit-line-clamp: unset !important;max-height: unset !important;}"
      ],
      "blockMinTextCount": 0,
      "blockMinWordCount": 0,
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "youtube-subtitle",
      "matches": [
        "www.youtube-nocookie.com",
        "music.youtube.com"
      ],
      "excludeSelectors": [
        ".captions-text",
        ".ytp-caption-segment"
      ],
      "extraBlockSelectors": [
        ".caption-visual-line"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "youtubekids",
      "matches": [
        "www.youtubekids.com"
      ],
      "globalStyles": {
        "#video-title": "-webkit-line-clamp: unset;max-height: unset;",
        "h1.ytd-watch-metadata": "-webkit-line-clamp: unset;max-height: unset;",
        "yt-formatted-string#video-title": "-webkit-line-clamp: unset;max-height: unset;",
        "ytd-expander.ytd-comment-renderer": "--ytd-expander-max-lines: 1000;",
        ".details.ytk-compact-video-renderer": "height: unset;",
        ".primary-text.ytk-compact-video-renderer": "-webkit-line-clamp: unset;max-height: unset;"
      },
      "blockMinTextCount": 0,
      "blockMinWordCount": 0,
      "isTranslateTitle": false,
      "detectParagraphLanguage": true,
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "youtubeMobile",
      "matches": [
        "m.youtube.com"
      ],
      "selectors": [
        ".comment-text",
        "#content-text",
        ".media-item-headline",
        ".slim-video-information-title",
        ".yt-spec-button-view-model",
        ".yt-core-attributed-string > span",
        ".yt-core-attributed-string",
        ".shortsLockupViewModelHostMetadataTitle",
        ".YtmCommentRendererText",
        ".ytAttributedStringHost",
        ".title"
      ],
      "excludeSelectors": [
        ".ytm-badge-and-byline-item-byline",
        ".ytp-caption-window-container",
        "text",
        ".imt-caption-container",
        "ytd-live-chat-frame",
        ".imt-caption-container *"
      ],
      "extraBlockSelectors": [
        ".caption-visual-line"
      ],
      "injectedCss": [
        ".immersive-translate-target-wrapper img { width: 16px; height: 16px }",
        ".shortsLockupViewModelHostMetadataTitle,h4.compact-media-item-headline {max-height:unset !important;line-clamp:unset !important;overflow:unset !important;-webkit-line-clamp:unset !important;}",
        ".comment-text {max-height:unset;}",
        ".details,.subhead,.video-card-title,.media-item-headline {max-height:unset!important;-webkit-line-clamp:unset!important;}",
        "truncated-text-content {max-height: unset !important;}"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "yuque",
      "matches": [
        "https://www.yuque.com/*"
      ],
      "excludeSelectors": [
        ".lark-virtual-tree"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "z-lib",
      "matches": [
        "*.z-lib.*"
      ],
      "globalStyles": {
        ".title,.book-info": "max-height:unset;-webkit-line-clamp:unset;height:unset;white-space:unset;"
      },
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zdf.de",
      "matches": [
        "www.zdf.de"
      ],
      "excludeSelectors": [
        ".zdfplayer-video-container",
        "#immersive-translate-caption-window",
        ".zdfplayer-video-container *",
        "#immersive-translate-caption-window *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zebrack-shueisha",
      "matches": [
        "zebrack-comic.shueisha.*"
      ],
      "excludeSelectors": [
        ".eAvsta_root"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zendesk",
      "matches": [
        "https://*.zendesk.com/agent/*"
      ],
      "selectors": [
        "[data-test-id*=subject]",
        "[data-test-id*=content] > span",
        ".zd-comment",
        ".title"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zenva",
      "matches": [
        "academy.zenva.com"
      ],
      "excludeSelectors": [
        ".video-container",
        ".video-container *"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zoom",
      "matches": [
        "*.zoom.us"
      ],
      "excludeSelectors": [
        ".live-transcription-subtitle__box",
        ".live-transcription-subtitle__box *"
      ],
      "extraInlineSelectors": [
        ".live-transcription-subtitle__item"
      ],
      "autoTranslate": true,
      "translateUI": false
    },
    {
      "name": "zoom-asu",
      "matches": [
        "*.zoom.us/rec/*"
      ],
      "excludeSelectors": [
        ".player-share .video-js",
        ".player-share .video-js *"
      ],
      "autoTranslate": true,
      "translateUI": false
    }
  ]
};

// ===== shared/constants.js =====
const LANG_CODES = [
  "auto", "zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es",
  "pt", "ru", "ar", "th", "vi", "id", "it", "nl", "pl", "tr", "hi",
];

const LANG_NAMES = {
  auto: "Detect", "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
  en: "English", ja: "日本語", ko: "한국어", fr: "Français",
  de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
  ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
  it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
};

const LANGS = LANG_CODES.map((code) => ({ code, name: LANG_NAMES[code] }));

const ENGINES = [
  { id: "google", name: "Google" },
  { id: "bing", name: "Bing" },
];

const INLINE_DISPLAYS = new Set([
  "inline", "inline-block", "inline-flex", "inline-grid",
  "inline-table", "ruby", "ruby-base", "ruby-text",
  "math", "inline-math",
]);

const IGNORE_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "SELECT",
  "CODE", "KBD", "SVG", "MATH", "INPUT", "BUTTON",
  "IMG", "VIDEO", "AUDIO", "IFRAME", "OBJECT", "EMBED",
  "CANVAS", "MAP", "AREA", "TRACK", "WBR", "BR",
]);

const BLOCK_TAGS = new Set([
  "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER",
  "ASIDE", "NAV", "DETAILS", "SUMMARY", "FIGURE", "FIGCAPTION",
  "FIELDSET", "FORM", "H1", "H2", "H3", "H4", "H5", "H6",
  "P", "BLOCKQUOTE", "PRE", "OL", "UL", "LI", "DL", "DT", "DD",
  "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH",
  "HR", "ADDRESS",
]);

const BROWSER_LANG_MAP = {
  "zh": "zh-CN", "zh-cn": "zh-CN", "zh-tw": "zh-TW", "zh-hk": "zh-TW",
  "en": "en", "en-us": "en", "en-gb": "en",
  "ja": "ja", "ko": "ko", "fr": "fr", "de": "de",
  "es": "es", "pt": "pt", "pt-br": "pt",
  "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
  "id": "id", "it": "it", "nl": "nl", "pl": "pl",
  "tr": "tr", "hi": "hi",
};

const TTS_LANG_MAP = {
  "auto": "en", "zh-CN": "zh-CN", "zh-TW": "zh-TW", "en": "en",
  "ja": "ja", "ko": "ko", "fr": "fr", "de": "de", "es": "es",
  "pt": "pt", "ru": "ru", "ar": "ar", "th": "th", "vi": "vi",
  "id": "id", "it": "it", "nl": "nl", "pl": "pl", "tr": "tr", "hi": "hi",
};

function getBrowserLang() {
  const nav = navigator.language || "en";
  const lower = nav.toLowerCase();
  if (BROWSER_LANG_MAP[lower]) return BROWSER_LANG_MAP[lower];
  const prefix = lower.split("-")[0];
  return BROWSER_LANG_MAP[prefix] || "en";
}

function detectTextLang(text) {
  if (/[\u4e00-\u9fff]/.test(text)) {
    if (!/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "zh-CN";
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0400-\u04ff]/.test(text)) return "ru";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\u0e00-\u0e7f]/.test(text)) return "th";
  if (/[\u0100-\u01ef\u0300-\u033f]/.test(text)) return "vi";
  if (/[\u0900-\u097f]/.test(text)) return "hi";
  if (/[a-zA-Z]/.test(text)) return "en";
  return null;
}

function escHtml(s) {
  if (s == null) return "";
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function isIgnored(text, ignLangs) {
  if (!ignLangs || !ignLangs.length) return false;
  const detected = detectTextLang(text);
  if (!detected) return false;
  return ignLangs.some((ign) => {
    if (ign === detected) return true;
    return ign.split("-")[0] === detected.split("-")[0];
  });
}

function isHostBlacklisted(hostname, blacklist) {
  if (!Array.isArray(blacklist)) return false;
  return blacklist.some((pattern) => {
    if (typeof pattern !== "string") return false;
    if (pattern.startsWith("*.")) {
      const base = pattern.slice(2);
      return hostname === base || hostname.endsWith("." + base);
    }
    return hostname === pattern || hostname.endsWith("." + pattern);
  });
}

// In userscript, sendMessage directly calls the message handler
let _messageHandler = null;
function setMessageHandler(fn) {
  _messageHandler = fn;
}
function sendMessage(msg) {
  return new Promise((resolve) => {
    const result = _messageHandler(msg, null, (response) => {
      resolve(response);
    });
    if (typeof result === 'boolean' && !result) {
      resolve(undefined);
    }
  });
}


// ===== shared/theme.js =====
let isDark = false;
let themeObserver = null;
let applyingTheme = false;

function getIsDark() { return isDark; }

function detectDark() {
  isDark = false;
  const els = [document.body, document.documentElement];
  for (const el of els) {
    if (!el) continue;
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
      const m = bg.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) {
        const lum = (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) / 255;
        if (lum < 0.5) { isDark = true; return; }
        return;
      }
    }
  }
}

function applyTheme(floatEl, getIconUrlFn) {
  if (applyingTheme) return;
  applyingTheme = true;
  detectDark();
  if (isDark) document.documentElement.setAttribute("data-tr-theme", "dark");
  else document.documentElement.removeAttribute("data-tr-theme");
  if (floatEl) {
    const img = floatEl.querySelector("img");
    if (img && getIconUrlFn) img.src = getIconUrlFn();
  }
  applyingTheme = false;
}

function watchTheme(fn) {
  if (themeObserver) return;
  themeObserver = new MutationObserver(() => {
    requestAnimationFrame(() => fn());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  if (document.body) {
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme", "color"] });
  }
}

function getIconUrl() {
  return isDark ? ASSETS.dark : ASSETS.light;
}


// ===== shared/tts.js =====
let currentAudio = null;

function clearSpeakingBtn() {
  document.querySelectorAll(".tr-speak-btn.speaking").forEach((btn) => btn.classList.remove("speaking"));
}

function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  clearSpeakingBtn();
}

async function isRemoteTTSAllowed() {
  try {
    if (typeof GM_getValue !== 'undefined') {
      const s = GM_getValue('settings');
      if (s) return JSON.parse(s).allowRemoteTTS === true;
    }
    return false;
  } catch { return false; }
}

function speak(text, lang) {
  stopSpeak();
  const ttsLang = TTS_LANG_MAP[lang] || "en";

  if (window.speechSynthesis) {
    const voices = speechSynthesis.getVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = ttsLang;
    utter.rate = 1;
    const matched = voices.find((v) => v.lang === ttsLang);
    if (matched) utter.voice = matched;
    utter.addEventListener("end", () => clearSpeakingBtn());
    utter.addEventListener("error", async () => {
      clearSpeakingBtn();
      if (await isRemoteTTSAllowed()) {
        speakGoogleTTS(text, ttsLang);
      }
    });
    speechSynthesis.speak(utter);
    return;
  }

  isRemoteTTSAllowed().then((allowed) => {
    if (allowed) speakGoogleTTS(text, ttsLang);
  });
}

function speakGoogleTTS(text, lang) {
  const truncated = text.length > 200 ? text.substring(0, 200) : text;
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${lang}&client=dict-chrome-ex`;
  const audio = new Audio(url);
  currentAudio = audio;
  const onDone = () => { currentAudio = null; clearSpeakingBtn(); };
  audio.addEventListener("ended", onDone);
  audio.addEventListener("error", onDone);
  audio.play().catch(onDone);
}


// ===== background/translate-google.js =====
const GOOGLE_API = "https://translate.googleapis.com/translate_a/single";
const GOOGLE_TIMEOUT = 10000;

function gmFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || GOOGLE_TIMEOUT;
    const timer = setTimeout(() => {
      if (typeof GM_xmlhttpRequest !== 'undefined') {
        try { GM_xmlhttpRequest({ url, abort: () => {}, method: 'GET' }); } catch {}
      }
      reject(new Error('Request timeout'));
    }, timeout);

    if (typeof GM_xmlhttpRequest === 'undefined') {
      clearTimeout(timer);
      reject(new Error('GM_xmlhttpRequest not available'));
      return;
    }

    const req = GM_xmlhttpRequest({
      method: options.method || 'GET',
      url: url,
      headers: options.headers || {},
      data: options.body || null,
      onload: function(resp) {
        clearTimeout(timer);
        resolve(resp);
      },
      onerror: function(err) {
        clearTimeout(timer);
        reject(new Error(err?.error || 'Network error'));
      },
      ontimeout: function() {
        clearTimeout(timer);
        reject(new Error('Request timeout'));
      },
    });
  });
}

async function translateGoogle(text, sl, tl) {
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl, tl, dt: "t", q: text });
  const url = `${GOOGLE_API}?${params}`;
  try {
    const resp = await gmFetch(url);
    if (resp.status !== 200) throw new Error(`HTTP ${resp.status}`);
    const data = JSON.parse(resp.responseText);
    let result = "";
    if (data && data[0]) {
      result = data[0].filter((i) => i && i[0]).map((i) => i[0]).join("");
    }
    return result;
  } catch (e) {
    throw e;
  }
}


// ===== background/translate-bing.js =====
let bingConfig = null;

const BING_LANG_MAP = {
  "auto": "auto-detect",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

function bingLang(code) {
  return BING_LANG_MAP[code] || code;
}

function gmFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      reject(new Error('GM_xmlhttpRequest not available'));
      return;
    }
    GM_xmlhttpRequest({
      method: options.method || 'GET',
      url: url,
      headers: options.headers || {},
      data: options.body || null,
      onload: function(resp) {
        resolve(resp);
      },
      onerror: function(err) {
        reject(new Error(err?.error || 'Network error'));
      },
      ontimeout: function() {
        reject(new Error('Request timeout'));
      },
    });
  });
}

async function fetchBingConfig() {
  const resp = await gmFetch("https://www.bing.com/translator");
  if (resp.status !== 200) throw new Error(`HTTP ${resp.status}`);
  const html = resp.responseText;

  const igMatch = html.match(/IG:"([^"]+)"/) || html.match(/IG\s*=\s*"([^"]+)"/);
  if (!igMatch) throw new Error("Failed to extract IG");
  const ig = igMatch[1];

  const iidMatch = html.match(/data-iid="([^"]+)"/);
  if (!iidMatch) throw new Error("Failed to extract IID");
  const iid = iidMatch[1];

  const paramsMatch = html.match(/params_AbusePreventionHelper\s*=\s*\[(\d+),\s*"([^"]*)",\s*(\d+)\]/);
  if (!paramsMatch) throw new Error("Failed to extract abuse prevention params");
  const token = paramsMatch[2];
  const key = paramsMatch[1];
  const tokenExpiryInterval = parseInt(paramsMatch[3], 10);

  bingConfig = {
    ig, iid, token, key,
    expiry: Date.now() + tokenExpiryInterval,
  };
  return bingConfig;
}

async function getBingConfig() {
  if (bingConfig && Date.now() < bingConfig.expiry) return bingConfig;
  return fetchBingConfig();
}

function clearBingConfig() {
  bingConfig = null;
}

async function translateBing(text, sl, tl) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const config = await getBingConfig();
      const bsl = bingLang(sl);
      const btl = bingLang(tl);

      const body = new URLSearchParams({
        fromLang: bsl, text, token: config.token,
        key: config.key, to: btl,
      }).toString();

      const url = `https://www.bing.com/ttranslatev3?isVertical=1&IG=${config.ig}&IID=${config.iid}.1`;
      const resp = await gmFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://www.bing.com/translator",
        },
        body: body,
      });

      if (resp.status !== 200) {
        const err = new Error(`HTTP ${resp.status}`);
        lastError = err;
        if (attempt === 0) { clearBingConfig(); continue; }
        throw err;
      }

      const data = JSON.parse(resp.responseText);

      if (data.ShowCaptcha || data.StatusCode === 401) {
        const err = new Error(data.ShowCaptcha ? "Captcha required" : "Unauthorized");
        lastError = err;
        if (attempt === 0) { clearBingConfig(); continue; }
        throw err;
      }

      if (!data || !data[0] || !data[0].translations || !data[0].translations[0]) {
        throw new Error("Unexpected response format");
      }

      return data[0].translations[0].text;
    } catch (e) {
      lastError = e;
      if (attempt === 0) { clearBingConfig(); continue; }
      throw lastError;
    }
  }
  throw lastError || new Error("Translation failed");
}


// ===== background/translate-engine.js =====
const REGISTRY = new Map();
const cache = new Map();
const CACHE_MAX = 2000;

function textHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function registerEngine(name, translateFn) {
  REGISTRY.set(name, translateFn);
}
registerEngine("google", translateGoogle);
registerEngine("bing", translateBing);

function makeCacheKey(text, sl, tl, eng) {
  const textKey = text.length <= 200 ? text : `${text.substring(0, 200)}#${textHash(text)}`;
  return `${eng}:${sl}:${tl}:${textKey}`;
}

function cacheGet(key) {
  if (cache.has(key)) {
    const val = cache.get(key);
    cache.delete(key);
    cache.set(key, val);
    return val;
  }
  return null;
}

function cacheSet(key, val) {
  cache.set(key, val);
  while (cache.size > CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
}

async function translateWithRetry(fn, text, sl, tl, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(text, sl, tl);
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      } else {
        throw e;
      }
    }
  }
}

async function translate(text, sl, tl, engine) {
  if (!text || !text.trim()) return "";
  if (sl === tl && sl !== "auto") return text;
  const eng = engine || "google";
  const key = makeCacheKey(text, sl, tl, eng);
  const cached = cacheGet(key);
  if (cached) return cached;
  const fn = REGISTRY.get(eng);
  if (!fn) throw new Error(`Unknown translation engine: ${eng}`);
  const result = await translateWithRetry(fn, text, sl, tl);
  cacheSet(key, result);
  return result;
}

async function translateBatch(texts, sl, tl, engine) {
  if (!texts?.length) return [];
  const eng = engine || "google";
  const fn = REGISTRY.get(eng);
  if (!fn) throw new Error(`Unknown translation engine: ${eng}`);
  const results = [];
  const uncached = [];
  const uncachedIdx = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text || !text.trim()) {
      results[i] = "";
      continue;
    }
    const key = makeCacheKey(text, sl, tl, eng);
    const cached = cacheGet(key);
    if (cached) {
      results[i] = cached;
    } else {
      results[i] = undefined;
      uncached.push(text);
      uncachedIdx.push(i);
    }
  }
  if (uncached.length) {
    const batchResults = await Promise.allSettled(
      uncached.map(text => translateWithRetry(fn, text, sl, tl))
    );
    for (let j = 0; j < uncachedIdx.length; j++) {
      const idx = uncachedIdx[j];
      const r = batchResults[j];
      if (r.status === 'fulfilled') {
        results[idx] = r.value;
        const key = makeCacheKey(uncached[j], sl, tl, eng);
        cacheSet(key, r.value);
      } else {
        results[idx] = null;
      }
    }
  }
  return results;
}


// ===== background/settings.js =====
const EN_LANG_NAMES = {
  auto: "Detect Language", "zh-CN": "Chinese (Simplified)", "zh-TW": "Chinese (Traditional)",
  en: "English", ja: "Japanese", ko: "Korean", fr: "French", de: "German",
  es: "Spanish", pt: "Portuguese", ru: "Russian", ar: "Arabic", th: "Thai",
  vi: "Vietnamese", id: "Indonesian", it: "Italian", nl: "Dutch", pl: "Polish",
  tr: "Turkish", hi: "Hindi",
};

const SETTINGS_LANGS = LANG_CODES.map((code) => ({ code, name: EN_LANG_NAMES[code] || code }));

const DEF = {
  selTL: getBrowserLang(),
  inputSL: "auto",
  inputTL: "en",
  pgTL: getBrowserLang(),
  enSel: true,
  enInput: true,
  enPage: true,
  enFloat: true,
  autoTranslate: false,
  ignLangs: [],
  selEngine: "google",
  inputEngine: "google",
  pgEngine: "google",
  blacklist: [],
  rulesUrl: "",
  allowRemoteTTS: false,
};

async function getSettings() {
  let stored = null;
  if (typeof GM_getValue !== 'undefined') {
    try {
      const raw = GM_getValue('settings');
      if (raw) stored = JSON.parse(raw);
    } catch {}
  }
  return { ...DEF, ...(stored || {}) };
}

async function saveSettings(settings) {
  if (typeof GM_setValue !== 'undefined') {
    GM_setValue('settings', JSON.stringify(settings));
  }
}


// ===== background/rules-data.js =====
const DEFAULT_RULES_URL = "https://raw.githubusercontent.com/translate-ext/rules/main/rules.json";

let cachedMerged = null;
let remoteRules = null;
let rulesETag = null;
let rulesLastFetch = 0;
const RULES_CACHE_TTL = 4 * 60 * 60 * 1000;

function mergeRules(base, remote) {
  if (!remote || !remote.length) return base;
  const map = new Map();
  for (const r of base) map.set(r.name, r);
  for (const r of remote) {
    if (!r.name) continue;
    map.set(r.name, r);
  }
  return [...map.values()];
}

async function loadRulesFromStorage() {
  try {
    if (typeof GM_getValue !== 'undefined') {
      const raw = GM_getValue('remoteRules');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.rules) remoteRules = data.rules;
        rulesETag = data.etag || null;
        rulesLastFetch = data.lastFetch || 0;
        cachedMerged = mergeRules(BUNDLED_RULES, remoteRules);
        return cachedMerged;
      }
    }
  } catch {}
  return null;
}

async function saveRemoteRules(rules, etag) {
  try {
    remoteRules = rules;
    rulesETag = etag;
    rulesLastFetch = Date.now();
    cachedMerged = mergeRules(BUNDLED_RULES, rules);
    if (typeof GM_setValue !== 'undefined') {
      GM_setValue('remoteRules', JSON.stringify({
        rules, etag: etag || null, lastFetch: rulesLastFetch
      }));
    }
  } catch {}
}

function gmFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      reject(new Error('GM_xmlhttpRequest not available'));
      return;
    }
    GM_xmlhttpRequest({
      method: options.method || 'GET',
      url: url,
      headers: options.headers || {},
      data: options.body || null,
      onload: function(resp) { resolve(resp); },
      onerror: function(err) { reject(new Error(err?.error || 'Network error')); },
      ontimeout: function() { reject(new Error('Request timeout')); },
    });
  });
}

async function fetchRemoteRules() {
  const settings = await getSettings();
  const rulesUrl = settings.rulesUrl || DEFAULT_RULES_URL;
  try {
    const headers = {};
    if (rulesETag) headers["If-None-Match"] = rulesETag;
    const resp = await gmFetch(rulesUrl, { headers: headers });
    if (resp.status === 304) return cachedMerged;
    if (resp.status !== 200) throw new Error(`HTTP ${resp.status}`);
    const rules = JSON.parse(resp.responseText);
    if (!Array.isArray(rules)) throw new Error("Invalid rules format");
    const newETag = resp.responseHeaders?.match(/etag:\s*([^\s]+)/i)?.[1] || null;
    await saveRemoteRules(rules, newETag);
    return cachedMerged;
  } catch (e) {
    return cachedMerged || BUNDLED_RULES;
  }
}

async function getSiteRules() {
  if (cachedMerged) {
    const now = Date.now();
    if ((now - rulesLastFetch) < RULES_CACHE_TTL) return cachedMerged;
  }
  if (!cachedMerged) {
    const stored = await loadRulesFromStorage();
    if (stored) {
      fetchRemoteRules().catch(() => {});
      return stored;
    }
  }
  const rules = await fetchRemoteRules();
  if (!rules) return BUNDLED_RULES;
  return rules;
}

function extractHostPattern(pattern) {
  let host = pattern;
  if (host.includes('://')) host = host.split('://')[1];
  if (host.includes('/')) host = host.split('/')[0];
  return host;
}

function matchGlob(value, glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try { return new RegExp('^' + escaped + '$').test(value); } catch { return false; }
}

function matchHostnameOrUrl(url, pattern) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;

  let hostPattern = pattern;
  let pathPart = null;
  if (hostPattern.includes('://')) hostPattern = hostPattern.split('://')[1];
  const slashIdx = hostPattern.indexOf('/');
  if (slashIdx !== -1) {
    pathPart = hostPattern.substring(slashIdx);
    hostPattern = hostPattern.substring(0, slashIdx);
  }

  if (hostPattern === '*') {
    if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
    return true;
  }

  let hostMatch = false;
  if (hostPattern === hostname) hostMatch = true;
  else if (hostname.endsWith('.' + hostPattern)) hostMatch = true;
  else if (hostPattern.startsWith('*.') && (hostname === hostPattern.slice(2) || hostname.endsWith('.' + hostPattern.slice(2)))) hostMatch = true;
  else if (matchGlob(hostname, hostPattern)) hostMatch = true;

  if (!hostMatch) return false;
  if (pathPart) return matchGlob(parsed.pathname + parsed.search, pathPart);
  return true;
}

function matchExcludeUrl(url, pattern) {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const hostPattern = extractHostPattern(pattern);
  if (!hostname.endsWith(hostPattern) && hostPattern !== hostname) {
    const dotHost = '.' + hostPattern;
    if (!hostname.endsWith(dotHost) && hostname !== hostPattern) return false;
  }
  const slashIdx = pattern.indexOf('/', pattern.indexOf('://') + 3);
  if (slashIdx === -1) return true;
  const pathPart = pattern.substring(slashIdx);
  const urlPath = parsed.pathname + parsed.search;
  const escaped = pathPart.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try {
    return new RegExp('^' + escaped + '$').test(urlPath);
  } catch { return false; }
}

function matchUrlAgainstPatterns(url, patterns) {
  if (!patterns?.length) return false;
  for (const p of patterns) {
    const pattern = p.trim();
    if (!pattern) continue;
    if (matchHostnameOrUrl(url, pattern)) return true;
  }
  return false;
}

function matchRule(rules, url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    for (const rule of rules) {
      if (rule.excludeMatches?.length) {
        let excluded = false;
        for (const p of rule.excludeMatches) {
          if (matchExcludeUrl(url, p)) { excluded = true; break; }
        }
        if (excluded) continue;
      }
      if (rule.matches?.length) {
        if (matchUrlAgainstPatterns(url, rule.matches)) return rule;
        continue;
      }
      if (!rule.urlPattern) continue;
      const patterns = rule.urlPattern.split("|");
      for (const p of patterns) {
        const pattern = p.trim();
        if (!pattern) continue;
        if (matchHostname(hostname, pattern)) return rule;
      }
    }
  } catch {}
  return null;
}

async function initRules() {
  const stored = await loadRulesFromStorage();
  if (!stored) {
    cachedMerged = [...BUNDLED_RULES];
    fetchRemoteRules().catch(() => {});
  }
}

function resetRulesCache() {
  rulesLastFetch = 0;
  cachedMerged = null;
}


// ===== background/message-handler.js =====
function handleMessage(req, sender, respond) {
  if (req.action === "translate") {
    translate(req.text, req.sourceLang || "auto", req.targetLang || "en", req.engine)
      .then((r) => respond({ success: true, result: r }))
      .catch((e) => respond({ success: false, error: e.message }));
    return true;
  }

  if (req.action === "translateBatch") {
    translateBatch(req.texts, req.sourceLang || "auto", req.targetLang || "en", req.engine)
      .then((r) => respond({ success: true, results: r }))
      .catch((e) => respond({ success: false, error: e.message }));
    return true;
  }

  if (req.action === "getSettings") {
    getSettings().then((s) => respond({ settings: s }));
    return true;
  }

  if (req.action === "saveSettings") {
    saveSettings(req.settings).then(() => {
      respond({ success: true });
    });
    return true;
  }

  if (req.action === "getLanguages") {
    respond({ languages: SETTINGS_LANGS });
    return false;
  }

  if (req.action === "getEngines") {
    respond({ engines: ENGINES });
    return false;
  }

  if (req.action === "testEngine") {
    const engine = req.engine || "google";
    translate("Hello world", "en", "zh-CN", engine)
      .then((r) => respond({ success: true, result: r, engine }))
      .catch((e) => respond({ success: false, error: e.message, engine }));
    return true;
  }

  if (req.action === "openOptions") {
    showOptionsPanel();
    respond({ success: true });
    return false;
  }

  if (req.action === "setEnFloat") {
    getSettings().then(async (s) => {
      s.enFloat = !!req.value;
      await saveSettings(s);
      respond({ success: true });
    });
    return true;
  }

  if (req.action === "checkBlacklist") {
    getSettings().then((s) => {
      let blacklisted = false;
      try {
        const hostname = new URL(req.url).hostname;
        blacklisted = isHostBlacklisted(hostname, s.blacklist || []);
      } catch {}
      respond({ blacklisted });
    });
    return true;
  }

  if (req.action === "addBlacklist") {
    getSettings().then(async (s) => {
      if (!s.blacklist) s.blacklist = [];
      if (!s.blacklist.includes(req.host)) {
        s.blacklist.push(req.host);
        await saveSettings(s);
      }
      respond({ success: true });
    });
    return true;
  }

  if (req.action === "removeBlacklist") {
    getSettings().then(async (s) => {
      if (!s.blacklist) s.blacklist = [];
      s.blacklist = s.blacklist.filter((h) => h !== req.host);
      await saveSettings(s);
      respond({ success: true });
    });
    return true;
  }

  if (req.action === "getSiteRule") {
    getSiteRules().then((rules) => {
      const url = req.url || (sender && sender.tab && sender.tab.url) || "";
      respond({ rule: matchRule(rules, url) });
    });
    return true;
  }

  if (req.action === "getAllRules") {
    getSiteRules().then((rules) => respond({ rules }));
    return true;
  }

  if (req.action === "refreshRules") {
    resetRulesCache();
    fetchRemoteRules().then((rules) => respond({ rules: rules || [] }));
    return true;
  }

  if (req.action === "updateRules") {
    if (!Array.isArray(req.rules)) { respond({ success: false }); return false; }
    saveRemoteRules(req.rules, null).then(() => respond({ success: true }));
    return true;
  }

  return false;
}


// ===== background/index.js =====
function initBackground() {
  setMessageHandler((req, sender, respond) => {
    return handleMessage(req, sender, respond);
  });
  initRules();
}


// ===== content/ui/icons.js =====
function svgIcon(name) {
  const ICONS = {
    translate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M14.5 9a4 4 0 0 1 2 5.5"/><path d="M18.5 14.5L22 18"/><path d="M16 20l2 2 4-4"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  };
  return ICONS[name] || '';
}


// ===== content/ui/components.js =====
let openDropdown = null;

function setOpenDropdown(dd) { openDropdown = dd; }
function getOpenDropdown() { return openDropdown; }

function closeDropdown() {
  if (openDropdown) {
    openDropdown.list.classList.remove("tr-dd-open");
    openDropdown = null;
  }
}

function buildDropdown(id, val, includeAuto, onChange, disabled, panelRef) {
  const dd = document.createElement("div");
  dd.className = "tr-dd";

  const btn = document.createElement("button");
  btn.className = "tr-dd-btn";
  btn.id = id;
  if (disabled) btn.disabled = true;

  const list = document.createElement("div");
  list.className = "tr-dd-list";

  let currentName = "";
  LANGS.forEach((l) => {
    if (!includeAuto && l.code === "auto") return;
    const item = document.createElement("div");
    item.className = "tr-dd-item" + (l.code === val ? " tr-dd-active" : "");
    item.textContent = l.name;
    item.dataset.code = l.code;
    if (l.code === val) currentName = l.name;
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.textContent = l.name;
      btn.dataset.code = l.code;
      list.querySelectorAll(".tr-dd-item").forEach((it) => it.classList.remove("tr-dd-active"));
      item.classList.add("tr-dd-active");
      closeDropdown();
      if (onChange) onChange(l.code);
    });
    list.appendChild(item);
  });

  btn.textContent = currentName;
  btn.dataset.code = val;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (btn.disabled) return;
    if (list.classList.contains("tr-dd-open")) {
      closeDropdown();
    } else {
      closeDropdown();
      const panelRect = panelRef ? panelRef.getBoundingClientRect() : null;
      const btnRect = btn.getBoundingClientRect();
      if (panelRect) {
        const available = panelRect.bottom - btnRect.bottom - 8;
        list.style.maxHeight = Math.max(60, available) + "px";
      }
      list.classList.add("tr-dd-open");
      openDropdown = { btn, list };
    }
  });

  dd.appendChild(btn);
  dd.appendChild(list);
  return dd;
}

function buildEngineDropdown(id, val, onChange, panelRef) {
  const dd = document.createElement("div");
  dd.className = "tr-dd";

  const btn = document.createElement("button");
  btn.className = "tr-dd-btn tr-engine-btn";
  btn.id = id;

  const list = document.createElement("div");
  list.className = "tr-dd-list";

  let currentName = "";
  ENGINES.forEach((e) => {
    const item = document.createElement("div");
    item.className = "tr-dd-item" + (e.id === val ? " tr-dd-active" : "");
    item.textContent = e.name;
    item.dataset.code = e.id;
    if (e.id === val) currentName = e.name;
    item.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });
    item.addEventListener("click", (ev) => {
      ev.stopPropagation();
      btn.textContent = e.name;
      btn.dataset.code = e.id;
      list.querySelectorAll(".tr-dd-item").forEach((it) => it.classList.remove("tr-dd-active"));
      item.classList.add("tr-dd-active");
      closeDropdown();
      if (onChange) onChange(e.id);
    });
    list.appendChild(item);
  });

  btn.textContent = currentName;
  btn.dataset.code = val;

  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (list.classList.contains("tr-dd-open")) {
      closeDropdown();
    } else {
      closeDropdown();
      const panelRect = panelRef ? panelRef.getBoundingClientRect() : null;
      const btnRect = btn.getBoundingClientRect();
      if (panelRect) {
        const available = panelRect.bottom - btnRect.bottom - 8;
        list.style.maxHeight = Math.max(60, available) + "px";
      }
      list.classList.add("tr-dd-open");
      openDropdown = { btn, list };
    }
  });

  dd.appendChild(btn);
  dd.appendChild(list);
  return dd;
}

function position(el, x, y) {
  const r = el.getBoundingClientRect();
  const w = r.width || 150;
  const h = r.height || 36;
  let l = x - w / 2, t = y + 12;
  if (l < 8) l = 8;
  if (l + w > innerWidth - 8) l = innerWidth - w - 8;
  if (t + h > innerHeight - 8) t = y - h - 12;
  if (t < 8) t = 8;
  el.style.left = l + "px";
  el.style.top = t + "px";
}

function positionPanel(panel, tBar) {
  if (!panel || !tBar) return;
  const barRect = tBar.getBoundingClientRect();
  const pw = panel.offsetWidth;
  const ph = panel.offsetHeight;
  const vw = innerWidth;
  const vh = innerHeight;
  let l = barRect.left, t = barRect.bottom + 8;
  if (l + pw > vw - 8) l = vw - pw - 8;
  if (l < 8) l = 8;
  if (t + ph > vh - 8) {
    const aboveT = barRect.top - ph - 8;
    if (aboveT >= 8) {
      t = aboveT;
    } else {
      t = Math.max(8, vh - ph - 8);
    }
  }
  if (t < 8) t = 8;
  panel.style.left = l + "px";
  panel.style.top = t + "px";
}

function isOwn(el) {
  return !!(el && (el.closest(".tr-bar") || el.closest(".tr-panel") || el.closest(".tr-bilingual")));
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "tr-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function attachSpeakHandlers(container) {
  container.querySelectorAll(".tr-speak-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.classList.contains("speaking")) {
        stopSpeak();
        return;
      }
      const lang = this.dataset.lang;
      const textEl = this.previousElementSibling;
      const text = textEl ? textEl.textContent : "";
      if (!text) return;
      stopSpeak();
      this.classList.add("speaking");
      speak(text, lang);
    });
  });
}

function attachCopyHandler(btn, text) {
  btn.addEventListener("click", async function () {
    try {
      await navigator.clipboard.writeText(text);
      this.innerHTML = `${svgIcon("check")}Copied`;
      this.classList.add("copied");
      setTimeout(() => { this.innerHTML = `${svgIcon("copy")}Copy`; this.classList.remove("copied"); }, 2000);
    } catch {}
  });
}


// ===== content/input-translate.js =====
function isEditable(el) {
  if (!el) return false;
  if (el.tagName === "INPUT") {
    const type = (el.type || "").toLowerCase();
    return ["text", "search", "url", "tel", "email", "password", "number"].includes(type);
  }
  if (el.tagName === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
}

function doReplace(el, text) {
  if (!el || text == null) return;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = el.value.substring(0, start);
    const after = el.value.substring(end);
    el.value = before + text + after;
    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}


// ===== content/sel-translate.js =====
let tBar = null;
let panel = null;
let busy = false;
let hoverTimer = null;
let panelTimer = null;
let actInput = null;
let selText = "";
let lastX = 0;
let lastY = 0;

function getTBar() { return tBar; }
function setTBar(v) { tBar = v; }
function getPanel() { return panel; }
function setPanel(v) { panel = v; }
function getBusy() { return busy; }
function getActInput() { return actInput; }
function getSelText() { return selText; }
function getLastX() { return lastX; }
function getLastY() { return lastY; }
function setLastX(v) { lastX = v; }
function setLastY(v) { lastY = v; }

function clearAll() {
  closeDropdown();
  if (tBar) { tBar.remove(); tBar = null; }
  if (panel) { panel.remove(); panel = null; }
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
  if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
  busy = false;
}

function getSelection() {
  const ae = document.activeElement;
  if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) {
    const st = ae.selectionStart, en = ae.selectionEnd;
    if (st !== en) {
      actInput = ae;
      selText = ae.value.substring(st, en);
      return { text: selText, isInput: true, el: ae };
    }
  }

  const s = window.getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return null;
  const txt = s.toString().trim();
  if (!txt || txt.length < 2 || txt.length > 2000) return null;

  actInput = null;
  selText = txt;

  const an = s.anchorNode;
  if (an) {
    let p = an.parentElement;
    while (p) {
      if (p.isContentEditable) { actInput = p; break; }
      p = p.parentElement;
    }
  }

  return { text: txt, isInput: !!actInput, el: actInput };
}

function showToolbar(x, y, txt, isInput, S) {
  clearAll();

  tBar = document.createElement("div");
  tBar.className = "tr-bar";
  tBar.innerHTML = `<button class="tr-btn tr-primary tr-btn-icon" id="tr-translate-btn">${svgIcon("translate")}</button>`;
  document.body.appendChild(tBar);

  const defaultTL = isInput ? (S.inputTL || "en") : (S.selTL || "en");
  const defaultEngine = isInput ? (S.inputEngine || "google") : (S.selEngine || "google");

  requestAnimationFrame(() => {
    if (!tBar) return;
    position(tBar, x, y);

    const btn = tBar.querySelector("#tr-translate-btn");
    if (!btn) return;

    btn.addEventListener("mouseenter", () => {
      hoverTimer = setTimeout(() => showPanel(txt, defaultTL, defaultEngine), 250);
    });
    btn.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimer);
    });
  });
}

function showPanel(txt, tl, engine) {
  if (busy) return;
  if (panel) { panel.remove(); panel = null; }
  busy = true;

  const curEngine = engine || "google";

  panel = document.createElement("div");
  panel.className = "tr-panel";

  const head = document.createElement("div");
  head.className = "tr-phead";

  const langWrap = document.createElement("div");
  langWrap.className = "tr-plang";

  const srcDD = buildDropdown("tr-panel-src", "auto", true, () => { }, true, panel);
  const arrow = document.createElement("span");
  arrow.className = "tr-arrow";
  arrow.textContent = "→";
  const tgtDD = buildDropdown("tr-panel-tgt", tl, false, (code) => {
    reTranslate(txt, code, panel.dataset.engine || curEngine);
  }, false, panel);

  langWrap.appendChild(srcDD);
  langWrap.appendChild(arrow);
  langWrap.appendChild(tgtDD);

  const engineSep = document.createElement("span");
  engineSep.className = "tr-engine-sep";
  langWrap.appendChild(engineSep);

  const engineDD = buildEngineDropdown("tr-panel-engine", curEngine, (eng) => {
    panel.dataset.engine = eng;
    const srcBtn = panel.querySelector("#tr-panel-src");
    const sl = srcBtn ? srcBtn.dataset.code : "auto";
    const tgtBtn = panel.querySelector("#tr-panel-tgt");
    const newTL = tgtBtn ? tgtBtn.dataset.code : tl;
    reTranslate(txt, newTL, eng);
  }, panel);

  langWrap.appendChild(engineDD);

  const closeBtn = document.createElement("button");
  closeBtn.className = "tr-pclose";
  closeBtn.innerHTML = svgIcon("close");
  closeBtn.addEventListener("click", () => clearAll());

  head.appendChild(langWrap);
  head.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "tr-pbody";
  body.innerHTML = `
    <div class="tr-original">${escHtml(txt.substring(0, 200))}</div>
    <div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>
  `;

  panel.appendChild(head);
  panel.appendChild(body);
  panel.dataset.engine = curEngine;

  document.body.appendChild(panel);
  positionPanel(panel, tBar);
  doTranslate(txt, "auto", tl, curEngine);
  startPanelTimer();
}

function startPanelTimer() {
  if (panelTimer) clearTimeout(panelTimer);

  function scheduleClose() {
    panelTimer = setTimeout(() => {
      const pH = panel && panel.matches(":hover");
      const bH = tBar && tBar.matches(":hover");
      if (!pH && !bH) clearAll();
      else panelTimer = null;
    }, 500);
  }

  function cancelClose() {
    if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }
  }

  if (tBar) {
    tBar.addEventListener("mouseenter", cancelClose);
    tBar.addEventListener("mouseleave", scheduleClose);
  }
  if (panel) {
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);
  }
}

async function doTranslate(txt, sl, tl, engine) {
  const loadingEl = panel && panel.querySelector(".tr-loading");
  if (!panel) return;
  try {
    const r = await sendMessage({ action: "translate", text: txt, sourceLang: sl, targetLang: tl, engine: engine || "google" });
    if (r.success && panel) {
      const body = panel.querySelector(".tr-pbody");
      const isInput = actInput && isEditable(actInput);
      const srcLang = sl || "auto";
      body.innerHTML = `
        <div class="tr-original"><span class="tr-original-text">${escHtml(txt.substring(0, 200))}</span><button class="tr-speak-btn" data-lang="${srcLang}">${svgIcon("volume")}</button></div>
        <div class="tr-result"><span class="tr-result-text">${escHtml(r.result)}</span><button class="tr-speak-btn" data-lang="${tl}">${svgIcon("volume")}</button></div>
        <div class="tr-actions">
          <button class="tr-copy-btn">${svgIcon("copy")}Copy</button>
          ${isInput ? `<button class="tr-replace-btn">${svgIcon("replace")}Replace</button>` : ""}
        </div>
      `;
      requestAnimationFrame(() => positionPanel(panel, tBar));
      attachSpeakHandlers(body);
      attachCopyHandler(body.querySelector(".tr-copy-btn"), r.result);
      const rpBtn = body.querySelector(".tr-replace-btn");
      if (rpBtn) rpBtn.addEventListener("click", () => { doReplace(r.result, actInput, selText, showToast); clearAll(); });
    } else if (!r.success && panel && loadingEl) {
      loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Translation failed: ${escHtml(r.error || "unknown error")}</div>`;
      requestAnimationFrame(() => positionPanel(panel, tBar));
    }
  } catch (e) {
    if (panel && loadingEl) loadingEl.outerHTML = `<div class="tr-result" style="color:#ef4444;">Error: ${escHtml(e.message)}</div>`;
    if (panel) requestAnimationFrame(() => positionPanel(panel, tBar));
  }
  busy = false;
}

async function reTranslate(txt, newTL, engine) {
  if (!panel) return;
  busy = true;
  const srcBtn = panel.querySelector("#tr-panel-src");
  const sl = srcBtn ? srcBtn.dataset.code : "auto";
  const body = panel.querySelector(".tr-pbody");
  body.innerHTML = `<div class="tr-original">${escHtml(txt.substring(0, 200))}</div><div class="tr-loading"><span class="tr-spinner"></span>Translating...</div>`;
  doTranslate(txt, sl, newTL, engine || "google");
}


// ===== content/page-translate.js =====
const PAGE_MARKER = 'data-ez-translated';
const MAX_TEXT_LENGTH_PER_REQUEST = 1800;
const MAX_TEXT_GROUP_LENGTH = 50;
const SCROLL_LIMIT_SCREENS = 1;
const TRANSLATION_CACHE_KEY_PREFIX = 'tr-cache:';
const DEFER_CHARS_PER_FRAME = 5000;

let injectedCssCache = new Set();

function injectRuleCss(cssRules) {
  if (!cssRules?.length) return;
  const key = cssRules.join('|');
  if (injectedCssCache.has(key)) return;
  injectedCssCache.add(key);
  try {
    const style = document.createElement('style');
    style.setAttribute('data-ez-css', '');
    style.textContent = cssRules.join('\n');
    document.head.appendChild(style);
  } catch { }
}

function applyGlobalStyles(styles) {
  if (!styles) return;
  try {
    const styleId = 'ez-global-styles';
    if (document.getElementById(styleId)) return;
    const css = Object.entries(styles)
      .map(([sel, rules]) => `${sel} { ${rules} }`)
      .join('\n');
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  } catch { }
}

function applyFixedElements(fixedElements) {
  if (!fixedElements?.length) return;
  for (const { selector, text } of fixedElements) {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      if (el.getAttribute(PAGE_MARKER)) continue;
      const txt = el.textContent.trim();
      if (txt && txt !== text) {
        el.textContent = text;
        el.setAttribute(PAGE_MARKER, 'fixed');
      }
    }
  }
}

function collectVisibleTextNodes(root, excluded, skipTags) {
  const nodes = [];
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      if (!text) continue;
      const parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest(`[${PAGE_MARKER}]`)) continue;
      if (shouldSkipElement(parent, excluded)) continue;
      if (skipTags.has(parent.tagName)) continue;
      nodes.push(node);
    }
  } catch { }
  return nodes;
}

function walkShadowText(root, excluded, skipTags, nodes, excludeSlots, enterShadow) {
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (excludeSlots?.length) {
      const slot = root.getAttribute('slot');
      if (slot && excludeSlots.includes(slot)) return;
    }
  }
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;
    if (!parent) return;
    if (parent.closest(`[${PAGE_MARKER}]`)) return;
    if (shouldSkipElement(parent, excluded)) return;
    if (skipTags.has(parent.tagName)) return;
    if (!root.textContent.trim()) return;
    nodes.push(root);
    return;
  }
  if (enterShadow !== false && root.shadowRoot) {
    walkShadowText(root.shadowRoot, excluded, skipTags, nodes, excludeSlots, enterShadow);
  }
  let child = root.firstChild;
  while (child) {
    walkShadowText(child, excluded, skipTags, nodes, excludeSlots, enterShadow);
    child = child.nextSibling;
  }
}

function collectByContainerMode(rule) {
  const containers = document.querySelectorAll(rule.containerSelector);
  if (!containers.length) return [];
  const excluded = buildExcludeSet(rule.excludeSelectors);
  if (rule.excludeSlots?.length) {
    for (const container of containers) {
      const allElements = container.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const slot = allElements[i].getAttribute('slot');
        if (slot && rule.excludeSlots.includes(slot)) excluded.add(allElements[i]);
      }
    }
  }
  const blockTags = new Set(rule.extraBlockSelectors || []);
  const skipTags = new Set([...IGNORE_TAGS, ...(rule.extraBlockTags || []), ...STAY_ORIGINAL_TAGS, ...blockTags]);
  const nodes = [];
  const enterShadow = !rule.shadowSelectors?.length;
  for (const root of containers) {
    walkShadowText(root, excluded, skipTags, nodes, rule.excludeSlots, enterShadow);
  }
  if (rule.shadowSelectors?.length) {
    for (const sel of rule.shadowSelectors) {
      const parts = sel.split(' >>> ');
      if (parts.length === 2) {
        const hosts = document.querySelectorAll(parts[0]);
        for (const host of hosts) {
          if (host.shadowRoot) {
            const targets = host.shadowRoot.querySelectorAll(parts[1]);
            for (const target of targets) {
              if (target.getAttribute(PAGE_MARKER)) continue;
              if (excluded.has(target)) continue;
              const inner = collectVisibleTextNodes(target, excluded, skipTags);
              nodes.push(...inner);
            }
          }
        }
      } else {
        for (const el of document.querySelectorAll(sel)) {
          if (el.getAttribute(PAGE_MARKER)) continue;
          if (excluded.has(el)) continue;
          const inner = collectVisibleTextNodes(el, excluded, skipTags);
          nodes.push(...inner);
        }
      }
    }
  }
  return nodes;
}

function collectBySelectMode(rule) {
  const selectors = rule.selectors;
  if (!selectors?.length) return [];
  const excluded = buildExcludeSet(rule.excludeSelectors);
  const blockTags = new Set(rule.extraBlockSelectors || []);
  const skipTags = new Set([...IGNORE_TAGS, ...STAY_ORIGINAL_TAGS, ...blockTags]);
  const nodes = [];
  for (const sel of selectors) {
    if (sel.includes(' >>> ')) {
      const parts = sel.split(' >>> ');
      if (parts.length === 2) {
        const hosts = document.querySelectorAll(parts[0]);
        for (const host of hosts) {
          if (host.shadowRoot) {
            const targets = host.shadowRoot.querySelectorAll(parts[1]);
            for (const target of targets) {
              if (target.getAttribute(PAGE_MARKER)) continue;
              if (excluded.has(target)) continue;
              const inner = collectVisibleTextNodes(target, excluded, skipTags);
              nodes.push(...inner);
            }
          }
        }
      }
    } else if (sel.includes(' -> ')) {
      const parts = sel.split(' -> ').map(s => s.trim());
      let current = document;
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const found = current.querySelectorAll(parts[i]);
        if (!found.length) break;
        if (isLast) {
          for (const el of found) {
            if (el.getAttribute(PAGE_MARKER)) continue;
            if (excluded.has(el)) continue;
            const inner = collectVisibleTextNodes(el, excluded, skipTags);
            nodes.push(...inner);
          }
        } else {
          const next = found[0];
          current = next.shadowRoot || next;
        }
      }
    } else {
      let els = document.querySelectorAll(sel);
      for (const el of els) {
        if (el.getAttribute(PAGE_MARKER)) continue;
        if (excluded.has(el)) continue;
        const inner = collectVisibleTextNodes(el, excluded, skipTags);
        nodes.push(...inner);
      }
      for (const host of document.querySelectorAll('*')) {
        if (!host.shadowRoot) continue;
        try {
          els = host.shadowRoot.querySelectorAll(sel);
          for (const el of els) {
            if (el.getAttribute(PAGE_MARKER)) continue;
            if (excluded.has(el)) continue;
            const inner = collectVisibleTextNodes(el, excluded, skipTags);
            nodes.push(...inner);
          }
        } catch { }
      }
    }
  }
  return nodes;
}

function collectTargetNodes(rule) {
  if (rule.selectors?.length) return collectBySelectMode(rule);
  return collectByContainerMode(rule);
}

function isNodeVisible(node) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return false;
  return !shouldSkipByVisibility(el);
}

function isNodeInViewport(node, screens) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return true;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const maxScroll = vh * (screens || SCROLL_LIMIT_SCREENS);
  return rect.top < vh + maxScroll && rect.bottom > -maxScroll;
}

function splitTextIntoGroups(nodes, maxLength, maxGroupLength) {
  const groups = [];
  let currentGroup = [];
  let currentLength = 0;
  for (const node of nodes) {
    const text = node.textContent.trim();
    if (!text) continue;
    if (text.length > maxLength) {
      if (currentGroup.length) {
        groups.push(currentGroup);
        currentGroup = [];
        currentLength = 0;
      }
      groups.push([node]);
      continue;
    }
    if (currentLength + text.length > maxLength || currentGroup.length >= maxGroupLength) {
      if (currentGroup.length) {
        groups.push(currentGroup);
        currentGroup = [];
        currentLength = 0;
      }
    }
    currentGroup.push(node);
    currentLength += text.length;
  }
  if (currentGroup.length) groups.push(currentGroup);
  return groups;
}

async function translateText(text, sl, tl, engine, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await sendMessage({ action: "translate", text, sourceLang: sl, targetLang: tl, engine });
      if (r?.success) return r.result;
      throw new Error(r?.error || 'translate failed');
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      } else {
        throw e;
      }
    }
  }
}

let translationCache = new Map();
let translationCacheSize = 0;
const CACHE_SIZE_LIMIT = 5000;

function getCacheKey(text, sl, tl, engine) {
  return `${TRANSLATION_CACHE_KEY_PREFIX}${engine}:${sl}->${tl}:${text.length}:${text.substring(0, 50)}`;
}

function cacheGet(key) {
  const entry = translationCache.get(key);
  if (entry) return entry;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      translationCache.set(key, stored);
      translationCacheSize++;
      return stored;
    }
  } catch { }
  return null;
}

function cacheSet(key, value) {
  translationCache.set(key, value);
  translationCacheSize++;
  if (translationCacheSize > CACHE_SIZE_LIMIT) {
    const firstKey = translationCache.keys().next().value;
    if (firstKey !== undefined) {
      translationCache.delete(firstKey);
      translationCacheSize--;
    }
  }
  try {
    if (translationCacheSize <= 200) {
      sessionStorage.setItem(key, value);
    }
  } catch { }
}

async function translateNodes(nodes, sl, tl, engine, languageFilter) {
  if (!nodes.length) return 0;
  const maxLength = MAX_TEXT_LENGTH_PER_REQUEST;
  const maxGroupLength = MAX_TEXT_GROUP_LENGTH;
  const groups = splitTextIntoGroups(nodes, maxLength, maxGroupLength);
  let translated = 0;
  let charsThisFrame = 0;
  for (const group of groups) {
    const toTranslate = [];
    const cached = [];
    for (const node of group) {
      const text = node.textContent.trim();
      if (shouldSkipText(text, languageFilter === 'skip-target' ? tl : null)) continue;
      const key = getCacheKey(text, sl, tl, engine);
      const cachedResult = cacheGet(key);
      if (cachedResult) {
        cached.push({ node, text: cachedResult, original: text });
      } else {
        toTranslate.push({ node, text, key });
      }
    }
    for (const { node, text, original } of cached) {
      if (!node.parentNode) continue;
      const span = document.createElement('span');
      span.textContent = text;
      span.setAttribute(PAGE_MARKER, 'page');
      span.setAttribute('data-ez-original', original);
      node.parentNode.replaceChild(span, node);
      translated++;
    }
    if (toTranslate.length) {
      const texts = toTranslate.map(t => t.text);
      for (const { node } of toTranslate) {
        if (!node.parentNode) continue;
        const placeholder = document.createElement('span');
        placeholder.className = 'tr-translating';
        placeholder.setAttribute(PAGE_MARKER, 'translating');
        placeholder.textContent = node.textContent;
        node.parentNode.replaceChild(placeholder, node);
        node._placeholder = placeholder;
      }
      try {
        const r = await sendMessage({ action: "translateBatch", texts, sourceLang: sl, targetLang: tl, engine });
        if (r?.success && Array.isArray(r.results)) {
          for (let i = 0; i < toTranslate.length; i++) {
            const { node, key } = toTranslate[i];
            const resultText = r.results[i];
            if (resultText == null) continue;
            const placeholder = node._placeholder;
            if (!placeholder || !placeholder.parentNode) continue;
            const original = node.textContent.trim();
            cacheSet(key, resultText);
            const span = document.createElement('span');
            span.textContent = resultText;
            span.setAttribute(PAGE_MARKER, 'page');
            span.setAttribute('data-ez-original', original);
            placeholder.parentNode.replaceChild(span, placeholder);
            translated++;
          }
        } else {
          for (const { node } of toTranslate) {
            const ph = node._placeholder;
            if (ph && ph.parentNode) ph.parentNode.replaceChild(node, ph);
          }
        }
      } catch {
        for (const { node } of toTranslate) {
          const ph = node._placeholder;
          if (ph && ph.parentNode) ph.parentNode.replaceChild(node, ph);
        }
      }
    }
    charsThisFrame += group.reduce((sum, node) => sum + node.textContent.length, 0);
    if (charsThisFrame >= DEFER_CHARS_PER_FRAME) {
      await new Promise(r => requestAnimationFrame(r));
      charsThisFrame = 0;
    }
  }
  return translated;
}

let observer = null;
let pollTimer = null;
let retranslateTimer = null;
let currentRule = null;
let currentSl = null;
let currentTl = null;
let currentEngine = null;

async function retranslate() {
  if (retranslateTimer) return;
  retranslateTimer = setTimeout(() => { retranslateTimer = null; }, 300);
  const nodes = collectTargetNodes(currentRule);
  if (nodes.length) {
    await translateNodes(nodes, currentSl, currentTl, currentEngine, currentRule.languageFilter);
  }
}

function startObserver() {
  if (observer) observer.disconnect();
  let pending = false;
  const callback = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      retranslate();
    });
  };
  observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });
  let polls = 0;
  pollTimer = setInterval(() => {
    if (document.hidden) return;
    if (polls++ > 60) {
      clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (document.hidden) return;
        retranslate();
      }, 5000);
      return;
    }
    retranslate();
  }, 2000);
}

function stopObserver() {
  if (observer) { observer.disconnect(); observer = null; }
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (retranslateTimer) { clearTimeout(retranslateTimer); retranslateTimer = null; }
  currentRule = null;
}

async function waitForContainers(containerSelector, maxRetries = 30, delay = 200) {
  if (!containerSelector) return [];
  for (let i = 0; i < maxRetries; i++) {
    const els = document.querySelectorAll(containerSelector);
    if (els.length) return els;
    await new Promise(r => setTimeout(r, delay));
  }
  return document.querySelectorAll(containerSelector);
}

async function waitForSelectors(selectors, maxRetries = 30, delay = 200) {
  for (let i = 0; i < maxRetries; i++) {
    for (const sel of selectors) {
      const cleanSel = sel.split(' >>> ')[0].split(' -> ')[0].trim();
      if (document.querySelectorAll(cleanSel).length) return true;
    }
    await new Promise(r => setTimeout(r, delay));
  }
  return false;
}

async function applyPageRule(rule, sl, tl, engine) {
  applySemanticMarkers();
  applyFixedElements(rule.fixedElements);

  if (rule.injectedCss?.length) injectRuleCss(rule.injectedCss);
  if (rule.globalStyles) applyGlobalStyles(rule.globalStyles);

  if (rule.selectors?.length) {
    await waitForSelectors(rule.selectors);
  } else if (rule.containerSelector) {
    await waitForContainers(rule.containerSelector);
  }
  currentRule = rule;
  currentSl = sl;
  currentTl = tl;
  currentEngine = engine;
  const nodes = collectTargetNodes(rule);
  if (nodes.length) {
    await translateNodes(nodes, sl, tl, engine, rule.languageFilter);
  }
  startObserver();
}


// ===== content/universal-rules.js =====
const UNIVERSAL_EXCLUDE_SELECTORS = [
  "[contenteditable=\"true\"]", ".notranslate", "[translate=\"no\"]",
  ".material-icons", "material-icon", "i.fa", "i[class^=fa-]",
  ".google-symbols", "span[class^=material-symbols-]", "time", ".countdown",
  ".visuallyhidden", ".social-share", ".prism-code", ".enlighter-code",
  ".rc-CodeBlock", "[role=code]", "[role=group]", "div[class^=codeBlockContent]",
  "div[class^=codeBlockLines]", "table.highlight", "div[data-paste-markdown-skip]",
  ".reference-citations", "cds-code-snippet", ".interactive-markdown__code",
  "#ace-editor", ".jp-CodeMirrorEditor", "[data-test='json-editor']",
  "table.processedcode", "[value=ka]", "times", "[data-ez-translated]",
  "[data-click-id]", "#immersive-translate-popup", "#immersive-translate-float-ball",
  "#monica-content-root", "script", "style", "noscript",
];
const STAY_ORIGINAL_SELECTORS = [
  "span.katex", ".math-block", ".MathJax_Preview", ".MathJax_Display",
  ".math-container", ".MathJax", ".MathJax_SVG", "math-renderer",
  ".mwe-math-element", "kbd", "pre code", ".code", ".snippet-code",
  ".lang-", ".blob-code", ".CodeMirror", ".react-code-text",
  ".reference", ".citation",
];
const STAY_ORIGINAL_TAGS = new Set([
  "CODE", "TT", "IMG", "SUP", "SUB", "SAMP",
  "MATH", "SEMANTICS", "MROW", "MO", "MFRAC",
  "MSUP", "MI", "MN", "MSQRT", "D-MATH",
  "MTEXT", "MSUB", "MSUBSUP", "MUNDER", "MOVER",
  "MUNDEROVER", "MTABLE", "MTR", "MTD", "MLABELEDTR",
  "MPADDED", "MPHANTOM", "MSPACE",
]);
const SEMANTIC_MARKERS = {
  "header": { "default-translate": "no" },
  "nav": { "side": "1", "default-translate": "no" },
  "footer:last-of-type": { "default-translate": "no" },
};

function applySemanticMarkers() {
  for (const [sel, attrs] of Object.entries(SEMANTIC_MARKERS)) {
    try {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        for (const [key, val] of Object.entries(attrs)) {
          if (!el.hasAttribute(key)) el.setAttribute(key, val);
        }
      }
    } catch { }
  }
}

function buildExcludeSet(excludeSelectors) {
  const excluded = new Set();
  for (const sel of UNIVERSAL_EXCLUDE_SELECTORS) {
    try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
  }
  for (const sel of STAY_ORIGINAL_SELECTORS) {
    try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
  }
  for (const sel of (excludeSelectors || [])) {
    try { for (const el of document.querySelectorAll(sel)) excluded.add(el); } catch { }
  }
  return excluded;
}

function shouldSkipText(text, tl) {
  if (!text) return true;
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length < 2) return true;
  if (/^\d+$/.test(trimmed)) return true;
  if (/^[\s\W]*$/.test(trimmed)) return true;
  const words = trimmed.split(/\s+/).filter(w => /\w/.test(w));
  if (words.length < 1) return true;
  if (tl) {
    const tlLower = tl.toLowerCase();
    if (tlLower.startsWith("zh") && /[\u4e00-\u9fff]/.test(trimmed)) return true;
    if (tlLower === "ja" && /[\u3040-\u309f\u30a0-\u30ff]/.test(trimmed)) return true;
    if (tlLower === "ko" && /[\uac00-\ud7af]/.test(trimmed)) return true;
  }
  return false;
}

function shouldSkipElement(el, excluded) {
  while (el) {
    if (excluded.has(el)) return true;
    el = el.parentElement;
  }
  return false;
}

function shouldSkipByVisibility(el) {
  if (!el) return false;
  try {
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return true;
    if (style.visibility === 'hidden') return true;
    if (parseFloat(style.opacity) === 0) return true;
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return true;
  } catch { }
  return false;
}


// ===== content/index.js =====
const GENERIC_RULE = {
  name: "通用规则",
  selectors: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "article", "main", "section", "blockquote", "li", "td", "th", "figcaption", "details", "summary", "label", "dd", "dt"],
  excludeMatches: [],
  autoTranslate: true,
  translateUI: false,
};

const LS_PREFIX = "ez-translate:";
function lsGet(key) {
  try {
    const val = localStorage.getItem(LS_PREFIX + key);
    if (val !== null) return val;
    const oldVal = localStorage.getItem(key);
    if (oldVal !== null) { localStorage.setItem(LS_PREFIX + key, oldVal); localStorage.removeItem(key); }
    return oldVal;
  } catch { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(LS_PREFIX + key, value); } catch { }
}
function lsRemove(key) {
  try { localStorage.removeItem(LS_PREFIX + key); localStorage.removeItem(key); } catch { }
}

let S = {
  selTL: "en", inputSL: "auto", inputTL: "en", pgTL: "en",
  enSel: true, enInput: true, enPage: true, enFloat: true, autoTranslate: true,
  ignLangs: [], selEngine: "google", inputEngine: "google", pgEngine: "google",
  blacklist: [], rulesUrl: ""
};
let ready = false;
let isBlacklisted = false;
let sessionDisabled = false;
let pgTranslating = false;
let siteRule = null;
let float = null;
let floatPos = null;
let floatDragged = false;
let floatMenu = null;
let currentUrl = location.href;
let urlChangeTimer = null;

function setupSpaUrlDetection() {
  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    const result = origPushState(...args);
    onUrlChange("pushState");
    return result;
  };

  history.replaceState = function (...args) {
    const result = origReplaceState(...args);
    onUrlChange("replaceState");
    return result;
  };

  window.addEventListener("popstate", () => onUrlChange("popstate"));
}

function onUrlChange(source) {
  const newUrl = location.href;
  if (newUrl === currentUrl) return;

  const oldPath = new URL(currentUrl).pathname;
  const newPath = new URL(newUrl).pathname;
  currentUrl = newUrl;

  if (oldPath === newPath) return;

  if (urlChangeTimer) clearTimeout(urlChangeTimer);
  urlChangeTimer = setTimeout(() => handleSpaNavigation(), 300);
}

async function handleSpaNavigation() {
  if (!S.enPage || isBlacklisted) return;

  if (pgTranslating) {
    revertPageTranslation();
  }

  try {
    const resp = await sendMessage({ action: "getSiteRule", url: location.href });
    if (resp?.rule) {
      siteRule = resp.rule;
      if (S.autoTranslate && siteRule.autoTranslate) {
        pgTranslating = true;
        const st = await showTransStatus(`匹配规则: ${siteRule.name}，自动翻译`);
        await applyPageRule(siteRule, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
        clearTransStatus(st);
        if (pgTranslating && float) float.classList.add("tr-translated");
      }
    } else if (S.autoTranslate) {
      siteRule = GENERIC_RULE;
      const st = await showTransStatus("未匹配到规则，使用通用规则", true);
      await applyPageRule(GENERIC_RULE, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
      clearTransStatus(st);
    }
  } catch { }
}

function loadFloatPos() {
  try {
    const raw = lsGet("tr-float-pos");
    if (raw) { floatPos = JSON.parse(raw); floatDragged = true; }
  } catch { }
  if (!floatPos) floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
}

function saveFloatPos() {
  if (!float || !floatPos) return;
  try { lsSet("tr-float-pos", JSON.stringify(floatPos)); } catch { }
}

function applyFloatPos() {
  if (!float || !floatPos) return;
  const fw = 36, fh = 36;
  let l, t;
  if (floatPos.left != null) l = floatPos.left;
  else if (floatPos.right != null) l = innerWidth - floatPos.right - fw;
  if (floatPos.top != null) t = floatPos.top;
  else if (floatPos.bottom != null) t = innerHeight - floatPos.bottom - fh;
  l = Math.max(4, Math.min(l, innerWidth - fw - 4));
  t = Math.max(4, Math.min(t, innerHeight - fh - 4));
  float.style.left = l + "px";
  float.style.top = t + "px";
}

function closeFloatMenu() {
  if (floatMenu) { floatMenu.remove(); floatMenu = null; }
}

function revertPageTranslation() {
  stopObserver();
  document.querySelectorAll("[data-ez-translated='page']").forEach((el) => {
    if (el.hasAttribute('data-ez-original')) {
      const original = el.getAttribute('data-ez-original');
      const textNode = document.createTextNode(original);
      el.parentNode.replaceChild(textNode, el);
    }
  });
  document.querySelectorAll("[data-ez-translated='fixed']").forEach((el) => {
    el.removeAttribute("data-ez-translated");
  });
  pgTranslating = false;
  if (float) float.classList.remove("tr-translated");
}

function showDisableMenu() {
  closeFloatMenu();
  floatMenu = document.createElement("div");
  floatMenu.className = "tr-float-menu";
  const rect = float.getBoundingClientRect();
  const items = [
    { icon: svgIcon("eyeOff"), label: "下次打开", desc: "关闭本次，下次访问时重新显示", action: () => { removeFloat(); closeFloatMenu(); } },
    { icon: svgIcon("clock"), label: "临时禁用", desc: "本次会话中不再显示", action: () => { try { sessionStorage.setItem(LS_PREFIX + "tr-float-disabled", "1"); } catch { } removeFloat(); closeFloatMenu(); showToast("已临时禁用"); } },
    { icon: svgIcon("ban"), label: "永久禁用此网站", desc: "将此网站加入网页翻译黑名单", cls: "danger", action: async () => { const host = location.hostname; try { await sendMessage({ action: "addBlacklist", host }); } catch { } revertPageTranslation(); removeFloat(); closeFloatMenu(); showToast("已加入网页翻译黑名单"); } },
  ];
  items.forEach((it) => {
    const div = document.createElement("div");
    div.className = "tr-float-menu-item" + (it.cls ? " " + it.cls : "");
    div.innerHTML = it.icon + `<div class="tr-menu-text"><span class="tr-menu-label">${it.label}</span><span class="tr-menu-desc">${it.desc}</span></div>`;
    div.addEventListener("click", (ev) => { ev.stopPropagation(); it.action(); });
    floatMenu.appendChild(div);
  });
  const sep = document.createElement("div");
  sep.className = "tr-menu-sep";
  floatMenu.appendChild(sep);
  const settingsItem = document.createElement("div");
  settingsItem.className = "tr-float-menu-item";
  settingsItem.innerHTML = svgIcon("settings") + `<div class="tr-menu-text"><span class="tr-menu-label">设置</span></div>`;
  settingsItem.addEventListener("click", (ev) => { ev.stopPropagation(); sendMessage({ action: "openOptions" }); closeFloatMenu(); });
  floatMenu.appendChild(settingsItem);
  document.body.appendChild(floatMenu);
  const mw = floatMenu.offsetWidth;
  const mh = floatMenu.offsetHeight;
  let left = rect.left + rect.width / 2 - mw / 2;
  let top = rect.top - 8;
  if (left + mw > innerWidth - 8) left = innerWidth - mw - 8;
  if (left < 8) left = 8;
  if (top - mh < 8) top = rect.bottom + 8;
  else top = top - mh;
  floatMenu.style.left = left + "px";
  floatMenu.style.top = top + "px";
  setTimeout(() => {
    const handler = (ev) => {
      if (floatMenu && !floatMenu.contains(ev.target) && !float.contains(ev.target)) {
        closeFloatMenu();
        document.removeEventListener("mousedown", handler, true);
      }
    };
    document.addEventListener("mousedown", handler, true);
  }, 50);
}

function createFloat() {
  if (float || isBlacklisted || sessionDisabled) return;
  loadFloatPos();
  float = document.createElement("div");
  float.className = "tr-float";
  const img = document.createElement("img");
  img.src = getIconUrl();
  img.alt = "";
  float.appendChild(img);
  const check = document.createElement("div");
  check.className = "tr-float-check";
  check.innerHTML = svgIcon("check");
  float.appendChild(check);
  const xBtn = document.createElement("div");
  xBtn.className = "tr-float-x";
  xBtn.innerHTML = svgIcon("close");
  float.appendChild(xBtn);
  float.title = "Translate this page";
  if (pgTranslating) float.classList.add("tr-translated");
  applyFloatPos();
  let dragging = false, dragMoved = false;
  let startMX = 0, startMY = 0, startL = 0, startT = 0;
  float.addEventListener("mousedown", (e) => {
    if (e.target === xBtn || xBtn.contains(e.target)) return;
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    dragMoved = false;
    startMX = e.clientX;
    startMY = e.clientY;
    const rect = float.getBoundingClientRect();
    startL = rect.left;
    startT = rect.top;
    float.classList.add("tr-dragging");
    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  });
  function onDragMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startMX;
    const dy = e.clientY - startMY;
    if (!dragMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragMoved = true;
    if (dragMoved) {
      const fw = 36, fh = 36;
      let l = startL + dx;
      let t = startT + dy;
      l = Math.max(4, Math.min(l, innerWidth - fw - 4));
      t = Math.max(4, Math.min(t, innerHeight - fh - 4));
      float.style.left = l + "px";
      float.style.top = t + "px";
    }
  }
  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    float.classList.remove("tr-dragging");
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
    if (dragMoved) {
      const rect = float.getBoundingClientRect();
      floatPos = { left: rect.left, top: rect.top };
      saveFloatPos();
      closeFloatMenu();
    } else {
      if (pgTranslating) {
        revertPageTranslation();
      } else {
        startPageTranslate();
      }
    }
  }
  xBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (floatMenu) closeFloatMenu();
    else showDisableMenu();
  });
  document.body.appendChild(float);
}

function removeFloat() {
  if (float) { float.remove(); float = null; }
}

async function showTransStatus(msg) {
  const t = document.createElement("div");
  t.className = "tr-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  return t;
}

function clearTransStatus(el) {
  if (el) el.remove();
}

async function startPageTranslate() {
  if (isBlacklisted) { showToast("此网站已在网页翻译黑名单中"); return; }
  if (pgTranslating) { revertPageTranslation(); return; }
  pgTranslating = true;
  let statusEl = null;
  try {
    const rr = await sendMessage({ action: "getSiteRule", url: location.href });
    siteRule = rr?.rule || null;
  } catch { }
  if (!siteRule) {
    siteRule = GENERIC_RULE;
    statusEl = await showTransStatus("未匹配到网站规则，使用通用规则翻译");
  } else {
    statusEl = await showTransStatus(`匹配规则: ${siteRule.name}，开始翻译`);
  }
  await applyPageRule(siteRule, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
  clearTransStatus(statusEl);
  if (pgTranslating) {
    showToast("翻译完成 ✓");
    if (float) float.classList.add("tr-translated");
  }
}

document.addEventListener("mouseup", (e) => {
  if (!ready) return;
  setLastX(e.clientX);
  setLastY(e.clientY);
  setTimeout(() => {
    if (isOwn(e.target)) return;
    const sel = getSelection();
    if (!sel) { clearAll(); return; }
    if (sel.isInput && !S.enInput) return;
    if (!sel.isInput && !S.enSel) return;
    if (isIgnored(sel.text, S.ignLangs)) return;
    showToolbar(getLastX(), getLastY(), sel.text, sel.isInput, S);
  }, 10);
}, true);

document.addEventListener("mousedown", (e) => {
  if (!ready) return;
  const panel = document.querySelector(".tr-panel");
  if (panel && panel.contains(e.target)) {
    if (!e.target.closest(".tr-dd-item")) closeDropdown();
    return;
  }
  const tBar = document.querySelector(".tr-bar");
  if (tBar && tBar.contains(e.target)) return;
  if (isOwn(e.target)) return;
  clearAll();
}, true);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { clearAll(); revertPageTranslation(); }
}, true);

window.addEventListener("resize", () => {
  if (!float) return;
  if (!floatDragged) {
    floatPos = { right: 24, top: Math.round(innerHeight / 2 - 18) };
  }
  applyFloatPos();
});

function refreshSettings() {
  sendMessage({ action: "getSettings" }).then((r) => {
    if (r && r.settings) {
      S = { ...S, ...r.settings };
      isBlacklisted = isHostBlacklisted(location.hostname, S.blacklist || []);
    }
  }).catch(() => {});
}

async function init() {
  try {
    const r = await sendMessage({ action: "getSettings" });
    if (r && r.settings) S = { ...S, ...r.settings };
  } catch { }

  try {
    const r = await sendMessage({ action: "checkBlacklist", url: location.href });
    if (r && r.blacklisted) isBlacklisted = true;
  } catch { }

  try {
    if (sessionStorage.getItem(LS_PREFIX + "tr-float-disabled") === "1") sessionDisabled = true;
  } catch { }

  setupSpaUrlDetection();

  applyTheme();
  watchTheme(() => {
    applyTheme();
    if (float) {
      const img = float.querySelector("img");
      if (img) img.src = getIconUrl();
    }
  });

  if (S.enPage && !isBlacklisted && S.enFloat) {
    createFloat();
  }

  if (S.enPage && !isBlacklisted) {
    try {
      const resp = await sendMessage({ action: "getSiteRule", url: location.href });
      if (resp?.rule) {
        siteRule = resp.rule;
        if (S.autoTranslate && siteRule.autoTranslate) {
          pgTranslating = true;
          const st = await showTransStatus(`匹配规则: ${siteRule.name}，自动翻译`);
          await applyPageRule(siteRule, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
          clearTransStatus(st);
          if (pgTranslating && float) float.classList.add("tr-translated");
        }
      } else if (S.autoTranslate) {
        siteRule = GENERIC_RULE;
        const st = await showTransStatus("未匹配到规则，使用通用规则");
        await applyPageRule(GENERIC_RULE, "auto", S.pgTL || S.selTL, S.pgEngine || "google");
        clearTransStatus(st);
      }
    } catch { }
  }

  ready = true;
}


// ===== options/i18n.js =====
const OPTIONS_LANGS = (function() {
  const names = {
    "zh-CN": "中文(简体)", "zh-TW": "中文(繁体)",
    en: "English", ja: "日本語", ko: "한국어", fr: "Français",
    de: "Deutsch", es: "Español", pt: "Português", ru: "Русский",
    ar: "العربية", th: "ไทย", vi: "Tiếng Việt", id: "Indonesia",
    it: "Italiano", nl: "Nederlands", pl: "Polski", tr: "Türkçe", hi: "हिन्दी",
  };
  return LANG_CODES.map((code) => ({ code, name: names[code] || code }));
})();

const I18N = {
  en: {
    langSettings: "Language Settings",
    selTargetLang: "Selection Target Language",
    selTargetLangDesc: "Target language for selected text translation",
    inputTargetLang: "Input Translation Target",
    inputTargetLangDesc: "Target language for input box translation",
    pageTargetLang: "Page Translation Target",
    pageTargetLangDesc: "Target language for full page translation",
    featureSettings: "Feature Settings",
    enableSelTrans: "Enable Selection Translation",
    enableSelTransDesc: "Show translate button on text selection",
    enableInputTrans: "Enable Input Translation",
    enableInputTransDesc: "Show translate button in input boxes",
    ignoreLangs: "Exclude Languages",
    ignoreLangsDesc: "Skip translation for these languages",
    enablePageTrans: "Enable Page Translation",
    enablePageTransDesc: "Auto-translate pages matching rules",
    enableFloatBtn: "Enable Float Button",
    enableFloatBtnDesc: "Show floating button on supported pages",
    autoTranslate: "Auto Translate",
    autoTranslateDesc: "Automatically translate when visiting supported sites",
    blacklistTitle: "Page Translation Blacklist",
    blacklistDesc: "Sites in this list will not be auto-translated.",
    blacklistPlaceholder: "e.g. example.com or *.example.com",
    addBtn: "Add",
    emptyBlacklist: "No sites in blacklist",
    tabGeneral: "General",
    tabPage: "Page Translation",
    tabSelection: "Selection",
    tabInput: "Input",
    engineLabel: "Translation Engine",
    engineDesc: "Select translation service provider",
    testBtn: "Test",
    testSuccess: "✓",
    testFail: "✗",
    rulesTitle: "Site Rules",
    rulesUrlLabel: "Remote Rules URL",
    rulesUrlDesc: "Load rules from a remote JSON file. Leave empty for built-in.",
    refreshRulesBtn: "Refresh Rules",
    refreshRulesSuccess: "Rules updated ✓",
    refreshRulesFail: "Failed to fetch rules",
    optionsTitle: "EZ-Translate Settings",
    closeBtn: "Close",
  },
  "zh-CN": {
    langSettings: "语言设置",
    selTargetLang: "划词翻译目标语言",
    selTargetLangDesc: "选中文本翻译的目标语言",
    inputTargetLang: "输入框翻译目标语言",
    inputTargetLangDesc: "输入框中翻译的目标语言",
    pageTargetLang: "网页翻译目标语言",
    pageTargetLangDesc: "整页翻译的目标语言",
    featureSettings: "功能设置",
    enableSelTrans: "启用划词翻译",
    enableSelTransDesc: "选中文本时显示翻译按钮",
    enableInputTrans: "启用输入框翻译",
    enableInputTransDesc: "在输入框中显示翻译按钮",
    ignoreLangs: "排除语言",
    ignoreLangsDesc: "不翻译这些语言的文本",
    enablePageTrans: "启用网页翻译",
    enablePageTransDesc: "自动翻译匹配规则的网页",
    enableFloatBtn: "启用悬浮按钮",
    enableFloatBtnDesc: "在支持的页面上显示悬浮按钮",
    autoTranslate: "自动翻译",
    autoTranslateDesc: "访问支持的网站时自动翻译",
    blacklistTitle: "网页翻译黑名单",
    blacklistDesc: "黑名单中的网站不会自动翻译整页",
    blacklistPlaceholder: "例如 example.com 或 *.example.com",
    addBtn: "添加",
    emptyBlacklist: "暂无黑名单网站",
    tabGeneral: "通用",
    tabPage: "网页翻译",
    tabSelection: "划词翻译",
    tabInput: "输入框",
    engineLabel: "翻译引擎",
    engineDesc: "选择翻译服务提供商",
    testBtn: "测试",
    testSuccess: "✓",
    testFail: "✗",
    rulesTitle: "网站规则",
    rulesUrlLabel: "远程规则 URL",
    rulesUrlDesc: "从远程 JSON 文件加载规则。留空则使用内置规则。",
    refreshRulesBtn: "刷新规则",
    refreshRulesSuccess: "规则已更新 ✓",
    refreshRulesFail: "获取规则失败",
    optionsTitle: "EZ-Translate 设置",
    closeBtn: "关闭",
  },
};

function getUILang() {
  const nav = navigator.language || "en";
  const lower = nav.toLowerCase();
  if (I18N[lower]) return lower;
  const prefix = lower.split("-")[0];
  if (I18N[prefix]) return prefix;
  for (const key of Object.keys(I18N)) {
    if (key.toLowerCase().startsWith(prefix)) return key;
  }
  return "en";
}

function t(key) {
  const lang = getUILang();
  const strings = I18N[lang] || I18N.en;
  return strings[key] || key;
}


// ===== options/settings-ui.js =====
function populateSelect(sel, options, selected) {
  const doc = sel.ownerDocument || document;
  sel.innerHTML = "";
  options.forEach((l) => {
    const opt = doc.createElement("option");
    opt.value = l.code;
    opt.textContent = l.name;
    if (l.code === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

function setEngineSelect(sel, selected) {
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === selected) {
      sel.selectedIndex = i;
      break;
    }
  }
}

function renderBlacklist(container, blacklist, onRemove) {
  const doc = container.ownerDocument || document;
  container.innerHTML = "";
  if (!blacklist || !blacklist.length) {
    const empty = doc.createElement("div");
    empty.style.cssText = "color:#9ca3af;font-size:12px;padding:8px 0;";
    empty.textContent = t("emptyBlacklist");
    container.appendChild(empty);
    return;
  }
  const wrap = doc.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  blacklist.forEach((host) => {
    const chip = doc.createElement("div");
    chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid #fecaca;border-radius:14px;font-size:11px;color:#dc2626;background:#fef2f2;";
    chip.innerHTML = `<span>${escHtml(host)}</span><button data-remove style="border:none;background:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0 2px;">&times;</button>`;
    chip.querySelector("[data-remove]").addEventListener("click", () => onRemove(host));
    wrap.appendChild(chip);
  });
  container.appendChild(wrap);
}

const IGN_LANG_OPTIONS = [
  { code: "zh-CN", label: "中文" }, { code: "en", label: "English" },
  { code: "ja", label: "日本語" }, { code: "ko", label: "한국어" },
  { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" }, { code: "ru", label: "Русский" },
];

function renderIgnLangs(container, ignLangs, onChange) {
  const doc = container.ownerDocument || document;
  container.innerHTML = "";
  const wrap = doc.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
  IGN_LANG_OPTIONS.forEach((l) => {
    const label = doc.createElement("label");
    label.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid #e2e8f0;border-radius:14px;font-size:11px;cursor:pointer;user-select:none;";
    const cb = doc.createElement("input");
    cb.type = "checkbox";
    cb.value = l.code;
    cb.checked = ignLangs.includes(l.code);
    cb.style.cssText = "margin:0;width:12px;height:12px;accent-color:#6366f1;cursor:pointer;";
    cb.addEventListener("change", () => {
      const checked = [...wrap.querySelectorAll("input:checked")].map((i) => i.value);
      onChange(checked);
    });
    label.appendChild(cb);
    label.appendChild(doc.createTextNode(l.label));
    wrap.appendChild(label);
  });
  container.appendChild(wrap);
}

async function initSettingsPanel(panel) {
  let settings = {};
  try {
    const r = await sendMessage({ action: "getSettings" });
    if (r && r.settings) settings = r.settings;
  } catch {}

  panel.innerHTML = `
    <style>
      #ez-options-overlay { position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px; }
      #ez-options-panel { background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:520px;max-width:90vw;max-height:85vh;overflow:hidden;display:flex;flex-direction:column; }
      .ez-dark #ez-options-panel { background:#1e1e2e;color:#cdd6f4; }
      .ez-opt-header { display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e5e7eb;font-weight:600;font-size:15px; }
      .ez-dark .ez-opt-header { border-color:#313244; }
      .ez-opt-close { border:none;background:none;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px;color:#6b7280; }
      .ez-opt-close:hover { background:#f3f4f6; }
      .ez-dark .ez-opt-close { color:#a6adc8; }
      .ez-dark .ez-opt-close:hover { background:#313244; }
      .ez-opt-body { padding:16px 20px;overflow-y:auto;flex:1; }
      .ez-opt-section { margin-bottom:16px; }
      .ez-opt-section-title { font-weight:600;font-size:13px;margin-bottom:8px;color:#374151; }
      .ez-dark .ez-opt-section-title { color:#cdd6f4; }
      .ez-opt-row { display:flex;align-items:center;justify-content:space-between;padding:6px 0; }
      .ez-opt-label { color:#4b5563;font-size:12px; }
      .ez-dark .ez-opt-label { color:#a6adc8; }
      .ez-opt-desc { color:#9ca3af;font-size:11px;margin-top:1px; }
      .ez-opt-select { padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;background:#fff;color:#111827; }
      .ez-dark .ez-opt-select { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-opt-input { padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;width:220px;background:#fff;color:#111827; }
      .ez-dark .ez-opt-input { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-opt-btn { padding:4px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;cursor:pointer;background:#fff;color:#374151; }
      .ez-opt-btn:hover { background:#f3f4f6; }
      .ez-dark .ez-opt-btn { background:#313244;border-color:#45475a;color:#cdd6f4; }
      .ez-dark .ez-opt-btn:hover { background:#45475a; }
      .ez-toggle { position:relative;width:36px;height:20px;cursor:pointer; }
      .ez-toggle input { position:absolute;opacity:0;width:0;height:0; }
      .ez-toggle-slider { position:absolute;inset:0;background:#d1d5db;border-radius:10px;transition:.2s; }
      .ez-toggle-slider::before { content:'';position:absolute;width:16px;height:16px;left:2px;bottom:2px;background:#fff;border-radius:50%;transition:.2s; }
      .ez-toggle input:checked + .ez-toggle-slider { background:#6366f1; }
      .ez-toggle input:checked + .ez-toggle-slider::before { transform:translateX(16px); }
      .ez-dark .ez-toggle-slider { background:#45475a; }
      .ez-opt-hr { border:none;border-top:1px solid #e5e7eb;margin:8px 0; }
      .ez-dark .ez-opt-hr { border-color:#313244; }
    </style>
    <div class="ez-opt-header">
      <span>${t("optionsTitle")}</span>
      <button class="ez-opt-close" data-close>&times;</button>
    </div>
    <div class="ez-opt-body">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("langSettings")}</div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("selTargetLang")}</div><div class="ez-opt-desc">${t("selTargetLangDesc")}</div></div>
          <select id="ez-selTL" class="ez-opt-select"></select>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("inputTargetLang")}</div><div class="ez-opt-desc">${t("inputTargetLangDesc")}</div></div>
          <select id="ez-inputTL" class="ez-opt-select"></select>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("pageTargetLang")}</div><div class="ez-opt-desc">${t("pageTargetLangDesc")}</div></div>
          <select id="ez-pgTL" class="ez-opt-select"></select>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("featureSettings")}</div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableSelTrans")}</div><div class="ez-opt-desc">${t("enableSelTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enSel"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableInputTrans")}</div><div class="ez-opt-desc">${t("enableInputTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enInput"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enablePageTrans")}</div><div class="ez-opt-desc">${t("enablePageTransDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enPage"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("enableFloatBtn")}</div><div class="ez-opt-desc">${t("enableFloatBtnDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-enFloat"><span class="ez-toggle-slider"></span></label>
        </div>
        <div class="ez-opt-row">
          <div><div class="ez-opt-label">${t("autoTranslate")}</div><div class="ez-opt-desc">${t("autoTranslateDesc")}</div></div>
          <label class="ez-toggle"><input type="checkbox" id="ez-autoTranslate"><span class="ez-toggle-slider"></span></label>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("engineLabel")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("engineDesc")}</div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabSelection")}</span>
          <select id="ez-selEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testSelEngine">${t("testBtn")}</button>
        </div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabInput")}</span>
          <select id="ez-inputEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testInputEngine">${t("testBtn")}</button>
        </div>
        <div class="ez-opt-row">
          <span class="ez-opt-label">${t("tabPage")}</span>
          <select id="ez-pgEngine" class="ez-opt-select"></select>
          <button class="ez-opt-btn" id="ez-testPgEngine">${t("testBtn")}</button>
        </div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("ignoreLangs")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("ignoreLangsDesc")}</div>
        <div id="ez-ignLangsContainer"></div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("blacklistTitle")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("blacklistDesc")}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input id="ez-blacklistInput" class="ez-opt-input" placeholder="${t("blacklistPlaceholder")}">
          <button id="ez-addBlacklistBtn" class="ez-opt-btn">${t("addBtn")}</button>
        </div>
        <div id="ez-blacklistContainer"></div>
      </div>
      <hr class="ez-opt-hr">
      <div class="ez-opt-section">
        <div class="ez-opt-section-title">${t("rulesTitle")}</div>
        <div class="ez-opt-desc" style="margin-top:0;margin-bottom:8px;">${t("rulesUrlDesc")}</div>
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <input id="ez-rulesUrl" class="ez-opt-input" placeholder="GitHub raw URL" style="flex:1;">
          <button id="ez-refreshRulesBtn" class="ez-opt-btn">${t("refreshRulesBtn")}</button>
        </div>
        <div id="ez-rulesList"></div>
      </div>
    </div>
  `;

  const isDark = document.documentElement.getAttribute("data-tr-theme") === "dark";
  if (isDark) panel.classList.add("ez-dark");

  populateSelect(panel.querySelector("#ez-selTL"), OPTIONS_LANGS, settings.selTL || "en");
  populateSelect(panel.querySelector("#ez-inputTL"), OPTIONS_LANGS, settings.inputTL || "en");
  populateSelect(panel.querySelector("#ez-pgTL"), OPTIONS_LANGS, settings.pgTL || "en");

  const engineOpts = [{ code: "google", name: "Google" }, { code: "bing", name: "Bing" }];
  for (const id of ["ez-selEngine", "ez-inputEngine", "ez-pgEngine"]) {
    const sel = panel.querySelector("#" + id);
    populateSelect(sel, engineOpts, settings[id.replace("ez-", "").replace("Engine", "") + "Engine"] || "google");
  }

  panel.querySelector("#ez-enSel").checked = settings.enSel !== false;
  panel.querySelector("#ez-enInput").checked = settings.enInput !== false;
  panel.querySelector("#ez-enPage").checked = settings.enPage !== false;
  panel.querySelector("#ez-enFloat").checked = settings.enFloat !== false;
  panel.querySelector("#ez-autoTranslate").checked = settings.autoTranslate === true;

  renderIgnLangs(panel.querySelector("#ez-ignLangsContainer"), settings.ignLangs || [], (newIgn) => {
    settings.ignLangs = newIgn;
    saveSettings(settings);
  });

  const onBLRemove = (host) => {
    settings.blacklist = (settings.blacklist || []).filter((h) => h !== host);
    saveSettings(settings);
    renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist, onBLRemove);
  };
  renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist || [], onBLRemove);

  panel.querySelector("#ez-addBlacklistBtn").addEventListener("click", () => {
    const input = panel.querySelector("#ez-blacklistInput");
    const host = input.value.trim();
    if (!host) return;
    if (!settings.blacklist) settings.blacklist = [];
    if (!settings.blacklist.includes(host)) {
      settings.blacklist.push(host);
      saveSettings(settings);
      renderBlacklist(panel.querySelector("#ez-blacklistContainer"), settings.blacklist, onBLRemove);
    }
    input.value = "";
  });

  panel.querySelector("#ez-refreshRulesBtn").addEventListener("click", async () => {
    const btn = panel.querySelector("#ez-refreshRulesBtn");
    btn.disabled = true;
    btn.textContent = "...";
    try {
      const r = await sendMessage({ action: "refreshRules" });
      btn.textContent = "OK ✓";
      if (r && r.rules) {
        const list = panel.querySelector("#ez-rulesList");
        list.innerHTML = `<span style="color:#059669;font-size:12px;">${r.rules.length} rules loaded</span>`;
      }
    } catch {
      btn.textContent = "Fail ✗";
    }
    btn.disabled = false;
    setTimeout(() => { btn.textContent = t("refreshRulesBtn"); }, 3000);
  });

  function onSave() {
    const ns = {
      selTL: panel.querySelector("#ez-selTL").value,
      inputTL: panel.querySelector("#ez-inputTL").value,
      pgTL: panel.querySelector("#ez-pgTL").value,
      selEngine: panel.querySelector("#ez-selEngine").value,
      inputEngine: panel.querySelector("#ez-inputEngine").value,
      pgEngine: panel.querySelector("#ez-pgEngine").value,
      enSel: panel.querySelector("#ez-enSel").checked,
      enInput: panel.querySelector("#ez-enInput").checked,
      enPage: panel.querySelector("#ez-enPage").checked,
      enFloat: panel.querySelector("#ez-enFloat").checked,
      autoTranslate: panel.querySelector("#ez-autoTranslate").checked,
      ignLangs: settings.ignLangs || [],
      blacklist: settings.blacklist || [],
      rulesUrl: panel.querySelector("#ez-rulesUrl").value || "",
    };
    saveSettings(ns);
    settings = ns;
  }

  for (const id of ["ez-selTL", "ez-inputTL", "ez-pgTL", "ez-selEngine", "ez-inputEngine", "ez-pgEngine"]) {
    panel.querySelector("#" + id).addEventListener("change", onSave);
  }
  for (const id of ["ez-enSel", "ez-enInput", "ez-enPage", "ez-enFloat", "ez-autoTranslate"]) {
    panel.querySelector("#" + id).addEventListener("change", onSave);
  }
  panel.querySelector("#ez-rulesUrl").addEventListener("change", onSave);

  for (const id of ["ez-testSelEngine", "ez-testInputEngine", "ez-testPgEngine"]) {
    panel.querySelector("#" + id).addEventListener("click", async () => {
      const btn = panel.querySelector("#" + id);
      const engId = id.replace("test", "").replace("Engine", "").toLowerCase();
      const engineSel = panel.querySelector("#ez-" + engId + "Engine");
      if (!engineSel) return;
      btn.disabled = true;
      btn.textContent = "...";
      try {
        const r = await sendMessage({ action: "testEngine", engine: engineSel.value });
        btn.textContent = r?.success ? t("testSuccess") : t("testFail");
        btn.style.color = r?.success ? "#059669" : "#dc2626";
      } catch {
        btn.textContent = t("testFail");
        btn.style.color = "#dc2626";
      }
      btn.disabled = false;
      setTimeout(() => { btn.textContent = t("testBtn"); btn.style.color = ""; }, 3000);
    });
  }

  panel.querySelector("[data-close]").addEventListener("click", () => {
    closeOptionsPanel();
  });
}


// ===== options/index.js =====
let settingsWindow = null;

async function showOptionsPanel() {
  if (settingsWindow && !settingsWindow.closed) {
    settingsWindow.focus();
    return;
  }
  const w = window.open('about:blank', 'ez-settings', 'width=640,height=720,resizable=yes,scrollbars=yes');
  if (!w) {
    console.warn('EZ-Translate: 请允许弹出窗口以打开设置');
    return;
  }
  const d = w.document;
  d.write('<!DOCTYPE html><html><head><title>EZ-Translate ' + t('optionsTitle') + '</title><meta charset="utf-8">');
  d.write('<style>body{margin:0;padding:16px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;color:#111827;}.ez-dark body{background:#1e1e2e;color:#cdd6f4;}</style>');
  d.write('</head><body></body></html>');
  d.close();
  settingsWindow = w;
  const panel = d.createElement('div');
  d.body.appendChild(panel);
  try {
    await initSettingsPanel(panel);
  } catch (e) {
    console.error('EZ-Translate settings error:', e);
    w.close();
    settingsWindow = null;
  }
}

function closeOptionsPanel() {
  if (settingsWindow && !settingsWindow.closed) {
    settingsWindow.close();
    settingsWindow = null;
  }
}


// ===== CSS Injection (content.css) =====
(function() { const s = document.createElement('style'); s.textContent = `.tr-float,.tr-float-x,.tr-bar,.tr-panel,.tr-float-menu,.tr-toast,.tr-bilingual,.tr-br,.tr-dd,.tr-dd-btn,.tr-dd-list,.tr-dd-item,.tr-btn,.tr-phead,.tr-pbody,.tr-original,.tr-result,.tr-loading,.tr-spinner,.tr-actions,.tr-copy-btn,.tr-replace-btn,.tr-pclose,.tr-plang,.tr-arrow,.tr-float-menu-item,.tr-menu-text,.tr-menu-label,.tr-menu-desc,.tr-menu-sep{box-sizing:border-box}.tr-float{position:fixed;z-index:2147483640;width:36px;height:36px;border-radius:50%;background:transparent;border:none;box-shadow:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;user-select:none;overflow:visible;touch-action:none}.tr-float:hover{transform:scale(1.1)}.tr-float.tr-dragging{transition:none;transform:scale(1.15)}.tr-float img{width:32px;height:32px;border-radius:50%;object-fit:cover;pointer-events:none}.tr-float-check{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#4CAF50;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.3);transition:opacity .2s,transform .2s;pointer-events:none}.tr-float-check svg{width:10px;height:10px;color:#fff}.tr-float.tr-translated .tr-float-check{opacity:1;transform:scale(1)}.tr-float-x{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.5);transition:opacity .15s,transform .15s;cursor:pointer;z-index:1}.tr-float-x svg{width:10px;height:10px;color:#9ca3af;pointer-events:none}.tr-float:hover .tr-float-x{opacity:1;transform:scale(1)}.tr-float-x:hover{background:#fee2e2}.tr-float-x:hover svg{color:#ef4444}.tr-float-menu{position:fixed;z-index:2147483641;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);padding:6px 0;min-width:200px;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .12s ease}.tr-float-menu-item{display:flex;align-items:flex-start;gap:10px;padding:9px 14px;cursor:pointer;color:#374151;transition:background .1s}.tr-float-menu-item:hover{background:#f3f4f6}.tr-float-menu-item.danger{color:#ef4444}.tr-float-menu-item.danger .tr-menu-desc{color:#fca5a5}.tr-float-menu-item svg{width:16px;height:16px;flex-shrink:0;margin-top:2px}.tr-menu-text{display:flex;flex-direction:column;gap:1px}.tr-menu-label{font-size:13px;font-weight:500;line-height:1.3}.tr-menu-desc{font-size:11px;color:#9ca3af;line-height:1.3}.tr-menu-sep{height:1px;background:#e5e7eb;margin:4px 14px}.tr-bar{position:fixed;z-index:2147483645;display:flex;align-items:center;padding:0;background:transparent;border:none;box-shadow:none;font:12px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;user-select:none;animation:trFadeIn .12s ease;gap:2px}@keyframes trFadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}.tr-btn{display:inline-flex;align-items:center;justify-content:center;height:28px;padding:0 10px;border:none;border-radius:7px;background:transparent;color:#374151;cursor:pointer;font:12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;transition:all .15s;gap:4px;white-space:nowrap}.tr-btn:hover{background:#f3f4f6}.tr-btn.tr-primary{background:#4f46e5;color:#fff}.tr-btn.tr-primary:hover{background:#4338ca}.tr-btn-icon{width:28px!important;height:28px!important;padding:0!important}.tr-btn svg{width:14px;height:14px;flex-shrink:0}.tr-panel{position:fixed;z-index:2147483644;min-width:280px;max-width:480px;max-height:min(420px,calc(100vh - 24px));background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.08);font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:trFadeIn .15s ease;overflow:visible;display:flex;flex-direction:column}.tr-phead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 0}.tr-plang{display:flex;align-items:center;gap:4px;position:relative}.tr-arrow{color:#9ca3af;font-size:13px;flex-shrink:0}.tr-pclose{width:22px;height:22px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center}.tr-pclose:hover{background:#f3f4f6;color:#374151}.tr-pbody{padding:8px 14px 12px;overflow-y:auto;flex:1;min-height:0}.tr-original{font-size:11px;color:#9ca3af;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #f3f4f6;word-break:break-word;max-height:70px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-original-text{flex:1;min-width:0}.tr-result{color:#1f2937;word-break:break-word;font-size:13px;line-height:1.6;max-height:240px;overflow-y:auto;display:flex;align-items:flex-start;gap:6px}.tr-result-text{flex:1;min-width:0}.tr-speak-btn{flex-shrink:0;width:24px;height:24px;border:none;border-radius:4px;background:transparent;color:#9ca3af;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s}.tr-speak-btn:hover{color:#4f46e5;background:#eef2ff}.tr-speak-btn.speaking{color:#4f46e5;animation:trPulse 1s ease infinite}.tr-loading{display:flex;align-items:center;gap:8px;color:#9ca3af;padding:8px 0}.tr-spinner{width:14px;height:14px;border:2px solid #e5e7eb;border-top-color:#4f46e5;border-radius:50%;animation:trSpin .6s linear infinite}@keyframes trSpin{to{transform:rotate(360deg)}}.tr-translating{opacity:.5;border-bottom:2px dotted #6366f1;animation:trLoadingPulse 1.2s ease-in-out infinite;cursor:wait}@keyframes trLoadingPulse{0%,100%{opacity:.5}50%{opacity:.3}}@keyframes trPulse{0%,100%{opacity:1}50%{opacity:.5}}.tr-actions{display:flex;gap:6px;margin-top:8px}.tr-copy-btn,.tr-replace-btn{padding:5px 10px;border:1px solid #e5e7eb;border-radius:5px;background:#f9fafb;color:#6b7280;cursor:pointer;font-size:11px;font-weight:500;transition:all .15s;display:inline-flex;align-items:center;gap:3px}.tr-copy-btn:hover,.tr-replace-btn:hover{background:#f3f4f6;color:#374151}.tr-copy-btn.copied{background:#ecfdf5;color:#059669;border-color:#a7f3d0}.tr-replace-btn{background:#eef2ff;color:#4f46e5;border-color:#c7d2fe}.tr-replace-btn:hover{background:#e0e7ff}.tr-toast{position:fixed;z-index:2147483647;bottom:80px;left:50%;transform:translateX(-50%);padding:8px 20px;background:#059669;color:#fff;border-radius:8px;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:500;pointer-events:none;animation:trToast .3s ease}@keyframes trToast{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.tr-bilingual{color:inherit;word-break:break-word}.tr-br{display:block;margin-top:2px}.tr-dd{position:relative;display:inline-block}.tr-dd-btn{height:26px;line-height:26px;padding:0 20px 0 6px;border:1px solid #e5e7eb;border-radius:5px;font-size:11px;color:#374151;background:#fff;cursor:pointer;outline:none;min-width:85px;text-align:left;appearance:none;-webkit-appearance:none;position:relative;vertical-align:middle}.tr-dd-btn:hover{border-color:#d1d5db}.tr-dd-btn::after{content:"▾";position:absolute;right:5px;top:50%;transform:translateY(-50%);font-size:10px;color:#9ca3af;pointer-events:none}.tr-dd-btn[disabled]{opacity:.5;cursor:default;background:#f9fafb}.tr-dd-list{position:absolute;top:100%;left:0;z-index:10;min-width:100%;max-height:min(280px,calc(100vh - 80px));overflow-y:auto;background:#fff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);margin-top:2px;padding:2px 0;display:none}.tr-dd-list.tr-dd-open{display:block}.tr-dd-item{padding:4px 8px;font-size:11px;color:#374151;cursor:pointer;white-space:nowrap;line-height:1.4}.tr-dd-item:hover{background:#f3f4f6}.tr-dd-item.tr-dd-active{color:#4f46e5;font-weight:600}.tr-engine-sep{width:1px;height:16px;background:#e5e7eb;margin:0 2px;flex-shrink:0}.tr-engine-btn{min-width:60px;font-size:10px;height:22px;line-height:22px;padding:0 16px 0 4px;border-radius:4px}[data-tr-theme="dark"] .tr-float{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-float-x{background:#2d2d2d;box-shadow:0 1px 4px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-x:hover{background:#7f1d1d}[data-tr-theme="dark"] .tr-float-x svg{color:#6b7280}[data-tr-theme="dark"] .tr-float-x:hover svg{color:#fca5a5}[data-tr-theme="dark"] .tr-float-menu{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.4)}[data-tr-theme="dark"] .tr-float-menu-item{color:#d1d5db}[data-tr-theme="dark"] .tr-float-menu-item:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-float-menu-item.danger{color:#f87171}[data-tr-theme="dark"] .tr-float-menu-item.danger .tr-menu-desc{color:#7f1d1d}[data-tr-theme="dark"] .tr-menu-desc{color:#6b7280}[data-tr-theme="dark"] .tr-menu-sep{background:#333}[data-tr-theme="dark"] .tr-bar{background:transparent;border:none;box-shadow:none}[data-tr-theme="dark"] .tr-btn{color:#d1d5db}[data-tr-theme="dark"] .tr-btn:hover{background:#2d2d2d}[data-tr-theme="dark"] .tr-btn.tr-primary{background:#4f46e5;color:#fff}[data-tr-theme="dark"] .tr-btn.tr-primary:hover{background:#6366f1}[data-tr-theme="dark"] .tr-panel{background:#1e1e1e;border-color:#333;box-shadow:0 8px 32px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.3)}[data-tr-theme="dark"] .tr-pclose{color:#6b7280}[data-tr-theme="dark"] .tr-pclose:hover{background:#2d2d2d;color:#d1d5db}[data-tr-theme="dark"] .tr-arrow{color:#6b7280}[data-tr-theme="dark"] .tr-original{color:#6b7280;border-bottom-color:#333}[data-tr-theme="dark"] .tr-result{color:#e5e7eb}[data-tr-theme="dark"] .tr-loading{color:#6b7280}[data-tr-theme="dark"] .tr-spinner{border-color:#333;border-top-color:#6366f1}[data-tr-theme="dark"] .tr-copy-btn,[data-tr-theme="dark"] .tr-replace-btn{background:#2d2d2d;border-color:#333;color:#9ca3af}[data-tr-theme="dark"] .tr-copy-btn:hover,[data-tr-theme="dark"] .tr-replace-btn:hover{background:#374151;color:#e5e7eb}[data-tr-theme="dark"] .tr-copy-btn.copied{background:#052e16;color:#34d399;border-color:#064e3b}[data-tr-theme="dark"] .tr-replace-btn{background:#312e81;color:#c7d2fe;border-color:#4338ca}[data-tr-theme="dark"] .tr-replace-btn:hover{background:#3730a3}[data-tr-theme="dark"] .tr-toast{background:#059669;color:#fff}[data-tr-theme="dark"] .tr-speak-btn{color:#6b7280}[data-tr-theme="dark"] .tr-speak-btn:hover{color:#818cf8;background:#2d2d2d}[data-tr-theme="dark"] .tr-speak-btn.speaking{color:#818cf8}[data-tr-theme="dark"] .tr-dd-btn{background:#2d2d2d;border-color:#333;color:#d1d5db}[data-tr-theme="dark"] .tr-dd-btn:hover{border-color:#4b5563}[data-tr-theme="dark"] .tr-dd-btn[disabled]{background:#1e1e1e;color:#6b7280}[data-tr-theme="dark"] .tr-dd-list{background:#2d2d2d;border-color:#333;box-shadow:0 4px 16px rgba(0,0,0,.5)}[data-tr-theme="dark"] .tr-dd-item{color:#d1d5db}[data-tr-theme="dark"] .tr-dd-item:hover{background:#374151}[data-tr-theme="dark"] .tr-dd-item.tr-dd-active{color:#818cf8}[data-tr-theme="dark"] .tr-engine-sep{background:#333}[data-tr-theme="dark"] .tr-float-menu-item.danger .tr-menu-desc{color:#7f1d1d}
`; document.head.appendChild(s); })();

// ===== Assets (inline) =====
const ASSETS = {
  light: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgMTAuMC1jMDAwIDI1LkcuZDIwZTQ2NiwgMjAyNS8xMi8wOC0yMDo1MDoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI3LjQgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wNS0xNFQxNjozOTowOSswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDUtMTRUMjA6MTU6NTcrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDUtMTRUMjA6MTU6NTcrMDg6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjYwOGViY2Q5LWRkZTUtZjg0Mi04YWFjLTM3ODhjNGU4MmE1OCIgeG1wTU06RG9jdW1lbnRJ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',
  dark: 'data:image/png;base64,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',
};

// ===== Init =====
initBackground();

// Register menu command for settings
if (typeof GM_registerMenuCommand !== 'undefined') {
  GM_registerMenuCommand('⚙ EZ-Translate 设置', () => {
    showOptionsPanel();
  });
  GM_registerMenuCommand('🌐 翻译页面', () => {
    startPageTranslate();
  });
}

// Wait for DOM then init content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch(console.error);
  });
} else {
  init().catch(console.error);
}

})();
