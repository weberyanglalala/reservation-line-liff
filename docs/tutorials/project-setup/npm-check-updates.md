---
description: 輕鬆管理專案依賴：掌握 npm-check-updates (NCU)
---

# 掌握專案依賴更新神器：npm-check-updates (NCU) 📦

在開發專案的過程中，保持 `package.json` 中的依賴套件最新是一件重要但也繁瑣的事情。手動檢查每個套件的版本不僅耗時，還容易疏漏。今天我們就來介紹一個強大的工具 `npm-check-updates` (簡稱 `ncu`)，它可以幫你一鍵檢查並升級 `package.json` 中的所有依賴！🚀

## 為什麼需要 ncu？

平常我們使用 `npm update` 只會根據 `package.json` 中定義的規則（例如 `^` 或 `~`）來更新，這意味著它**不會**幫你升級到最新的 Major Version（大版本）。

但 `ncu` 可以無視這些規則，直接幫你查詢並寫入最新的版本號到 `package.json` 中。這在專案初期或維護期想要大翻新時非常有用！💡

## 1. 安裝工具 🛠️

首先，我們將 `ncu` 安裝到全域環境，這樣你在任何專案都能使用它：

```bash
npm install -g npm-check-updates
```

驗證安裝是否成功：

```bash
ncu --version
```

## 2. 檢查更新 🔍

在專案根目錄執行 `ncu`，它會列出所有可更新的套件：

```bash
ncu
```

你可能會看到類似這樣的輸出：

```
Checking /Users/weberyangwork/Workspace/vue-projects/masterclass/vuejs-masterclass-2024/package.json
[====================] 20/20 100%

 @types/node               ^24.10.9  →  ^25.2.3
 eslint                     ^9.39.2  →  ^10.0.0
 vue                        ^3.5.27  →  ^3.5.28
 ...
```

左邊是目前版本，右邊是最新版本。如果變更是 **Major Version**（例如 `eslint` 從 `9` 變 `10`），通常會用紅色標示，提醒你可能有 Breaking Changes。🚨

## 3. 升級 package.json 📝

確認要升級後，加上 `-u` 參數，`ncu` 就會直接修改你的 `package.json` 文件：

```bash
ncu -u
```

你會看到：

```
Upgrading /Users/weberyangwork/Workspace/vue-projects/masterclass/vuejs-masterclass-2024/package.json
[====================] 20/20 100%
Run npm install to install new versions.
```

接著，你需要執行 `npm install` 來實際安裝這些新版本的套件。

## 4. 實戰演練：解決依賴衝突 (Dependency Hell) 🤯

⚠️ **注意：盲目升級所有套件可能會導致問題！**

如果你在執行 `ncu -u` 後接著執行 `npm install`，卻看到一大堆 `ERESOLVE overriding peer dependency` 的錯誤，這通常是因為某個依賴升級了 Major Version（例如 ESLint v10），但它的相關插件（Plugins）還沒支援這個新版本。

### 錯誤範例

```bash
npm warn ERESOLVE overriding peer dependency
npm warn Found: eslint@9.39.2
npm warn node_modules/eslint
npm warn   dev eslint@"^10.0.0" from the root project
...
npm warn Could not resolve dependency:
npm warn peer eslint@"^8.57.0 || ^9.0.0" from @vue/eslint-config-typescript@14.6.0
```

這表示 `eslint` 已經升上 v10，但 `@vue/eslint-config-typescript` 還只支援 `^9.0.0`。這時候強行安裝可能會導致 Lint 失效或報錯。

### 如何解決？ 🧩

遇到這種情況，我們需要稍微手動調整一下 `package.json`，把出問題的套件版本降回來。例如將 `eslint` 版本從 `^10.0.0` 改回 `^9.10.0`。

或者更好的方法是使用 **互動模式** (`Interactive Mode`)：

```bash
ncu -i
```

這會進入互動選單，你可以按 `空白鍵` 勾選或取消勾選要升級的套件。針對像 `eslint` 這種核心工具，如果相關生態系還沒跟上，建議先不要勾選升級 Major Version。✅

## 總結 / 指令速查表 📚

這份速查表可以幫助你快速回憶常用的指令：

```bash
# 全域安裝 ncu
npm install -g npm-check-updates

# 檢查專案有哪些可更新的套件
ncu

# 檢查並直接更新 package.json
ncu -u

# (推薦) 互動式檢查並更新
ncu -i

# 安裝新版本的套件 (更新完 package.json 後必須執行)
npm install
```

💪 **動手做做看**：現在就試著用 `ncu` 檢查你的專案，看看有哪些套件已經過時了吧！記得如果要升級 Major Version，先做好備份或確認相容性喔！
