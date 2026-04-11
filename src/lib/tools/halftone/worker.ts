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

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { params, transferables, elementChar, elementSvg } = e.data

  const {
    cellSize = 24,
    minScale = 0.1,
    maxScale = 1,
    rotation = 0,
    jitter = 0,
    color = '#1a1a1a',
  } = params as unknown as HalftoneParams

  let WIDTH = 800
  let HEIGHT = 640
  let imageData: ImageData | null = null

  if (transferables?.image) {
    WIDTH = transferables.image.width
    HEIGHT = transferables.image.height
    const offscreen = new OffscreenCanvas(WIDTH, HEIGHT)
    const ctx = offscreen.getContext('2d')!
    ctx.drawImage(transferables.image, 0, 0, WIDTH, HEIGHT)
    imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    transferables.image.close()
  }

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

  // Extraemos el contenido interno del SVG elemento para usarlo en <symbol>
  let symbolDef = ''
  let useSymbol = false

  if (elementSvg) {
    // Extraemos viewBox y contenido interno del SVG
    const viewBoxMatch = elementSvg.match(/viewBox="([^"]+)"/)
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100'
    const innerMatch = elementSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)
    const inner = innerMatch ? innerMatch[1] : ''

    symbolDef = `<symbol id="el" viewBox="${viewBox}">${inner}</symbol>`
    useSymbol = true
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const luminance = getAverageLuminance(data, width, height, col, row, cellSize)
      const t = 1 - luminance / 255
      const scale = minScale + t * (maxScale - minScale)
      const size = cellSize * scale

      if (size <= 0) continue

      const jitterX = jitter > 0 ? (Math.random() - 0.5) * jitter : 0
      const jitterY = jitter > 0 ? (Math.random() - 0.5) * jitter : 0

      const cx = col * cellSize + cellSize / 2 + jitterX
      const cy = row * cellSize + cellSize / 2 + jitterY
      const x = cx - size / 2
      const y = cy - size / 2

      if (useSymbol) {
        elements.push(
          `<use href="#el" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${color}" transform="rotate(${rotation} ${cx.toFixed(2)} ${cy.toFixed(2)})"/>`
        )
      } else if (elementChar) {
        elements.push(
          `<text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-family="${elementChar.font}" font-size="${(size * 0.85).toFixed(2)}" fill="${color}" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotation} ${cx.toFixed(2)} ${cy.toFixed(2)})">${elementChar.value}</text>`
        )
      } else {
        elements.push(
          `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(size / 2).toFixed(2)}" fill="${color}" transform="rotate(${rotation} ${cx.toFixed(2)} ${cy.toFixed(2)})"/>`
        )
      }
    }
  }

  const defs = symbolDef ? `<defs>${symbolDef}</defs>` : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" style="background:white">
  ${defs}
  ${elements.filter(Boolean).join('\n  ')}
</svg>`

  self.postMessage({ type: 'result', svg, width: WIDTH, height: HEIGHT })
}