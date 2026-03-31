<script lang="ts">
	import { page } from '$app/stores';
	import { getTool } from '$lib/registry';
	import Titlebar from '$lib/components/shell/Titlebar.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import Canvas from '$lib/components/shell/Canvas.svelte';
	import Inspector from '$lib/components/shell/Inspector.svelte';

	const slug = $derived($page.params.slug);
	const tool = $derived(getTool(slug));
</script>

{#if tool}
	<div class="flex h-full flex-col">
		<Titlebar {tool} />
		<div class="flex flex-1 overflow-hidden">
			<Sidebar activeslug={slug} />
			<Canvas />
			<Inspector {tool} />
		</div>
	</div>
{/if}
