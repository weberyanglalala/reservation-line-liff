---
description: 學習如何將由於本地開發產生的資料庫遷移文件 (Migration Files) 應用到遠端生產環境 (Production) 的 Supabase 專案中。
---

# 部署 Supabase 資料庫遷移至生產環境：使用 Migration Up 🚀

在本地開發完成並測試通過後，下一步就是將資料庫的變更部署到遠端生產環境。Supabase CLI 提供了方便的指令，讓我們可以將本地的遷移文件 (Migration Files) 安全地應用到已連結的 Supabase 專案。

## 為什麼需要手動執行 Migration Up？ 🤔

通常在 CI/CD 流程中，我們會設定自動化部署。但在某些情況下，例如：

- **手動部署**：在尚未建立完整 CI/CD 流程的小型專案或開發初期。
- **緊急修復**：需要立即將某個資料庫變更應用到生產環境。
- **測試環境**：將變更部署到 Staging 或其他測試用的 Supabase 專案。

這時候，手動執行 `supabase migration up --linked` 就非常有用。

## 實作步驟 🛠️

### 1. 新增部署遷移的腳本 📜

為了方便執行，我們在 `package.json` 中加入一個新的 script。

打開 `package.json`，在 `scripts` 區塊中加入 `db:migrate:up` 指令：

```json:package.json
{
  "scripts": {
    // ... 其他 scripts
    "db:migrate:new": "supabase migration new",
    "db:reset": "supabase db reset --linked",
    "db:seed": "node --env-file=.env database/seed.js",
    "db:migrate:up": "supabase migration up --linked"
  }
}
```

這個指令使用了 `supabase migration up` 並加上 `--linked` 參數，明確告訴 Supabase CLI 目標是**已連結的遠端專案**，而不是本地資料庫。

### 2. 確認專案連結狀態 🔗

在執行部署之前，請確保你的本地專案已經正確連結到目標 Supabase 專案。你可以使用以下指令檢查：

```bash
npx supabase status
```

或者直接嘗試執行連結指令（如果已經連結過，它會提示你）：

```bash
npm run supabase:link
```

確保 `.env` 檔案中的 `SUPABASE_PROJECT_ID` 是正確的生產環境（或目標環境）ID。

### 3. 執行部署指令 🚀

確認無誤後，執行我們剛剛新增的腳本：

```bash
npm run db:migrate:up
```

### 4. 觀察輸出結果 👀

指令執行後，Supabase CLI 會：

1. 連線到遠端 Supabase 資料庫。
2. 檢查遠端資料庫目前的遷移版本。
3. 比對本地 `supabase/migrations` 目錄下的檔案。
4. 依序執行所有**尚未應用**的遷移文件。

如果執行成功，你會看到類似以下的輸出：

```bash
Applying migration 20240101000000_create_initial_schema.sql...
Applying migration 20240102000000_add_profiles_table.sql...
Finished supabase migration up.
```

如果所有遷移都已經應用過了，它會顯示：

```bash
Local migrations are up to date.
```

### 5. 驗證部署結果 ✅

部署完成後，建議登入 [Supabase Dashboard](https://supabase.com/dashboard)，進入你的專案：

1. 點擊左側選單的 **Table Editor**，查看資料表結構是否已更新。
2. 或者點擊 **Database** -> **Migrations**，查看遷移紀錄是否包含剛剛執行的版本。

## 常見問題與注意事項 ⚠️

- **備份數據**：在對生產環境資料庫進行任何變更（特別是破壞性變更如刪除欄位）之前，**強烈建議**先備份資料庫。
- **不可逆操作**：雖然遷移通常可以 rollback（如果寫了 down migration），但資料的遺失可能是不可逆的。請謹慎檢查遷移腳本內容。
- **多人協作**：在多人協作專案中，確保你的本地遷移文件是最新的（已 `git pull`），避免版本衝突。
- **權限問題**：執行此指令需要對目標 Supabase 專案擁有足夠的權限（如 Admin 或 Owner）。

## 小結 🎉

透過 `npm run db:migrate:up`，我們可以輕鬆地將本地精心設計的資料庫架構同步到生產環境。這是 Supabase 開發流程中至關重要的一環，確保了開發與生產環境的一致性！
