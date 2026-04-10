import type { WorkerRequest, WorkerResponse } from '$lib/types/tool'

type BridgeStatus = 'idle' | 'running' | 'done' | 'error'

class WorkerBridge {
  private worker: Worker | null = null
  private factory: () => Worker

  status = $state<BridgeStatus>('idle')
  error = $state<string | null>(null)
  result = $state<string | null>(null)

  constructor(factory: () => Worker) {
    this.factory = factory
  }

  run(request: WorkerRequest): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    this.status = 'running'
    this.error = null

    const worker = this.factory()
    this.worker = worker

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, svg, error } = e.data
      if (type === 'result' && svg) {
        this.result = svg
        this.status = 'done'
        this.worker = null
        worker.terminate()
      } else if (type === 'error') {
        this.error = error ?? 'Error desconocido'
        this.status = 'error'
        this.worker = null
        worker.terminate()
      }
    }

    worker.onerror = (e: ErrorEvent) => {
      this.error = e.message
      this.status = 'error'
      this.worker = null
      worker.terminate()
    }

    // Extraemos los transferables del request
    const transferList: Transferable[] = []
    if (request.transferables?.image) transferList.push(request.transferables.image)
    if (request.transferables?.element) transferList.push(request.transferables.element)

    worker.postMessage(request, transferList)
  }

  cancel(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.status = 'idle'
  }

  destroy(): void {
    this.cancel()
  }
}

const CONTEXT_KEY = Symbol('workerBridge')

import { getContext, setContext } from 'svelte'

export function createWorkerBridge(factory: () => Worker): WorkerBridge {
  const bridge = new WorkerBridge(factory)
  setContext(CONTEXT_KEY, bridge)
  return bridge
}

export function useWorkerBridge(): WorkerBridge {
  const bridge = getContext<WorkerBridge>(CONTEXT_KEY)
  if (!bridge) throw new Error('useWorkerBridge() debe usarse dentro de una herramienta')
  return bridge
}

export function setWorkerBridge(bridge: WorkerBridge): void {
  setContext(CONTEXT_KEY, bridge)
}