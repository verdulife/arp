<script lang="ts">
	import type { ToolMeta, ToolModule } from '$lib/types/tool';
	import { useToolState } from '$lib/state/toolState.svelte';
	import ExportPanel from './ExportPanel.svelte';

	let { tool, toolModule }: { tool: ToolMeta; toolModule: ToolModule | null } = $props();
	const toolState = useToolState();
	let exportOpen = $state(false);

	const supportsSvg = $derived(toolModule?.supportsSvg ?? false);
</script>

<header class="flex h-10 shrink-0 items-center gap-3 border-b bg-background px-4">
	<div class="flex h-5 w-5 items-center justify-center rounded bg-foreground">
		<span class="text-[10px] font-medium text-background">A</span>
	</div>

	<div class="h-4 w-px bg-border"></div>

	<nav class="flex items-center gap-2 text-sm">
		<span class="text-muted-foreground">{tool.family}</span>
		<span class="text-muted-foreground/40">›</span>
		<span class="font-medium">{tool.name}</span>
	</nav>

	<div class="ml-auto flex items-center gap-2">
		<button
			class="rounded-full border px-3 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border hover:text-foreground"
			onclick={() => toolState.regenerateSeed()}
		>
			seed: {toolState.seed}
		</button>

		<div class="h-4 w-px bg-border"></div>

		<button
			class="rounded-md border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent"
			onclick={() => (exportOpen = true)}
		>
			Exportar
		</button>
	</div>
</header>

<ExportPanel bind:open={exportOpen} {supportsSvg} />
