export interface OcrResult {
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useOptometryOCR() {
  const isProcessing = ref(false)
  const ocrError = ref('')

  async function analyzeImage(file: File): Promise<OcrResult | null> {
    const webhookUrl = import.meta.env.VITE_OCR_WEBHOOK_URL
    if (!webhookUrl) {
      ocrError.value = '請設定 VITE_OCR_WEBHOOK_URL 環境變數'
      return null
    }

    isProcessing.value = true
    ocrError.value = ''

    try {
      const base64 = await fileToBase64(file)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64 })
      })

      if (!response.ok) {
        ocrError.value = `伺服器錯誤 (${response.status})`
        return null
      }

      const raw = await response.json() as Record<string, unknown>
      return {
        od_sphere:   raw.od_sphere   != null ? String(raw.od_sphere)   : '',
        od_cylinder: raw.od_cylinder != null ? String(raw.od_cylinder) : '',
        od_axis:     raw.od_axis     != null ? String(raw.od_axis)     : '',
        od_va:       raw.od_va       != null ? String(raw.od_va)       : '',
        os_sphere:   raw.os_sphere   != null ? String(raw.os_sphere)   : '',
        os_cylinder: raw.os_cylinder != null ? String(raw.os_cylinder) : '',
        os_axis:     raw.os_axis     != null ? String(raw.os_axis)     : '',
        os_va:       raw.os_va       != null ? String(raw.os_va)       : '',
        pd:          raw.pd          != null ? String(raw.pd)          : '',
        add_power:   raw.add_power   != null ? String(raw.add_power)   : '',
        remarks:     raw.remarks     != null ? String(raw.remarks)     : '',
      }
    } catch (e) {
      ocrError.value = e instanceof Error ? e.message : '辨識失敗，請再試一次'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  return { isProcessing, ocrError, analyzeImage }
}
