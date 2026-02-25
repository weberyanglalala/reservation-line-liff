---
description: 讓代碼整齊劃一的魔法師：深入理解與配置 Prettier ✨
---

# 讓代碼整齊劃一的魔法師：Prettier ✨

如果說 ESLint 是檢查程式碼邏輯錯誤的教練，那麼 **Prettier** 就是一位對美感有著極致堅持的造型師。它會強制統一你的程式碼格式，讓整個專案看起來就像是同一個人寫的一樣整潔、優雅。

在這單元中，我們將學習如何使用 Prettier 來自動化程式碼排版，從此不再為了「要不要加分號」、「縮排要幾格」這種瑣事浪費時間！

## 為什麼需要 Prettier？ 🤷‍♂️

在多人協作的專案中，每個人的 coding 習慣都不同。為了維護程式碼的一致性，我們往往需要在 Code Review 時花費大量時間去討論縮排、換行等格式問題。這不僅效率低，也容易傷感情。

Prettier 的出現完美解決了這個痛點：

1.  **自動化格式**：按下儲存鍵，程式碼瞬間變整齊，不用自己手動調整。
2.  **終結爭論**：團隊統一定義好設定檔，Prettier 說了算，不用再爭論哪種風格比較好。
3.  **提升可讀性**：整齊的程式碼讓人閱讀起來心情愉悅，更容易理解邏輯。

## 專案中的 Prettier 設定 ⚙️

在我們的 Vue.js Masterclass 2024 專案中，Prettier 的設定檔位於專案根目錄的 `.prettierrc.json`。

讓我們來看看目前的設定：

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

### 設定解析 🧐

- **`semi: false`**：不使用分號 (Semicolons)。這是 Vue 社群中非常流行的風格，讓程式碼看起來更簡潔。
- **`singleQuote: true`**：使用單引號 (`'`) 而不是雙引號 (`"`)。
- **`printWidth: 100`**：每一行的最大字數限制為 100 字元。超過這個長度，Prettier 就會自動幫你換行，避免程式碼過長難以閱讀。

## 如何執行 Prettier？ 🏃‍♀️

### 1. 使用 npm script

我們在 `package.json` 中已經準備好了一個指令：

```bash
npm run format
```

執行這個指令，Prettier 就會掃描 `src/` 目錄下的所有檔案，並自動幫你修正格式。

### 2. VS Code 自動排版 (推薦！) 🚀

最棒的使用方式，就是讓 VS Code 在我們存檔 (Save) 的時候自動執行 Prettier。這樣你完全不需要手動下指令，寫程式的過程會非常流暢。

**設定步驟：**

1.  安裝 **Prettier - Code formatter** 擴充套件 (由 Prettier 發布)。
2.  開啟 VS Code 設定 (Command + ,)。
3.  搜尋 `Editor: Format On Save` 並勾選它。
4.  搜尋 `Editor: Default Formatter`，選擇 `Prettier - Code formatter`。

現在，試著隨便把程式碼弄亂，按下 `Ctrl + S` (或 `Cmd + S`)，見證奇蹟的時刻！✨

## ESLint 與 Prettier 的關係 🤝

你可能會疑惑：「ESLint 不也是在檢查程式碼嗎？為什麼還需要 Prettier？」

簡單來說：

- **ESLint** 關注的是 **程式碼品質 (Code Quality)**：例如「有沒有使用未定義的變數」、「有沒有無窮迴圈」。
- **Prettier** 關注的是 **程式碼格式 (Code Formatting)**：例如「一行要多長」、「要不要加分號」、「括號要怎麼擺」。

雖然 ESLint 也可以做一些格式檢查，但 Prettier 在這方面做得更好、更專業。現代的前端開發通常會將兩者結合使用：**用 ESLint 抓錯誤，用 Prettier 管排版**。

## 延伸閱讀與資源 📚

- [Prettier 官方網站](https://prettier.io/) - 當然是最佳的學習資源。
- [Prettier VS Code Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 擴充套件下載頁面。
- [ESLint](https://eslint.org/) - 我們的品質守門員。
- [ESLint Plugin Vue](https://eslint.vuejs.org/) - Vue 的 ESLint 規則。
- [Visual Studio Code for Vue.js Developers Course](https://vueschool.io/courses/visual-studio-code-for-vue-js-developers) - Vue School 的優質課程 (需付費)。

## 💪 動手做做看 Challenge

1.  打開 `src/App.vue`。
2.  故意把縮排弄亂，或者把單引號改成雙引號。
3.  按下儲存鍵 (Cmd+S)，看看 VS Code 是否會自動幫你修復？
4.  如果沒有安裝擴充套件，試著在終端機執行 `npm run format`，看看檔案是否恢復整齊？
