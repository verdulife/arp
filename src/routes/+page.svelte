<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { registry } from '$lib/registry';

	onMount(() => goto(`/tools/${registry[0].slug}`, { replaceState: true }));
</script>
