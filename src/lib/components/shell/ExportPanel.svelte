<script lang="ts">
	import type { ExportOptions } from '$lib/types/tool';
	import { svgToCanvas, canvasToPngWithDpi, downloadBlob, buildFilename } from '$lib/utils/export';
	import * as Dialog from '$lib/components/ui/dialog';
	import { getCanvasSize, formatDisplay, mmToPx, toMm } from '$lib/utils/resolution';
	import { useToolState } from '$lib/state/toolState.svelte';
	import { useWorkerBridge } from '$lib/workers/bridge.svelte';

	let { open = $bindable(), supportsSvg = false }: { open: boolean; supportsSvg: boolean } =
		$props();

	const bridge = useWorkerBridge();
	const toolState = useToolState();

	let exporting = $state(false);

	type FitMode = 'contain' | 'cover';

	const presets = [
		{ label: 'Original', width: 0, height: 0 },
		{ label: 'A4', width: 210, height: 297 },
		{ label: 'A3', width: 297, height: 420 },
		{ label: '20×20', width: 200, height: 200 },
		{ label: 'Custom', width: 0, height: 0 }
	];

	let selectedPreset = $state('Original');
	let fitMode = $state<FitMode>('contain');

	let options: ExportOptions = $state({
		format: 'png',
		dpi: 300,
		width: 210,
		height: 297,
		unit: 'mm'
	});

	// Dimensiones de la imagen subida en mm a 72dpi
	const imageUpload = $derived(toolState.uploads['image']);

	const imageMmWidth = $derived(imageUpload ? toMm(imageUpload.width, 'px', 72) : null);
	const imageMmHeight = $derived(imageUpload ? toMm(imageUpload.height, 'px', 72) : null);

	// Cuando cambia la imagen, resetear al preset Original
	$effect(() => {
		if (imageUpload && selectedPreset === 'Original') {
			options.width = imageMmWidth ?? 210;
			options.height = imageMmHeight ?? 297;
		}
	});

	// Calcula el tamaño final en px según preset y fitMode
	const finalSize = $derived.by(() => {
		if (selectedPreset === 'Original' || selectedPreset === 'Custom') {
			return {
				width: mmToPx(options.width, options.dpi),
				height: mmToPx(options.height, options.dpi)
			};
		}

		if (!imageMmWidth || !imageMmHeight) {
			return getCanvasSize(options);
		}

		const imgRatio = imageMmWidth / imageMmHeight;
		const presetRatio = options.width / options.height;

		if (fitMode === 'contain') {
			if (imgRatio > presetRatio) {
				// imagen más ancha — ajustar por ancho
				const h = options.width / imgRatio;
				return {
					width: mmToPx(options.width, options.dpi),
					height: mmToPx(h, options.dpi)
				};
			} else {
				// imagen más alta — ajustar por alto
				const w = options.height * imgRatio;
				return {
					width: mmToPx(w, options.dpi),
					height: mmToPx(options.height, options.dpi)
				};
			}
		} else {
			// cover — rellena el formato completo
			return {
				width: mmToPx(options.width, options.dpi),
				height: mmToPx(options.height, options.dpi)
			};
		}
	});

	function selectPreset(preset: (typeof presets)[0]) {
		selectedPreset = preset.label;
		if (preset.label === 'Original') {
			options.width = imageMmWidth ?? 210;
			options.height = imageMmHeight ?? 297;
		} else if (preset.label !== 'Custom') {
			options.width = preset.width;
			options.height = preset.height;
		}
	}

	async function handleExport() {
		if (!bridge.result) return;
		exporting = true;

		try {
			if (options.format === 'svg') {
				const blob = new Blob([bridge.result], { type: 'image/svg+xml;charset=utf-8' });
				downloadBlob(blob, buildFilename(toolState.slug, toolState.seed, options.dpi, 'svg'));
			} else {
				const canvas = await svgToCanvas(bridge.result, finalSize.width, finalSize.height);
				const blob = await canvasToPngWithDpi(canvas, options.dpi);
				downloadBlob(blob, buildFilename(toolState.slug, toolState.seed, options.dpi, 'png'));
			}
		} catch (err) {
			console.error('Error al exportar:', err);
		} finally {
			exporting = false;
			open = false;
		}
	}

	const showFitMode = $derived(selectedPreset !== 'Original' && selectedPreset !== 'Custom');
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
								: 'text-muted-foreground hover:bg-accent'}
                {preset.label === 'Original' && !imageUpload
								? 'pointer-events-none opacity-40'
								: ''}"
							onclick={() => selectPreset(preset)}
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>

			{#if supportsSvg}
				<div>
					<p class="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
						Formato
					</p>
					<div class="flex gap-2">
						{#each ['png', 'svg'] as const as fmt (fmt)}
							<button
								class="flex-1 rounded-md border py-1.5 text-xs uppercase transition-colors
            {options.format === fmt
									? 'border-foreground bg-foreground text-background'
									: 'text-muted-foreground hover:bg-accent'}"
								onclick={() => (options.format = fmt)}
							>
								{fmt}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if showFitMode}
				<div>
					<p class="mb-2 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
						Ajuste
					</p>
					<div class="flex gap-2">
						{#each ['contain', 'cover'] as FitMode[] as mode (mode)}
							<button
								class="flex-1 rounded-md border py-1.5 text-xs transition-colors
                  {fitMode === mode
									? 'border-foreground bg-foreground text-background'
									: 'text-muted-foreground hover:bg-accent'}"
								onclick={() => (fitMode = mode)}
							>
								{mode}
							</button>
						{/each}
					</div>
				</div>
			{/if}

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

			{#if options.format === 'png'}
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
			{/if}

			<div class="space-y-1 rounded-md bg-muted px-3 py-2">
				{#if options.format === 'png'}
					<p class="font-mono text-[11px] text-muted-foreground">
						{finalSize.width} × {finalSize.height} px — PNG
					</p>
					{#if imageUpload}
						<p class="font-mono text-[11px] text-muted-foreground">
							{formatDisplay(options.width, options.unit, options.dpi)} × {formatDisplay(
								options.height,
								options.unit,
								options.dpi
							)}
						</p>
					{/if}
				{:else}
					<p class="font-mono text-[11px] text-muted-foreground">
						{bridge.resultWidth} × {bridge.resultHeight} px — SVG vectorial
					</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<button
				class="w-full rounded-md bg-foreground py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-40"
				onclick={handleExport}
				disabled={exporting || !bridge.result}
			>
				{exporting ? 'Exportando...' : `Exportar ${options.format.toUpperCase()}`}
			</button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
