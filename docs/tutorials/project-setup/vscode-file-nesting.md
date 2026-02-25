---
description: 讓專案目錄超整潔：學習與配置 VS Code 檔案嵌套 (File Nesting)
---

# 讓專案目錄超整潔：VS Code 檔案嵌套技巧 (File Nesting) 📂

在現代的前端專案中，根目錄往往充滿了各種設定檔：`.eslintrc`, `.prettierrc`, `tsconfig.json`, `vite.config.ts`... 這些檔案雖然重要，但在日常開發中我們並不常去修改它們。如果它們一直佔據著檔案總管的空間，會讓視覺變得雜亂，影響我們尋找主要程式碼的效率。

今天就要介紹 VS Code 內建的一個超實用功能：**File Nesting (檔案嵌套)**！它可以把相關聯的檔案「摺疊」在主檔案之下，讓你的專案目錄瞬間變得清爽無比！✨

## 什麼是 File Nesting？ 🤔

就像是將檔案分組一樣，File Nesting 允許你定義規則，讓某些檔案成為「父檔案」，而其他相關的檔案則成為它的「子檔案」。

例如，你可以設定讓所有以 `.config.js` 結尾的檔案都摺疊在 `package.json` 底下，或者讓 `tsconfig.node.json` 摺疊在 `tsconfig.json` 底下。

## 1. 如何啟用？ (設定 settings.json) ⚙️

要在專案中啟用這個功能，我們需要編輯 `.vscode/settings.json` 檔案。

請加入以下設定：

```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "tsconfig.json": "tsconfig.*.json, env.d.ts",
    "vite.config.*": "jsconfig*, vitest.config.*, cypress.config.*, playwright.config.*",
    "package.json": "package-lock.json, pnpm*, .yarnrc*, yarn*, .eslint*, eslint*, .oxlint*, oxlint*, .oxfmt*, .prettier*, prettier*, .editorconfig"
  }
}
```

### 設定解析 🧐

讓我們來看看這段設定做了什麼：

- `"explorer.fileNesting.enabled": true`: 這是總開關，設為 `true` 才會生效。
- `"explorer.fileNesting.patterns"`: 這裡定義了嵌套的規則。格式是 `"父檔案樣式": "子檔案樣式"`。

**範例詳解**：

1.  **TypeScript 家族**：

    ```json
    "tsconfig.json": "tsconfig.*.json, env.d.ts"
    ```

    這表示 `tsconfig.app.json`, `tsconfig.node.json` 以及 `env.d.ts` 都會被收納在 `tsconfig.json` 底下。

2.  **Vite 生態系**：

    ```json
    "vite.config.*": "jsconfig*, vitest.config.*, cypress.config.*, playwright.config.*"
    ```

    測試設定檔 (`vitest`, `cypress`, `playwright`) 通常與建置工具 (`vite`) 息息相關，所以把它們收在一起。

3.  **專案核心與工具設定**：
    ```json
    "package.json": "package-lock.json, pnpm*, .yarnrc*, yarn*, .eslint*, eslint*, .oxlint*, oxlint*, .oxfmt*, .prettier*, prettier*, .editorconfig"
    ```
    這是最強大的一條！它把鎖定檔 (`lock files`)、Linter 設定 (`eslint`, `oxlint`)、Formatter 設定 (`prettier`) 全部都摺疊在 `package.json` 之下。因為通常我們看 `package.json` 就知道專案用了哪些工具，而詳細設定檔除非要修改，否則不需要一直露出來。

## 2. 視覺效果對比 👀

**啟用前 (Before)**：
你的根目錄可能有 15+ 個檔案，看起來密密麻麻。

**啟用後 (After)**：
根目錄可能只剩下 `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` 等少數幾個主要檔案。其他的都「隱身」了，只有當你點擊父檔案旁邊的箭頭時才會展開。

## 3. 自訂你的規則 🎨

除了上述的設定，你也可以根據自己的習慣新增規則。例如，如果你習慣將 Vue 元件的測試檔放在同層目錄，可以這樣設：

```json
"*.vue": "${capture}.spec.ts, ${capture}.test.ts"
```

這會讓 `Button.spec.ts` 自動摺疊在 `Button.vue` 底下，讓 Component 資料夾看起來更乾淨！

## 總結 ✨

File Nesting 是一個「設定一次，受用無窮」的小技巧。它不僅能讓開發環境更整潔，也能幫助新加入的成員更快聚焦在重要的檔案上。

💪 **動手做做看**：
打開你的 `.vscode/settings.json`，貼上上面的設定，觀察一下檔案總管的變化吧！試著新增一條規則，讓 `.env` 相關的檔案都摺疊在 `.env.example` 或 `package.json` 底下看看？
