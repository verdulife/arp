import type { WorkerRequest } from '$lib/types/tool'

interface HalftoneParams {
  cellSize: number
  minScale: number
  maxScale: number
  rotation: number
  jitter: number
  color: string
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function getAverageLuminance(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  cellX: number,
  cellY: number,
  cellSize: number
): number {
  let total = 0
  let count = 0

  const x0 = Math.floor(cellX * cellSize)
  const y0 = Math.floor(cellY * cellSize)
  const x1 = Math.min(x0 + cellSize, imgWidth)
  const y1 = Math.min(y0 + cellSize, imgHeight)

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * imgWidth + x) * 4
      total += getLuminance(data[i], data[i + 1], data[i + 2])
      count++
    }
  }

  return count > 0 ? total / count : 255
}

function buildCircleElement(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  rotation: number
): string {
  if (radius <= 0) return ''
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" transform="rotate(${rotation} ${cx} ${cy})"/>`
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { params, transferables } = e.data

  const {
    cellSize = 24,
    minScale = 0.1,
    maxScale = 1,
    rotation = 0,
    jitter = 0,
    color = '#1a1a1a',
  } = params as unknown as HalftoneParams

  const WIDTH = 800
  const HEIGHT = 640

  // Obtener datos de imagen
  let imageData: ImageData | null = null

  if (transferables?.image) {
    const offscreen = new OffscreenCanvas(WIDTH, HEIGHT)
    const ctx = offscreen.getContext('2d')!
    ctx.drawImage(transferables.image, 0, 0, WIDTH, HEIGHT)
    imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    transferables.image.close()
  }

  // Si no hay imagen, usar gradiente sintético
  if (!imageData) {
    const offscreen = new OffscreenCanvas(WIDTH, HEIGHT)
    const ctx = offscreen.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
    gradient.addColorStop(0, '#000000')
    gradient.addColorStop(1, '#ffffff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  }

  const { data, width, height } = imageData

  const cols = Math.ceil(width / cellSize)
  const rows = Math.ceil(height / cellSize)

  const elements: string[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const luminance = getAverageLuminance(data, width, height, col, row, cellSize)

      // Luminosidad 0 (negro) → maxScale, luminosidad 255 (blanco) → minScale
      const t = 1 - luminance / 255
      const scale = minScale + t * (maxScale - minScale)
      const radius = (cellSize / 2) * scale

      const jitterX = jitter > 0 ? (Math.random() - 0.5) * jitter : 0
      const jitterY = jitter > 0 ? (Math.random() - 0.5) * jitter : 0

      const cx = col * cellSize + cellSize / 2 + jitterX
      const cy = row * cellSize + cellSize / 2 + jitterY

      elements.push(buildCircleElement(cx, cy, radius, String(color), Number(rotation)))
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:white">
  ${elements.filter(Boolean).join('\n  ')}
</svg>`

  self.postMessage({ type: 'result', svg })
}