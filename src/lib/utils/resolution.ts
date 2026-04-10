import type { ExportOptions } from '$lib/types/tool'

const MM_PER_INCH = 25.4

// Conversión a mm desde otras unidades
export function toMm(value: number, from: 'px' | 'in', dpi: number = 96): number {
  if (from === 'in') return value * MM_PER_INCH
  if (from === 'px') return (value / dpi) * MM_PER_INCH
  return value
}

// Conversión desde mm a otras unidades
export function fromMm(value: number, to: 'px' | 'in', dpi: number = 96): number {
  if (to === 'in') return value / MM_PER_INCH
  if (to === 'px') return (value / MM_PER_INCH) * dpi
  return value
}

// Conversión directa mm → px para el canvas
export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi)
}

// Tamaño final del canvas en píxeles desde ExportOptions
export function getCanvasSize(options: ExportOptions): { width: number; height: number } {
  return {
    width: mmToPx(options.width, options.dpi),
    height: mmToPx(options.height, options.dpi),
  }
}

// Formatea un valor en mm a la unidad de display elegida por el usuario
export function formatDisplay(mm: number, unit: 'px' | 'mm' | 'in', dpi: number = 96): string {
  if (unit === 'mm') return `${Math.round(mm * 10) / 10} mm`
  if (unit === 'in') return `${Math.round(fromMm(mm, 'in') * 100) / 100} in`
  if (unit === 'px') return `${Math.round(fromMm(mm, 'px', dpi))} px`
  return `${mm} mm`
}