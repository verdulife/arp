import type { Component } from "svelte"

export type ParamType = 'slider' | 'color' | 'select' | 'upload' | 'element'

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
  format: 'png' | 'svg'
  dpi: 72 | 150 | 300
  width: number
  height: number
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
  }
  elementSvg?: string
  elementChar?: {
    value: string
    font: string
  }
}

export interface WorkerResponse {
  type: 'result' | 'error' | 'progress'
  svg?: string
  width?: number
  height?: number
  progress?: number
  error?: string
}

export interface ToolModule {
  meta: ToolMeta
  worker: () => Worker
  previewSize: { width: number; height: number }
  component: Component
  supportsSvg: boolean
}