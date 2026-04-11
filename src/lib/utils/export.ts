export async function svgToCanvas(
  svg: string,
  width: number,
  height: number
): Promise<OffscreenCanvas> {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Error al cargar el SVG'))
  })

  ctx.drawImage(img, 0, 0, width, height)
  URL.revokeObjectURL(url)

  return canvas
}

export function injectPHYs(buffer: ArrayBuffer, dpi: number): ArrayBuffer {
  const pixelsPerMeter = Math.round(dpi / 0.0254)

  const chunkData = new Uint8Array(9)
  const view = new DataView(chunkData.buffer)
  view.setUint32(0, pixelsPerMeter)
  view.setUint32(4, pixelsPerMeter)
  chunkData[8] = 1

  const typeAndData = new Uint8Array(13)
  typeAndData.set([112, 72, 89, 115])
  typeAndData.set(chunkData, 4)
  const crc = crc32(typeAndData)

  const chunk = new Uint8Array(4 + 4 + 9 + 4)
  const chunkView = new DataView(chunk.buffer)
  chunkView.setUint32(0, 9)
  chunk.set([112, 72, 89, 115], 4)
  chunk.set(chunkData, 8)
  chunkView.setUint32(17, crc)

  const src = new Uint8Array(buffer)
  const result = new Uint8Array(src.length + chunk.length)
  result.set(src.slice(0, 33))
  result.set(chunk, 33)
  result.set(src.slice(33), 33 + chunk.length)

  return result.buffer
}

function crc32(data: Uint8Array): number {
  const table = makeCRCTable()
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeCRCTable(): number[] {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
}

export async function canvasToPngWithDpi(
  canvas: OffscreenCanvas,
  dpi: number
): Promise<Blob> {
  const blob = await canvas.convertToBlob({ type: 'image/png' })
  const buffer = await blob.arrayBuffer()
  const withDpi = injectPHYs(buffer, dpi)
  return new Blob([withDpi], { type: 'image/png' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function buildFilename(
  slug: string,
  seed: string,
  dpi: number,
  format: 'png' | 'svg' = 'png'
): string {
  return format === 'svg'
    ? `arp-${slug}-${seed}.svg`
    : `arp-${slug}-${seed}-${dpi}dpi.png`
}