// 업로드 전 브라우저에서 이미지 최적화 — 긴 변 최대 2560px, WebP 90%
// (WebP 인코딩을 못 하는 브라우저는 JPEG 90%로 대체) · 원본은 사용자 하드에 보관
const MAX_SIDE = 2560
const QUALITY  = 0.9

// 움직임 · 벡터가 사라지는 형식은 변환하지 않음
const SKIP_TYPES = ['image/gif', 'image/svg+xml']

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, QUALITY))
}

export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || SKIP_TYPES.includes(file.type)) return file

  try {
    // 휴대폰 사진의 회전(EXIF) 정보 반영
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, w, h)

    let blob = await canvasToBlob(canvas, 'image/webp')
    let ext = 'webp'
    // WebP 미지원 브라우저는 PNG로 돌려줌 → JPEG로 대체 (투명 영역은 흰색으로 채움)
    if (!blob || blob.type !== 'image/webp') {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
      blob = await canvasToBlob(canvas, 'image/jpeg')
      ext = 'jpg'
    }
    bitmap.close()
    if (!blob) return file

    // 이미 작은 이미지가 변환 후 오히려 커지면 원본 유지
    if (scale === 1 && blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
    return new File([blob], name, { type: blob.type })
  } catch {
    return file // 변환 실패 시 원본 그대로 업로드
  }
}
