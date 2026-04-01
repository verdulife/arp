<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { ExportOptions } from '$lib/types/tool';

	let { open = $bindable() }: { open: boolean } = $props();

	const presets = [
		{ label: 'A4', width: 210, height: 297 },
		{ label: 'A3', width: 297, height: 420 },
		{ label: '20×20', width: 200, height: 200 },
		{ label: 'Custom', width: 0, height: 0 }
	];

	let selectedPreset = $state('A4');
	let options: ExportOptions = $state({
		format: 'png',
		dpi: 300,
		width: 210,
		height: 297,
		unit: 'mm'
	});

	const pxWidth = $derived(Math.round((options.width / 25.4) * options.dpi));
	const pxHeight = $derived(Math.round((options.height / 25.4) * options.dpi));

	function selectPreset(preset: (typeof presets)[0]) {
		selectedPreset = preset.label;
		if (preset.label !== 'Custom') {
			options.width = preset.width;
			options.height = preset.height;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Exportar</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4 py-2">
			<div>
				<p class="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
					Tamaño
				</p>
				<div class="flex gap-2">
					{#each presets as preset (preset.label)}
						<button
							class="flex-1 rounded-md border py-1.5 text-xs transition-colors
                {selectedPreset === preset.label
								? 'border-foreground bg-foreground text-background'
								: 'text-muted-foreground hover:bg-accent'}"
							onclick={() => selectPreset(preset)}
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>

			{#if selectedPreset === 'Custom'}
				<div class="flex gap-2">
					<div class="flex-1">
						<p class="mb-1 text-xs text-muted-foreground">Ancho (mm)</p>
						<input
							type="number"
							bind:value={options.width}
							class="w-full rounded border bg-muted px-2 py-1 text-xs outline-none focus:border-ring"
						/>
					</div>
					<div class="flex-1">
						<p class="mb-1 text-xs text-muted-foreground">Alto (mm)</p>
						<input
							type="number"
							bind:value={options.height}
							class="w-full rounded border bg-muted px-2 py-1 text-xs outline-none focus:border-ring"
						/>
					</div>
				</div>
			{/if}

			<div>
				<div class="mb-2 flex justify-between">
					<p class="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
						Resolución
					</p>
					<span class="font-mono text-[10px] text-muted-foreground">{options.dpi} dpi</span>
				</div>
				<div class="flex gap-2">
					{#each [72, 150, 300] as dpi (dpi)}
						<button
							class="flex-1 rounded-md border py-1.5 text-xs transition-colors
                {options.dpi === dpi
								? 'border-foreground bg-foreground text-background'
								: 'text-muted-foreground hover:bg-accent'}"
							onclick={() => (options.dpi = dpi as 72 | 150 | 300)}
						>
							{dpi}
						</button>
					{/each}
				</div>
			</div>

			<div class="rounded-md bg-muted px-3 py-2">
				<p class="font-mono text-[11px] text-muted-foreground">
					{pxWidth} × {pxHeight} px — PNG
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<button
				class="w-full rounded-md bg-foreground py-2 text-sm text-background transition-opacity hover:opacity-90"
				onclick={() => (open = false)}
			>
				Exportar PNG
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
