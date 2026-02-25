---
description: Vue.js Masterclass 2024 專案教學文件索引
---

# 📚 教學文件索引 (Tutorial Index)

這裡收集了本專案所有的開發教學文件與操作指南，幫助團隊成員快速上手與解決問題。

## 工具與環境設定

- [掌握專案依賴更新神器：npm-check-updates (NCU)](project-setup/npm-check-updates.md) - 學習如何使用 NCU 工具來檢查並安全升級 `package.json` 中的依賴套件。
- [讓專案目錄超整潔：VS Code 檔案嵌套技巧 (File Nesting)](project-setup/vscode-file-nesting.md) - 學習如何透過配置 `.vscode/settings.json` 來隱藏次要設定檔，優化檔案總管的視覺體驗。
- [掌握代碼品質的守門員：ESLint 🛡️](project-setup/eslint.md) - 學習如何使用 ESLint 來掃描並修復程式碼問題，自訂規則以符合團隊規範。
- [讓代碼整齊劃一的魔法師：Prettier ✨](project-setup/prettier.md) - 深入了解與配置 Prettier，體驗自動化程式碼排版的魔力，從此告別格式爭論。
- [提升開發效率：Vue 專案的自動匯入神器 unplugin-auto-import 🚀](project-setup/unplugin-auto-import.md) - 學習如何設定 unplugin-auto-import 實現 Vue 與 Vue Router API 的自動匯入，省去手動 import 的麻煩。
- [釋放雙手：使用 unplugin-vue-components 實現 Vue 元件自動匯入 🪄](project-setup/unplugin-vue-components.md) - 學習如何在 Vite 專案中設定 unplugin-vue-components，實現自動匯入自定義與 UI 元件，提升開發效率。

## 專案結構與路由 (Project Structure and Routing)

- [打造流暢的單頁應用體驗：Vue Router 與路由導航設定 🚦](project-structure-and-routing/vue-router-setup.md) - 學習如何設定 Vue Router，建立專案列表與詳情頁面的動態路由，並使用 RouterLink 實現無縫導航。
- [解放雙手：Vue Router 自動路由與 TypeScript 支援 (Auto Routes) 🚀](project-structure-and-routing/auto-routes.md) - 學習如何使用 unplugin-vue-router 實現檔案基礎路由，並整合 TypeScript 提升開發體驗。
- [優化應用程式效能：路由懶加載 (Lazy Loading) ⚡️](project-structure-and-routing/lazy-loading-routes.md) - 學習如何透過 Vue Router 的懶加載與 Vite 的動態匯入降低初始載入時間，提升應用程式效能。
- [掌握 Vue Router 動態路由 (Dynamic Routes) 🧩](project-structure-and-routing/dynamic-routes.md) - 學習如何設定動態路由參數 (如 `:id`)，並在元件中使用 `useRoute()` 取得參數資訊。
- [捕捉未定義路由與建立 404 頁面 🚫 (Catch All Undefined Routes)](project-structure-and-routing/catch-all-routes-404.md) - 學會如何在 Vue Router 中設定捕捉所有未定義路由 (Catch-all routes) 並建立自定義的 404 錯誤頁面，提升使用者體驗。

## 後端整合 (Backend Integration)

- [啟動應用程式後端：Supabase 初始化與整合 🚀](backend-integration/supabase-setup.md) - 學習如何安裝與設定 Supabase 客戶端，配置環境變數，並在 Vue 應用中建立統一的資料庫連線實例。
- [掌握 Supabase CLI：初始化、登入與專案連結 🔗](backend-integration/supabase-cli-scripts.md) - 學習如何使用 Supabase CLI 指令來初始化、登入與連結專案，並透過環境變數管理專案 ID。
- [掌握 Supabase 資料庫遷移與數據填充：Migration 與 Seeding 實戰 🗄️](backend-integration/supabase-local-development.md) - 學習如何使用 Supabase CLI 建立資料庫遷移 (Migrations)、填充測試數據 (Seeding)，以及透過 Git 管理資料庫變更。
- [部署 Supabase 資料庫遷移至生產環境：使用 Migration Up 🚀](backend-integration/supabase-production-migration.md) - 學習如何將本地開發產生的資料庫遷移文件應用到遠端生產環境的 Supabase 專案中。
- [增強 Supabase 與 TypeScript 的整合體驗：自動生成型別定義 📐](backend-integration/supabase-typescript.md) - 學習如何自動生成 Supabase 資料庫的 TypeScript 型別定義，並在 Vue 專案中應用這些型別來提升開發體驗與代碼品質。
- [探索 Vue 3 的 Suspense 元件 ⏳](backend-integration/understanding-suspense.md) - 學習如何使用 Suspense 處理非同步元件，並解決 setup function returned a promise 的警告。

## 增添 UI 優雅風格 (Adding UI Elegance with Style)

- [探索 Shadcn Vue：打造優雅的 UI 介面 ✨](adding-ui-elegance-with-style/introducing-shadcn-vue.md) - 介紹 Shadcn Vue 並將其配置到專案中，快速構建精美的元件。
- [實戰演練：整合 Dropdown 與 Avatar 元件 ✨](adding-ui-elegance-with-style/adding-avatar-and-dropdown.md) - 學習如何將 Avatar 與 Dropdown Menu 整合，打造精美的使用者導航列。
- [靈活運用 Iconify：在 Vue 中整合 Web Component 圖標 🎨](adding-ui-elegance-with-style/using-iconify-icons.md) - 學習如何將 Iconify Web Component 整合到 Vue 專案中，並使用數千種高品質圖示提升 UI 體驗。
- [打造可維護的元件介面：TypeScript Props 設計與實踐 🧩](adding-ui-elegance-with-style/interface-props-design.md) - 學習如何透過 TypeScript 介面定義 Props，確保資料傳遞的型別安全與結構清晰。
- [精準導航體驗：掌握 Active Link 樣式與 RouterLink 實作 🧭](adding-ui-elegance-with-style/active-link-styles.md) - 深入了解 Vue Router 的連結啟用狀態 (Active State)，並實作 Sidebar 的選單高亮效果。
- [實作強大的資料表格：整合 TanStack Table 與 Shadcn Vue 🚀](adding-ui-elegance-with-style/displaying-data-with-tables.md) - 學習如何使用 TanStack Table 處理複雜邏輯，並結合 Shadcn Vue 打造美觀且功能強大的資料表格。
