---
description: 學習如何使用 Supabase CLI 建立資料庫遷移 (Migrations)、填充測試數據 (Seeding)，以及透過 Git 管理資料庫變更。
---

# 掌握 Supabase 資料庫遷移與數據填充：Migration 與 Seeding 實戰 🗄️

在開發應用程式時，管理資料庫結構變更 (Schema Changes) 與填充初始測試數據 (Seeding Data) 是不可或缺的環節。本教學將介紹如何透過 npm scripts 簡化 Supabase 的遷移與填充流程。

## 為什麼需要這些指令？ 🤔

手動執行 SQL 指令或透過 Dashboard 修改資料庫雖然方便，但在團隊協作與版控管理上容易產生衝突。透過標準化的 CLI 指令，我們可以：

1.  **版本控制資料庫結構**：確保所有開發者的資料庫結構一致。
2.  **自動化測試數據填充**：快速建立真實的開發數據。
3.  **快速重置環境**：一鍵清除舊資料並重新套用最新結構。

## 核心指令詳解 (Core Commands) 🛠️

我們在 `package.json` 中配置了以下四個關鍵指令：

### 1. 連結遠端專案 (`supabase:link`)

```bash
npm run supabase:link
```

- **指令內容**：`source .env && supabase link --project-ref $SUPABASE_PROJECT_ID`
- **用途**：讀取 `.env` 中的環境變數，並連結到指定的 Supabase 專案。
- **場景**：當你切換環境或首次設定專案時使用。

### 2. 建立新遷移檔案 (`db:migrate:new`)

```bash
npm run db:migrate:new
```

- **指令內容**：`supabase migration new projects_schema`
- **用途**：在 `supabase/migrations` 目錄下產生一個帶有時間戳記的 SQL 遷移檔案（例如：`20240101120000_projects_schema.sql`）。
- **場景**：當你需要修改資料庫結構（如新增表格、修改欄位）時。你會在這個產生的 SQL 檔案中撰寫你的 DDL (Data Definition Language) 語句。

### 3. 重置並套用遷移 (`db:reset`)

```bash
npm run db:reset
```

- **指令內容**：`supabase db reset --linked`
- **用途**：**警告：這會清除資料庫！** 此指令會重置連結的遠端資料庫（需謹慎使用，通常用於開發環境），清除所有資料，並重新套用 `supabase/migrations` 中的所有遷移檔案。
- **場景**：當開發環境資料庫混亂，需要「打掉重練」回到乾淨的 Schema 狀態時。
- **注意**：`--linked` 旗標表示操作對象是已連結的遠端專案，請務必確認你連結的是開發庫 (Development DB) 而非生產庫 (Production DB)。

### 4. 填充測試數據 (`db:seed`)

```bash
npm run db:seed
```

- **指令內容**：`node --env-file=.env database/seed.js`
- **用途**：使用 Node.js 執行 `database/seed.js` 腳本，將預先定義好的測試數據寫入資料庫。
- **場景**：在執行 `db:reset` 後，資料庫是空的，執行此指令可以快速填入測試用戶、文章等假資料。我們利用 Node.js 20+ 原生的 `--env-file` 參數來載入環境變數。

## 🔄 實戰工作流：重置與數據填充 (Workflow)

一個典型的開發迭代流程如下：

1.  **修改 Schema**：執行 `npm run db:migrate:new` 建立遷移檔並撰寫 SQL。
2.  **套用變更**：執行 `npm run db:reset` 重置資料庫並套用新的 Schema。
3.  **填充數據**：執行 `npm run db:seed` 產生測試資料。
4.  **驗證功能**：啟動前端應用進行測試。

## 🚨 處理意外狀況：重置 Git 暫存變更 (Reset Git Staged Changes)

在開發遷移腳本的過程中，有時我們會嘗試多次修改，導致產生了不必要的遷移檔案或修改了不該改的檔案。這時我們需要「後悔藥」。

如果你發現剛產生的遷移檔案有誤，或者 `supabase/migrations` 目錄下產生了預期外的檔案變更，可以使用 Git 指令來還原：

### 還原所有暫存區變更

如果你已經用 `git add` 暫存了檔案但想反悔：

```bash
git restore --staged .
```

這會將所有檔案從暫存區 (Staging Area) 移回工作區 (Working Directory)。

### 捨棄所有工作區變更 (慎用！)

如果你想完全捨棄目前目錄下所有的修改（包含剛建立但寫錯的遷移檔）：

```bash
git restore .
git clean -fd
```

- `git restore .`：還原已追蹤檔案的修改。
- `git clean -fd`：強制刪除未追蹤的新增檔案（例如剛產生的 `.sql` 檔案）。

> 💡 **小撇步**：建議在執行 `db:migrate:new` 之前，先確保 Git 狀態是乾淨的 (Committed)，這樣當你想要重置時，才不會誤刪其他重要的修改。

## 總結

透過 `db:migrate:new`、`db:reset` 與 `db:seed` 的組合，我們建立了一套標準化的資料庫開發循環 (Loop)。這不僅讓開發環境隨時保持最新且可重現，也讓團隊成員能更安心地修改資料庫結構。🚀
