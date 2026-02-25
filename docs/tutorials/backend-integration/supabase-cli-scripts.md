---
description: 學習如何使用 Supabase CLI 指令來初始化、登入與連結專案，並透過環境變數管理專案 ID。
---

# 掌握 Supabase CLI：初始化、登入與專案連結 🔗

本教學將帶領你了解如何在 `package.json` 中配置與使用 Supabase CLI 指令，並學習如何將敏感的專案 ID 提取至環境變數中，讓專案管理更安全、更靈活。

## 為什麼需要這些指令？ 🤔

在開發過程中，我們經常需要與 Supabase 平台進行互動。透過將常用的 CLI 指令封裝在 npm scripts 中，我們可以：

1.  **統一團隊操作**：確保所有成員使用相同的指令參數。
2.  **簡化記憶負擔**：不需要記住冗長的 CLI 參數。
3.  **提升開發效率**：一鍵完成初始化、登入或連結操作。

## 指令詳解 (Commands Explained) 📖

我們在 `package.json` 中新增了以下三個主要指令：

### 1. 初始化專案 (`supabase:init`)

```bash
npm run supabase:init
```

- **用途**：在本地專案中初始化 Supabase 配置。
- **效果**：執行後會產生一個 `supabase` 資料夾，其中包含 `config.toml` 設定檔。這是使用 Supabase CLI 的第一步，讓 CLI 知道如何處理本地開發環境。

### 2. 登入 Supabase (`supabase:login`)

```bash
npm run supabase:login
```

- **用途**：驗證你的 Supabase 帳戶。
- **效果**：執行後會要求你輸入 Supabase 的 Access Token（或透過瀏覽器登入）。登入成功後，CLI 才能有權限存取你的遠端專案。

### 3. 連結遠端專案 (`supabase:link`)

```bash
npm run supabase:link
```

- **用途**：將你的本地開發環境與 Supabase 平台上的遠端專案連結起來。
- **效果**：連結後，你可以同步資料庫 Schema、執行遷移 (Migrations) 或部署 Edge Functions。
- **注意**：此指令需要指定 `project-ref` (專案 ID)，我們將透過環境變數來管理它。

## 環境變數設定 (Environment Variables) 🛠️

為了避免將專案 ID (Project ID) 硬編碼 (Hardcode) 在 `package.json` 中，我們將其提取到 `.env` 檔案中。這樣的做法有助於：

- **安全性**：避免敏感資訊直接暴露在程式碼庫中（雖 Project ID 非極度敏感，但養成好習慣很重要）。
- **靈活度**：不同環境（如開發、測試、生產）可以透過更換 `.env` 輕鬆切換對應的 Supabase 專案。

### 設定步驟

1.  **開啟 `.env` 檔案**：
    在專案根目錄下找到或建立 `.env` 檔案。

2.  **新增 `SUPABASE_PROJECT_ID` 變數**：
    將你的 Supabase 專案 ID 填入：

    ```env
    # .env
    SUPABASE_PROJECT_ID=你的專案ID (例如: bdqygwnjxkpwxzuldosj)
    ```

    > 💡 **小撇步**：你可以從 Supabase Dashboard 的網址列或是 `Project Settings` > `General` 中找到 `Reference ID`。

3.  **更新 `package.json` 指令**：
    我們修改了 `supabase:link` 指令，使其先載入 `.env` 變數，再執行連結：

    ```json
    // package.json
    {
      "scripts": {
        // ...
        "supabase:link": "source .env && supabase link --project-ref $SUPABASE_PROJECT_ID"
      }
    }
    ```

    _(註：此寫法適用於 macOS/Linux 環境。Windows 用戶可能需要使用 `cross-env` 或其他方式載入變數)_

## 💪 動手做做看

現在，試著執行以下步驟來完成 Supabase 的連結：

1.  確認 `.env` 中已設定正確的 `SUPABASE_PROJECT_ID`。
2.  執行初始化（如果尚未執行過）：
    ```bash
    npm run supabase:init
    ```
3.  登入 Supabase：
    ```bash
    npm run supabase:login
    ```
4.  連結專案：
    ```bash
    npm run supabase:link
    ```
    如果成功，你應該會看到 CLI 提示連結成功，並要求你輸入資料庫密碼（如果需要）。

## 總結

透過將 Supabase CLI 指令整合進 npm scripts 並結合環境變數，我們建立了一個更規範、更易於管理的後端開發流程。現在你的專案已經準備好與 Supabase 緊密協作了！ 🚀
