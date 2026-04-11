<script lang="ts">
	import { useToolState } from '$lib/state/toolState.svelte';

	const toolState = useToolState();

	let activeTab = $state<'svg' | 'char'>('svg');
	let charValue = $state('');
	let fontValue = $state('serif');

	const fonts = [
		{ label: 'Serif', value: 'serif' },
		{ label: 'Sans', value: 'sans-serif' },
		{ label: 'Mono', value: 'monospace' },
		{ label: 'Cursive', value: 'cursive' }
	];

	function handleSvgDrop(e: DragEvent) {
		e.preventDefault();
		const file = e.dataTransfer?.files[0];
		if (file && file.type === 'image/svg+xml') toolState.setElementSvg(file);
	}

	function handleSvgClick() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/svg+xml';
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) toolState.setElementSvg(file);
		};
		input.click();
	}

	function handleCharInput() {
		if (charValue.length > 0) {
			toolState.setElementChar(charValue, fontValue);
		} else {
			toolState.clearElement();
		}
	}
</script>

<div class="mb-3">
	<div class="mb-1.5 flex items-center justify-between">
		<span class="text-xs text-muted-foreground">Figura elemento</span>
		{#if toolState.element}
			<button
				class="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
				onclick={() => toolState.clearElement()}
			>
				Limpiar
			</button>
		{/if}
	</div>

	<div class="mb-2 flex overflow-hidden rounded-md border">
		<button
			class="flex-1 py-1 text-[11px] transition-colors
        {activeTab === 'svg'
				? 'bg-foreground text-background'
				: 'text-muted-foreground hover:bg-accent'}"
			onclick={() => (activeTab = 'svg')}
		>
			SVG
		</button>
		<button
			class="flex-1 border-l py-1 text-[11px] transition-colors
        {activeTab === 'char'
				? 'bg-foreground text-background'
				: 'text-muted-foreground hover:bg-accent'}"
			onclick={() => (activeTab = 'char')}
		>
			ABC
		</button>
	</div>

	{#if activeTab === 'svg'}
		<div
			class="cursor-pointer rounded-md border border-dashed p-3 text-center transition-colors hover:bg-accent
        {toolState.element?.type === 'svg' ? 'border-foreground' : 'border-border'}"
			role="button"
			tabindex="0"
			ondragover={(e) => e.preventDefault()}
			ondrop={handleSvgDrop}
			onclick={handleSvgClick}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleSvgClick();
			}}
		>
			{#if toolState.element?.type === 'svg'}
				<p class="truncate text-[11px] font-medium text-foreground">
					{toolState.element.name}
				</p>
			{:else}
				<p class="text-[11px] text-muted-foreground">
					Arrastra o haz clic<br /><span class="text-foreground">SVG</span>
				</p>
			{/if}
		</div>
	{:else}
		<div class="space-y-2">
			<input
				type="text"
				maxlength="2"
				placeholder="A"
				bind:value={charValue}
				oninput={handleCharInput}
				class="w-full rounded-md border bg-muted px-3 py-2 text-center text-2xl outline-none focus:border-ring"
				style="font-family: {fontValue}"
			/>
			<div class="flex gap-1">
				{#each fonts as font (font.value)}
					<button
						class="flex-1 rounded border py-1 text-[10px] transition-colors
              {fontValue === font.value
							? 'border-foreground bg-foreground text-background'
							: 'text-muted-foreground hover:bg-accent'}"
						style="font-family: {font.value}"
						onclick={() => {
							fontValue = font.value;
							handleCharInput();
						}}
					>
						{font.label}
					</button>
				{/each}
			</div>
			{#if toolState.element?.type === 'char'}
				<div
					class="flex h-12 items-center justify-center rounded-md border bg-muted"
					style="font-family: {toolState.element.font}; font-size: 28px"
				>
					{toolState.element.value}
				</div>
			{/if}
		</div>
	{/if}
</div>
