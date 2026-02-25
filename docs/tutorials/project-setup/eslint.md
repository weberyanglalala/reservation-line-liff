---
description: 掌握代碼品質的守門員：深入理解與配置 ESLint 🛡️
---

# 掌握代碼品質的守門員：ESLint 🛡️

在這個單元中，我們將學習如何使用 **ESLint** 這位強大的代碼品質守門員，來提升 Vue.js 專案的一致性與品質。ESLint 就像是一位細心的審查員，能自動掃描程式碼中的錯誤、潛在問題以及風格不一致的地方，幫助你寫出更乾淨、更高效的程式碼。

## 為什麼需要 ESLint？ 🤔

想像一下，如果團隊中的每個人都有自己的 coding style，有的用單引號，有的用雙引號，有的喜歡加分號，有的不加... 這會讓程式碼庫變得混亂不堪，閱讀起來非常痛苦。

ESLint 的出現就是為了解決這個問題！它可以：

1.  **即時發現錯誤**：在執行程式碼之前，就先幫你找出可能的語法錯誤或邏輯漏洞（例如：使用了未定義的變數）。
2.  **統一風格**：強制執行團隊約定的 coding style，減少 code review 時因為格式問題而產生的爭論。
3.  **自動修復**：許多風格問題 ESLint 可以幫你一鍵自動修復 (Auto-fix)，省時又省力！✨

## 專案中的 ESLint 設定 ⚙️

在我們的 Vue.js Masterclass 2024 專案中，ESLint 的設定檔位於專案根目錄的 `eslint.config.ts`。這是一個 Typescript 格式的設定檔（這是 ESLint 9.x 開始推廣的 Flat Config 格式）。

### 如何執行 ESLint？

我們通常透過 `npm` script 來執行檢查。請打開終端機，輸入以下指令：

```bash
npm run lint
```

這個指令會掃描專案中所有的 `.vue`, `.ts`, `.tsx` 等檔案，並將檢查結果輸出在終端機中。如果看到綠色的訊息或沒有任何錯誤訊息，恭喜你，你的程式碼非常健康！🎉

如果出現錯誤，不用擔心，ESLint 會告訴你錯誤發生在哪個檔案、第幾行，以及錯誤的原因。

## 錯誤 (Error) vs 警告 (Warning) ⚠️

在 ESLint 的檢查結果中，你可能會看到兩種類型的訊息：

- **Error (紅色)** 🔴：這代表程式碼中有嚴重的問題，必須修復才能通過檢查（通常也會導致 build 失敗）。例如：使用了未定義的變數、語法錯誤等。
- **Warning (黃色)** 🟡：這代表程式碼中有些不建議的寫法，或者是風格上的建議，但不一定會影響程式執行。雖然它是警告，但我們通常也建議盡量修復它，以保持程式碼的高品質。

## 自訂 ESLint 規則 (Customization) 🛠️

有時候，預設的規則可能太過嚴格，或者不符合我們專案的需求。這時候我們可以修改 `eslint.config.ts` 來調整規則。

以我們專案中的 `eslint.config.ts` 為例：

```typescript
// eslint.config.ts

export default defineConfigWithVueTs(
  // ... 其他設定
  {
    rules: {
      'vue/multi-word-component-names': 0, // 關閉 Vue 元件名稱必須是多個單字的規則
    },
  },
  // ...
)
```

- **`rules` 物件**：這裡是我們自訂規則的地方。
- **規則名稱**：例如 `'vue/multi-word-component-names'`。
- **規則狀態**：
  - `0` 或 `'off'`：關閉規則。
  - `1` 或 `'warn'`：開啟規則，視為警告。
  - `2` 或 `'error'`：開啟規則，視為錯誤。

### 實際演練

假設我們不想讓 ESLint 檢查有沒有使用未定義的變數（雖然這通常不建議關閉），我們可以加入 `'no-undef': 'off'` 到 rules 中。

## 安裝 ESLint VS Code 擴充套件 🧩

為了獲得最棒的開發體驗，強烈建議安裝 VS Code 的 ESLint 擴充套件。它可以讓你在寫程式的當下，直接在編輯器中看到紅色的波浪底線，提示你哪裡有錯，甚至可以透過快顯選單直接修復！

1.  打開 VS Code 的 Extensions 面板 (Cmd+Shift+X)。
2.  搜尋 `ESLint`。
3.  點擊 Install 安裝 (由 Microsoft 發布)。

安裝後，當你的程式碼違反規則時，VS Code 就會即時畫底線提醒你，非常方便！🚀

## 延伸閱讀與資源 📚

想深入了解更多 ESLint 的奧秘嗎？這裡有一些優質的資源：

- [ESLint 官方網站](https://eslint.org/) - 了解更多核心概念與規則。
- [VS Code ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 擴充套件下載頁面。
- [Prettier](https://prettier.io/) - 專注於程式碼格式化的工具，通常與 ESLint 搭配使用。
- [eslint-plugin-vue](https://eslint.vuejs.org/) - 專為 Vue.js 設計的 ESLint 規則插件。
- [ESLint Vue Rules](https://eslint.vuejs.org/rules/) - 完整的 Vue 相關規則列表。
- [Deprecation of formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/) - 了解為什麼現在 ESLint 專注於品質，而將格式化交給 Prettier。
- [Visual Studio Code for Vue.js Developers Course](https://vueschool.io/courses/visual-studio-code-for-vue-js-developers) - Vue School 的優質課程 (需付費)。

## 💪 動手做做看 challenge

1.  試著在 `App.vue` 中故意寫一個未使用的變數（例如 `const test = 1;` 但不使用它），看看 VS Code 會不會出現黃色或紅色的波浪底線？
2.  執行 `npm run lint`，看看終端機是否會抓到這個錯誤？
3.  試著修改 `eslint.config.ts`，將該規則暫時關閉，觀察結果有什麼不同？（記得測試完要改回來喔！）
