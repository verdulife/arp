import { getContext, setContext } from 'svelte'
import { generateSeed, isValidSeed } from '$lib/utils/seed'
import { getTool } from '$lib/registry'
import type { ToolParams, ToolState } from '$lib/types/tool'

const CONTEXT_KEY = Symbol('toolState')
const STORAGE_PREFIX = 'arp:tool'

function storageKey(slug: string): string {
  return `${STORAGE_PREFIX}:${slug}:state`
}

function loadFromStorage(slug: string): Partial<ToolState> | null {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return null
    return JSON.parse(raw) as Partial<ToolState>
  } catch {
    return null
  }
}

function saveToStorage(slug: string, state: ToolState): void {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify({
      seed: state.seed,
      params: state.params,
    }))
  } catch {
    // localStorage puede fallar en modo privado o si está lleno
  }
}

function buildInitialParams(slug: string, saved: Partial<ToolState> | null): ToolParams {
  const tool = getTool(slug)
  if (!tool) return {}
  const defaults = Object.fromEntries(tool.params.map(p => [p.key, p.default]))
  if (!saved?.params) return defaults
  // Fusiona defaults con saved — así los parámetros nuevos aparecen con su default
  return { ...defaults, ...saved.params }
}

class ToolStateManager {
  readonly slug: string

  seed = $state<string>('')
  params = $state<ToolParams>({})
  hasPending = $state<boolean>(false)
  uploads = $state<Record<string, { name: string; file: File; width: number; height: number }>>({})

  constructor(slug: string, urlParams?: URLSearchParams) {
    this.slug = slug

    const saved = loadFromStorage(slug)
    const urlSeed = urlParams?.get('seed')
    const initialSeed = (urlSeed && isValidSeed(urlSeed))
      ? urlSeed
      : (saved?.seed ?? generateSeed())

    this.seed = initialSeed
    this.params = buildInitialParams(slug, saved)

    // Persistencia automática reactiva
    $effect.root(() => {
      $effect(() => {
        saveToStorage(slug, {
          seed: this.seed,
          params: this.params,
          hasPending: false,
        })
      })
    })
  }

  setParam(key: string, value: number | string): void {
    this.params[key] = value
    this.hasPending = true
  }

  regenerateSeed(): void {
    this.seed = generateSeed()
    this.hasPending = true
  }

  setSeed(seed: string): void {
    if (!isValidSeed(seed)) return
    this.seed = seed
    this.hasPending = true
  }

  generate(): void {
    this.hasPending = false
  }

  reset(): void {
    const tool = getTool(this.slug)
    if (!tool) return
    this.params = Object.fromEntries(tool.params.map(p => [p.key, p.default]))
    this.seed = generateSeed()
    this.hasPending = false
    try {
      localStorage.removeItem(storageKey(this.slug))
    } catch {
      // Ignorar errores de localStorage
    }
  }

  // Serializa el estado actual a URLSearchParams para compartir
  toURLParams(): string {
    const entries = [
      ['seed', this.seed],
      ...Object.entries(this.params).map(([k, v]) => [k, String(v)])
    ]
    return entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
  }

  setUpload(key: string, file: File): Promise<void> {
    return createImageBitmap(file).then(bitmap => {
      this.uploads[key] = {
        name: file.name,
        file,
        width: bitmap.width,
        height: bitmap.height,
      }
      bitmap.close()
      this.hasPending = true
    })
  }

  clearUpload(key: string): void {
    delete this.uploads[key]
    this.hasPending = true
  }

  element = $state<{ type: 'svg'; file: File; name: string } | { type: 'char'; value: string; font: string } | null>(null)

  setElementSvg(file: File): void {
    this.element = { type: 'svg', file, name: file.name }
    this.hasPending = true
  }

  setElementChar(value: string, font: string): void {
    this.element = { type: 'char', value, font }
    this.hasPending = true
  }

  clearElement(): void {
    this.element = null
    this.hasPending = true
  }
}

// Crea la instancia y la pone en context — llamar en la página raíz de la herramienta
export function createToolState(slug: string, urlParams?: URLSearchParams): ToolStateManager {
  return new ToolStateManager(slug, urlParams)
}

export function setToolState(state: ToolStateManager): void {
  setContext(CONTEXT_KEY, state)
}

// Consume el estado desde cualquier componente hijo
export function useToolState(): ToolStateManager {
  const state = getContext<ToolStateManager>(CONTEXT_KEY)
  if (!state) throw new Error('useToolState() debe usarse dentro de una herramienta')
  return state
}