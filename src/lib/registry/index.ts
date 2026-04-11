import type { ToolMeta, ToolModule } from '$lib/types/tool'

export const registry: ToolMeta[] = [
  {
    slug: 'halftone',
    name: 'Halftone personalizado',
    family: 'Densidad',
    description: 'Rellena una imagen con cualquier figura repetida.',
    params: [
      { key: 'cellSize', label: 'Tamaño de celda', type: 'slider', default: 24, min: 4, max: 80, step: 1, unit: 'px', group: 'Cuadrícula' },
      { key: 'minScale', label: 'Escala mínima', type: 'slider', default: 0.1, min: 0, max: 1, step: 0.01, group: 'Cuadrícula' },
      { key: 'maxScale', label: 'Escala máxima', type: 'slider', default: 1, min: 0, max: 1, step: 0.01, group: 'Cuadrícula' },
      { key: 'rotation', label: 'Rotación', type: 'slider', default: 0, min: 0, max: 360, step: 1, unit: '°', group: 'Variación' },
      { key: 'jitter', label: 'Jitter', type: 'slider', default: 0, min: 0, max: 20, step: 0.5, unit: 'px', group: 'Variación' },
      { key: 'color', label: 'Color', type: 'color', default: '#1a1a1a', group: 'Color' },
      { key: 'image', label: 'Imagen base', type: 'upload', default: '', group: 'Fuente' },
      { key: 'element', label: 'Figura elemento', type: 'element', default: '', group: 'Fuente' },
    ]
  },
  {
    slug: 'stippling',
    name: 'Stippling orgánico',
    family: 'Densidad',
    description: 'Distribuye puntos de forma natural siguiendo la luminosidad.',
    params: [
      { key: 'points', label: 'Número de puntos', type: 'slider', default: 2000, min: 100, max: 10000, step: 100, group: 'Distribución' },
      { key: 'minRadius', label: 'Radio mínimo', type: 'slider', default: 1, min: 0.5, max: 10, step: 0.5, unit: 'px', group: 'Distribución' },
      { key: 'maxRadius', label: 'Radio máximo', type: 'slider', default: 6, min: 1, max: 20, step: 0.5, unit: 'px', group: 'Distribución' },
      { key: 'color', label: 'Color', type: 'color', default: '#1a1a1a', group: 'Color' },
      { key: 'image', label: 'Imagen base', type: 'upload', default: '', group: 'Fuente' },
    ]
  },
  {
    slug: 'perlin-noise',
    name: 'Perlin / Simplex noise',
    family: 'Ruido y campo',
    description: 'Genera texturas y terrenos orgánicos desde cero.',
    params: [
      { key: 'scale', label: 'Escala', type: 'slider', default: 0.005, min: 0.001, max: 0.05, step: 0.001, group: 'Noise' },
      { key: 'octaves', label: 'Octavas', type: 'slider', default: 4, min: 1, max: 8, step: 1, group: 'Noise' },
      { key: 'persistence', label: 'Persistencia', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.01, group: 'Noise' },
      { key: 'colorA', label: 'Color A', type: 'color', default: '#1a1a1a', group: 'Color' },
      { key: 'colorB', label: 'Color B', type: 'color', default: '#f5f5f5', group: 'Color' },
    ]
  },
  {
    slug: 'flow-fields',
    name: 'Flow fields',
    family: 'Ruido y campo',
    description: 'Partículas que siguen corrientes de ruido dejando trazos.',
    params: [
      { key: 'particles', label: 'Partículas', type: 'slider', default: 500, min: 50, max: 3000, step: 50, group: 'Flujo' },
      { key: 'steps', label: 'Pasos', type: 'slider', default: 100, min: 10, max: 500, step: 10, group: 'Flujo' },
      { key: 'scale', label: 'Escala del campo', type: 'slider', default: 0.003, min: 0.001, max: 0.02, step: 0.001, group: 'Flujo' },
      { key: 'strokeWidth', label: 'Grosor', type: 'slider', default: 0.8, min: 0.1, max: 4, step: 0.1, unit: 'px', group: 'Trazo' },
      { key: 'color', label: 'Color', type: 'color', default: '#1a1a1a', group: 'Trazo' },
    ]
  },
]

export const families = [...new Set(registry.map(t => t.family))]

export function getTool(slug: string): ToolMeta | undefined {
  return registry.find(t => t.slug === slug)
}

export function getDefaultParams(slug: string): Record<string, number | string> {
  const tool = getTool(slug)
  if (!tool) return {}
  return Object.fromEntries(tool.params.map(p => [p.key, p.default]))
}

export function getFamilyColor(family: string): string {
  const colors: Record<string, string> = {
    'Densidad': 'bg-violet-100 dark:bg-violet-950',
    'Ruido y campo': 'bg-emerald-100 dark:bg-emerald-950',
    'Líneas': 'bg-amber-100 dark:bg-amber-950',
    'Tipografía': 'bg-rose-100 dark:bg-rose-950',
    'Física': 'bg-sky-100 dark:bg-sky-950',
    '3D e isometría': 'bg-pink-100 dark:bg-pink-950',
  }
  return colors[family] ?? 'bg-muted'
}

export const toolModules: Record<string, () => Promise<{ default: ToolModule }>> = {
  'halftone': () => import('$lib/tools/halftone/index'),
}