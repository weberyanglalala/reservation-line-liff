# analyzeImage API 規格（zh-TW）

## 1. 功能摘要
`analyzeImage(file: File): Promise<OcrResult | null>`

將前端上傳的影像檔轉為 Base64 Data URL，並以 `POST` JSON 送至 OCR Webhook，回傳標準化後的驗光資料。

## 2. 前置條件
- 必須設定環境變數：`VITE_OCR_WEBHOOK_URL`
- 若未設定，函式會：
  - 設定 `ocrError = "請設定 VITE_OCR_WEBHOOK_URL 環境變數"`
  - 直接回傳 `null`

## 3. 狀態管理
- 開始執行時：
  - `isProcessing = true`
  - `ocrError = ""`
- 結束（成功或失敗）時：
  - `isProcessing = false`

## 4. Request 規格
### 4.1 Endpoint
- `POST {VITE_OCR_WEBHOOK_URL}`

### 4.2 Headers
```http
Content-Type: application/json
```

### 4.3 Body
```json
{
  "base64": "data:<mime-type>;base64,<encoded-data>"
}
```

說明：
- `base64` 來自 `FileReader.readAsDataURL(file)`，格式為 Data URL（非純 Base64 字串）。

## 5. Response 規格
函式預期 Webhook 回傳 JSON 物件，並嘗試讀取以下欄位：

- `od_sphere`
- `od_cylinder`
- `od_axis`
- `od_va`
- `os_sphere`
- `os_cylinder`
- `os_axis`
- `os_va`
- `pd`
- `add_power`
- `remarks`

### 5.1 回傳型別（前端最終輸出）
```ts
interface OcrResult {
  od_sphere: string
  od_cylinder: string
  od_axis: string
  od_va: string
  os_sphere: string
  os_cylinder: string
  os_axis: string
  os_va: string
  pd: string
  add_power: string
  remarks: string
}
```

### 5.2 欄位轉換規則
- 對每個欄位執行：
  - 若值 `!= null`（非 `null` 且非 `undefined`），轉為 `String(value)`
  - 否則補空字串 `""`
- 因此回傳結果保證為 `OcrResult`（全部字串欄位）或 `null`。

## 6. 錯誤處理
### 6.1 HTTP 非 2xx
- 條件：`response.ok === false`
- 行為：
  - `ocrError = "伺服器錯誤 (<status>)"`
  - 回傳 `null`

### 6.2 例外（網路、JSON parse、FileReader 等）
- 行為：
  - 若為 `Error`：`ocrError = e.message`
  - 否則：`ocrError = "辨識失敗，請再試一次"`
  - 回傳 `null`

## 7. 成功條件
- Webhook 回應 HTTP 2xx
- 回應可被 `response.json()` 解析
- 函式回傳 `OcrResult`

## 8. 使用範例
```ts
const { analyzeImage, isProcessing, ocrError } = useOptometryOCR()

const result = await analyzeImage(file)
if (!result) {
  console.error(ocrError.value)
} else {
  console.log(result.od_sphere, result.os_sphere)
}
```

## 9. 備註
- 此函式未檢查 `file` 類型與大小，若有需求應在呼叫前先做驗證。
- 此函式不限制 Webhook 回傳額外欄位，僅取用規格列出的欄位。
