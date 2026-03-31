<script lang="ts">
	let scale = $state(1);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let isPanning = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	function onwheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		scale = Math.min(Math.max(scale * delta, 0.1), 8);
	}

	function onmousedown(e: MouseEvent) {
		if (e.button === 1 || (e.button === 0 && e.altKey)) {
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

	const zoomPercent = $derived(Math.round(scale * 100));
</script>

<div
	class="relative flex-1 overflow-hidden bg-[#f8f8f7] dark:bg-[#111110]"
	style="cursor: {isPanning ? 'grabbing' : 'default'}"
	role="region"
	aria-label="Canvas"
	{onwheel}
	{onmousedown}
	{onmousemove}
	{onmouseup}
>
	<div
		class="absolute inset-0"
		style="
      background-image: radial-gradient(circle, color-mix(in srgb, currentColor 15%, transparent) 1px, transparent 1px);
      background-size: 24px 24px;
    "
	/>

	<div
		class="absolute top-1/2 left-1/2"
		style="transform: translate(calc(-50% + {offsetX}px), calc(-50% + {offsetY}px)) scale({scale})"
	>
		<canvas
			id="arp-canvas"
			width={800}
			height={640}
			class="rounded-sm border bg-white shadow-sm dark:bg-zinc-950"
		/>
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
