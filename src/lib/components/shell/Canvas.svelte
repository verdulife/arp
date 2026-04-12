<script lang="ts">
	import { useWorkerBridge } from '$lib/workers/bridge.svelte';

	let scale = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let isPanning = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	const bridge = useWorkerBridge();
	let canvasEl = $state<HTMLCanvasElement | null>(null);

	const canvasWidth = $derived(bridge.resultWidth);
	const canvasHeight = $derived(bridge.resultHeight);

	const dpr = window.devicePixelRatio ?? 1;
	const MAX_BITMAP_SIZE = 4096;
	const INITIAL_SCALE_FACTOR = 4;

	let cachedBitmap: ImageBitmap | null = null;
	let cachedBitmapScale = 1; // el factor al que fue renderizado el bitmap
	let zoomDebounce: ReturnType<typeof setTimeout> | null = null;
	let idleCallback: number | null = null;

	function getBitmapScale(targetScale: number): number {
		const factor = Math.max(targetScale, 1) * INITIAL_SCALE_FACTOR * dpr;
		const maxFactor = Math.min(MAX_BITMAP_SIZE / canvasWidth, MAX_BITMAP_SIZE / canvasHeight);
		return Math.min(factor, maxFactor);
	}

	async function createBitmapFromSVG(svg: string, bitmapScale: number): Promise<ImageBitmap> {
		const w = Math.round(canvasWidth * bitmapScale);
		const h = Math.round(canvasHeight * bitmapScale);

		const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.width = w;
		img.height = h;
		img.src = url;

		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('Error al cargar SVG'));
		});

		URL.revokeObjectURL(url);
		const bitmap = await createImageBitmap(img, { resizeWidth: w, resizeHeight: h });
		return bitmap;
	}

	function paintBitmap(bitmap: ImageBitmap, targetWidth: number, targetHeight: number) {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const physicalWidth = Math.round(targetWidth * dpr);
		const physicalHeight = Math.round(targetHeight * dpr);

		canvasEl.width = physicalWidth;
		canvasEl.height = physicalHeight;
		canvasEl.style.width = `${targetWidth}px`;
		canvasEl.style.height = `${targetHeight}px`;

		ctx.clearRect(0, 0, physicalWidth, physicalHeight);
		ctx.drawImage(bitmap, 0, 0, physicalWidth, physicalHeight);
	}

	async function renderAtScale(svg: string, targetScale: number) {
		const bitmapScale = getBitmapScale(targetScale);
		if (cachedBitmap) {
			cachedBitmap.close();
			cachedBitmap = null;
		}
		const bitmap = await createBitmapFromSVG(svg, bitmapScale);
		cachedBitmap = bitmap;
		cachedBitmapScale = bitmapScale;
		paintBitmap(bitmap, canvasWidth * targetScale, canvasHeight * targetScale);
	}

	// Nuevo resultado del worker — renderiza a x4 (o el máximo permitido)
	$effect(() => {
		if (bridge.status === 'done' && bridge.result) {
			const svg = bridge.result;
			renderAtScale(svg, INITIAL_SCALE_FACTOR);
		}
	});

	$effect(() => {
		void scale;

		if (!cachedBitmap || !bridge.result) return;

		// Repintado inmediato con bitmap existente
		paintBitmap(cachedBitmap, canvasWidth * scale, canvasHeight * scale);

		// Cancela cualquier re-render pendiente
		if (zoomDebounce) clearTimeout(zoomDebounce);
		if (idleCallback) cancelIdleCallback(idleCallback);

		// Re-render solo cuando el browser esté libre Y hayan pasado 300ms sin scroll
		zoomDebounce = setTimeout(() => {
			idleCallback = requestIdleCallback(
				async () => {
					if (bridge.result) {
						await renderAtScale(bridge.result, scale);
					}
				},
				{ timeout: 1000 }
			);
		}, 300);
	});

	function onwheel(e: WheelEvent) {
		e.preventDefault();
		if (zoomDebounce) clearTimeout(zoomDebounce);
		if (idleCallback) cancelIdleCallback(idleCallback);
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		scale = Math.min(Math.max(scale * delta, 0.1), 8);
	}

	function onmousedown(e: MouseEvent) {
		if (e.button === 1 || (e.button === 0 && (e.altKey || spaceDown))) {
			isPanning = true;
			lastX = e.clientX;
			lastY = e.clientY;
		}
	}

	function onmousemove(e: MouseEvent) {
		if (!isPanning) return;
		offsetX += e.clientX - lastX;
		offsetY += e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
	}

	function onmouseup() {
		isPanning = false;
	}

	function resetView() {
		scale = 1;
		offsetX = 0;
		offsetY = 0;
	}

	let spaceDown = $state(false);

	function onkeydown(e: KeyboardEvent) {
		if (e.code === 'Space') {
			e.preventDefault();
			spaceDown = true;
		}
	}

	function onkeyup(e: KeyboardEvent) {
		if (e.code === 'Space') {
			spaceDown = false;
		}
	}

	const zoomPercent = $derived(Math.round(scale * 100));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="relative flex-1 overflow-hidden bg-[#f8f8f7] dark:bg-[#111110]"
	style="cursor: {isPanning ? 'grabbing' : spaceDown ? 'grab' : 'default'}"
	role="application"
	aria-label="Canvas de Arp"
	tabindex="0"
	{onwheel}
	{onmousedown}
	{onmousemove}
	{onmouseup}
	{onkeydown}
	{onkeyup}
>
	<div
		class="absolute inset-0"
		style="
      background-image: radial-gradient(circle, color-mix(in srgb, currentColor 15%, transparent) 1px, transparent 1px);
      background-size: 24px 24px;
    "
	></div>

	<div
		class="absolute top-1/2 left-1/2"
		style="transform: translate(calc(-50% + {offsetX}px), calc(-50% + {offsetY}px))"
	>
		<canvas
			bind:this={canvasEl}
			width={canvasWidth}
			height={canvasHeight}
			class="rounded-sm border bg-white shadow-sm dark:bg-zinc-950"
		></canvas>

		{#if bridge.status === 'running'}
			<div class="absolute inset-0 flex items-center justify-center rounded-sm bg-background/50">
				<span class="text-xs text-muted-foreground">Generando...</span>
			</div>
		{/if}
	</div>

	<div
		class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center overflow-hidden rounded-md border bg-background text-xs"
	>
		<button
			class="px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
			onclick={() => (scale = Math.max(scale * 0.9, 0.1))}>−</button
		>
		<button
			class="border-x px-3 py-1.5 font-mono text-muted-foreground transition-colors hover:bg-accent"
			onclick={resetView}>{zoomPercent}%</button
		>
		<button
			class="px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent"
			onclick={() => (scale = Math.min(scale * 1.1, 8))}>+</button
		>
	</div>
</div>
