<script lang="ts">
	import type { ToolMeta, ToolParams } from '$lib/types/tool';
	import { Slider } from '$lib/components/ui/slider';
	import { Separator } from '$lib/components/ui/separator';

	let { tool }: { tool: ToolMeta } = $props();

	let params: ToolParams = $state({});

	$effect(() => {
		params = Object.fromEntries(tool.params.map((p) => [p.key, p.default]));
	});

	const groups = $derived([...new Set(tool.params.map((p) => p.group ?? 'General'))]);

	let hasPending = $state(false);

	function onParamChange() {
		hasPending = true;
	}
	function onGenerate() {
		hasPending = false;
	}
	function onReset() {
		params = Object.fromEntries(tool.params.map((p) => [p.key, p.default]));
		hasPending = false;
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
									{params[param.key]}{param.unit ?? ''}
								</span>
							</div>
							<Slider
								type="single"
								min={param.min}
								max={param.max}
								step={param.step}
								value={params[param.key] as number}
								onValueChange={(v) => {
									params[param.key] = v;
									onParamChange();
								}}
							/>
						{:else if param.type === 'color'}
							<div class="mb-1.5">
								<span class="text-xs text-muted-foreground">{param.label}</span>
							</div>
							<div class="flex items-center gap-2">
								<div
									class="h-6 w-6 shrink-0 cursor-pointer rounded border"
									style="background: {params[param.key]}"
								></div>
								<input
									type="text"
									class="w-full rounded border bg-muted px-2 py-1 font-mono text-xs outline-none focus:border-ring"
									value={params[param.key]}
									oninput={(e) => {
										params[param.key] = e.currentTarget.value;
										onParamChange();
									}}
								/>
							</div>
						{:else if param.type === 'upload'}
							<div class="mb-1.5">
								<span class="text-xs text-muted-foreground">{param.label}</span>
							</div>
							<div
								class="cursor-pointer rounded-md border border-dashed p-3 text-center transition-colors hover:bg-accent"
							>
								<p class="text-[11px] text-muted-foreground">
									Arrastra o haz clic<br /><span class="text-foreground">PNG, JPG, SVG</span>
								</p>
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
			onclick={onReset}
		>
			Resetear
		</button>
		<button
			class="flex-1 rounded-md px-3 py-1.5 text-xs transition-colors
        {hasPending
				? 'bg-foreground text-background hover:opacity-90'
				: 'border bg-foreground text-background hover:opacity-90'}"
			onclick={onGenerate}
		>
			Generar
		</button>
	</div>
</aside>
