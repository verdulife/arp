<script lang="ts">
	import type { ToolMeta, WorkerRequest } from '$lib/types/tool';
	import { useToolState } from '$lib/state/toolState.svelte';
	import { useWorkerBridge } from '$lib/workers/bridge.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { Separator } from '$lib/components/ui/separator';

	let { tool }: { tool: ToolMeta } = $props();

	const toolState = useToolState();
	const bridge = useWorkerBridge();
	const groups = $derived([...new Set(tool.params.map((p) => p.group ?? 'General'))]);

	async function handleUpload(key: string, file: File) {
		await toolState.setUpload(key, file);
	}

	async function generate() {
		toolState.generate();

		const transferables: WorkerRequest['transferables'] = {};
		const transferList: Transferable[] = [];

		if (toolState.uploads['image']) {
			const bitmap = await createImageBitmap(toolState.uploads['image'].file);
			transferables.image = bitmap;
			transferList.push(bitmap);
		}

		if (toolState.uploads['element']) {
			const bitmap = await createImageBitmap(toolState.uploads['element'].file);
			transferables.element = bitmap;
			transferList.push(bitmap);
		}

		bridge.run({
			mode: 'preview',
			params: JSON.parse(JSON.stringify(toolState.params)),
			seed: toolState.seed,
			transferables
		});
	}
</script>

<aside class="flex w-60 shrink-0 flex-col overflow-hidden border-l bg-background">
	<div class="flex items-center justify-between border-b px-3 py-2.5">
		<span class="text-xs font-medium">Parámetros</span>
	</div>

	<div class="flex-1 overflow-y-auto p-3">
		{#each groups as group (group)}
			<div class="mb-4">
				<p class="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
					{group}
				</p>

				{#each tool.params.filter((p) => (p.group ?? 'General') === group) as param (param.key)}
					<div class="mb-3">
						{#if param.type === 'slider'}
							<div class="mb-1.5 flex justify-between">
								<span class="text-xs text-muted-foreground">{param.label}</span>
								<span class="font-mono text-[10px] text-muted-foreground">
									{toolState.params[param.key]}{param.unit ?? ''}
								</span>
							</div>
							<Slider
								type="single"
								min={param.min}
								max={param.max}
								step={param.step}
								value={toolState.params[param.key] as number}
								onValueChange={(v) => toolState.setParam(param.key, v)}
							/>
						{:else if param.type === 'color'}
							<div class="mb-1.5">
								<span class="text-xs text-muted-foreground">{param.label}</span>
							</div>
							<div class="flex items-center gap-2">
								<div
									class="h-6 w-6 shrink-0 cursor-pointer rounded border"
									style="background: {toolState.params[param.key]}"
								></div>
								<input
									type="text"
									class="w-full rounded border bg-muted px-2 py-1 font-mono text-xs outline-none focus:border-ring"
									value={toolState.params[param.key]}
									oninput={(e) => toolState.setParam(param.key, e.currentTarget.value)}
								/>
							</div>
						{:else if param.type === 'upload'}
							<div class="mb-1.5">
								<span class="text-xs text-muted-foreground">{param.label}</span>
							</div>
							<div
								class="cursor-pointer rounded-md border border-dashed p-3 text-center transition-colors hover:bg-accent
    {toolState.uploads[param.key] ? 'border-foreground' : 'border-border'}"
								role="button"
								tabindex="0"
								ondragover={(e) => e.preventDefault()}
								ondrop={(e) => {
									e.preventDefault();
									const file = e.dataTransfer?.files[0];
									if (file) handleUpload(param.key, file);
								}}
								onclick={() => {
									const input = document.createElement('input');
									input.type = 'file';
									input.accept = 'image/png,image/jpeg,image/svg+xml';
									input.onchange = () => {
										const file = input.files?.[0];
										if (file) handleUpload(param.key, file);
									};
									input.click();
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click();
								}}
							>
								{#if toolState.uploads[param.key]}
									<p class="truncate text-[11px] font-medium text-foreground">
										{toolState.uploads[param.key].name}
									</p>
								{:else}
									<p class="text-[11px] text-muted-foreground">
										Arrastra o haz clic<br /><span class="text-foreground">PNG, JPG, SVG</span>
									</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<Separator class="mb-4" />
		{/each}
	</div>

	<div class="flex gap-2 border-t p-3">
		<button
			class="flex-1 rounded-md border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
			onclick={() => toolState.reset()}
		>
			Resetear
		</button>
		<button
			class="flex-1 rounded-md px-3 py-1.5 text-xs transition-colors
    {toolState.hasPending
				? 'bg-foreground text-background hover:opacity-90'
				: 'border bg-foreground text-background hover:opacity-90'}"
			onclick={generate}
		>
			{bridge.status === 'running' ? 'Calculando...' : 'Generar'}
		</button>
	</div>
</aside>
