---
name: write-zh-tw-tutorial
description: Guidelines for writing educational tutorials in Traditional Chinese (zh-TW) with a friendly, engaging tone.
---

# 撰寫繁體中文教學文件指南 (write-zh-tw-tutorial)

此 Skill 旨在規範專案教學文件的撰寫風格，確保內容專業、易懂且具有親和力。

## 核心原則

1.  **語言**: 使用 **繁體中文 (zh-TW)**。
2.  **語氣**: 友善、積極、具備啟發性。像是與開發夥伴對話，而非生硬的教科書。
3.  **視覺輔助**: 適度使用 Emoji（例如：🚀, 💡, 🧱, 🧩）來增加閱讀趣味性與指引性。
4.  **結構化內容**:
    - 明確的 H1 標題。
    - 簡短的引言，說明本課重點。
    - 使用 H2, H3 區分邏輯區塊。
    - 提供清晰的程式碼範例。
    - 包含「💪 動手做做看」或「小挑戰」區塊鼓勵實作。
5.  **索引頁與描述**:
    - 每個教學文件目錄（例如 `docs/tutorials/`）都必須包含一個 `index.md`。
    - 每個文件都必須在 frontmatter 中包含 `description` 欄位作為短描述。

## 撰寫規範

### 標題樣式

- H1: 使用 `探索 XXX`、`學會 XXX` 或 `優化 XXX` 等動詞開頭。
- 範例：`# 優化 Tailwind CSS 的樣式管理：使用 Layer 指令 🎨`

### 內容區塊

1.  **概念解釋**: 使用生活化的比喻。例如將 ESLint 比喻成教練，Prettier 比喻成造型師。
2.  **步驟說明**: 使用有序清單 (1, 2, 3) 引導讀者操作。
3.  **程式碼塊**: 必須標註語言類型 (json, css, typescript, bash)，並確保縮排正確。
4.  **總結/範例**: 在結尾提供一個「完整的範例檔案內容」，方便讀者直接複製對照。

### 目錄結構與索引

- 當新增新的教學文件時，請務必更新 **根目錄下的** `docs/tutorials/index.md`。
- **請勿在子目錄建立 `index.md`**，所有教學連結統一收錄於 `docs/tutorials/index.md`。
- 格式範例：
  ```markdown
  - [標題](filename.md) - 短描述
  ```

## 範例參考

請參考 `examples/tutorial-template.md` 獲取基礎框架。
