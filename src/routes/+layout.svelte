<script lang="ts">
	import './layout.css';
	let { children } = $props();
</script>

<div class="h-screen w-screen overflow-hidden bg-background text-foreground">
	{@render children()}
</div>
