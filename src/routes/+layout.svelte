<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />

<div class="h-screen w-screen overflow-hidden bg-background text-foreground">
	{@render children()}
</div>
