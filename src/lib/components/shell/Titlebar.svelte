<script lang="ts">
	import type { ToolMeta } from '$lib/types/tool';
	import ExportPanel from './ExportPanel.svelte';

	let { tool }: { tool: ToolMeta } = $props();
	let exportOpen = $state(false);

	const seed = $state(Math.random().toString(36).slice(2, 8));
</script>

<header class="flex h-10 shrink-0 items-center gap-3 border-b bg-background px-4">
	<div class="flex h-5 w-5 items-center justify-center rounded bg-foreground">
		<span class="text-[10px] font-medium text-background">A</span>
	</div>

	<div class="h-4 w-px bg-border" />

	<nav class="flex items-center gap-2 text-sm">
		<span class="text-muted-foreground">{tool.family}</span>
		<span class="text-muted-foreground/40">›</span>
		<span class="font-medium">{tool.name}</span>
	</nav>

	<div class="ml-auto flex items-center gap-2">
		<button
			class="rounded-full border px-3 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
			onclick={() => {}}
		>
			seed: {seed}
		</button>

		<div class="h-4 w-px bg-border" />

		<button
			class="rounded-md border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
			onclick={() => (exportOpen = true)}
		>
			Exportar
		</button>
	</div>
</header>

<ExportPanel bind:open={exportOpen} />
