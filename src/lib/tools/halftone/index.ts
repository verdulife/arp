import type { ToolModule } from '$lib/types/tool'
import { registry } from '$lib/registry'
import Halftone from './Halftone.svelte'

export default {
  meta: registry.find(t => t.slug === 'halftone')!,
  previewSize: { width: 800, height: 640 },
  component: Halftone,
  worker: () => new Worker(
    new URL('./worker.ts', import.meta.url),
    { type: 'module' }
  ),
  supportsSvg: true
} satisfies ToolModule