import type { Component } from "svelte"

export type ParamType = 'slider' | 'color' | 'select' | 'upload'

export interface ParamDefinition {
  key: string
  label: string
  type: ParamType
  default: number | string
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: { label: string; value: string }[]
  group?: string
}

export interface ToolMeta {
  slug: string
  name: string
  family: string
  description: string
  params: ParamDefinition[]
}

export interface ExportOptions {
  format: 'png'
  dpi: 72 | 150 | 300
  width: number        // siempre mm internamente
  height: number       // siempre mm internamente
  unit: 'px' | 'mm' | 'in'
}

export type ToolParams = Record<string, number | string>

export interface ToolState {
  seed: string
  params: ToolParams
  hasPending: boolean
}

export interface WorkerRequest {
  mode: 'preview' | 'export'
  params: ToolParams
  seed: string
  exportOptions?: ExportOptions
  transferables?: {
    image?: ImageBitmap
    element?: ImageBitmap
  }
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress'
  svg?: string
  progress?: number
  error?: string
}

export interface ToolModule {
  meta: ToolMeta
  worker: () => Worker
  previewSize: { width: number; height: number }
  component: Component
}