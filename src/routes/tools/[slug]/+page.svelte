<script lang="ts">
	import type { PageData } from './$types';
	import { untrack } from 'svelte';
	import { createToolState, setToolState } from '$lib/state/toolState.svelte';
	import { createWorkerBridge, setWorkerBridge } from '$lib/workers/bridge.svelte';
	import Titlebar from '$lib/components/shell/Titlebar.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import Canvas from '$lib/components/shell/Canvas.svelte';
	import Inspector from '$lib/components/shell/Inspector.svelte';

	let { data }: { data: PageData } = $props();

	untrack(() => {
		const toolState = createToolState(data.tool.slug, data.urlParams);
		setToolState(toolState);

		if (data.toolModule) {
			const bridge = createWorkerBridge(data.toolModule.worker);
			setWorkerBridge(bridge);
		}
	});
</script>

<div class="flex h-full flex-col">
	<Titlebar tool={data.tool} />
	<div class="flex flex-1 overflow-hidden">
		<Sidebar activeslug={data.tool.slug} />
		<Canvas />
		<Inspector tool={data.tool} />
	</div>
</div>
