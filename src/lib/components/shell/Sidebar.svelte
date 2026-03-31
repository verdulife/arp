<script lang="ts">
	import { registry, families } from '$lib/registry';
	import { goto } from '$app/navigation';

	let { activeslug }: { activeslug: string } = $props();

	const familyColors: Record<string, string> = {
		Densidad: 'bg-violet-100 dark:bg-violet-950',
		'Ruido y campo': 'bg-emerald-100 dark:bg-emerald-950',
		Líneas: 'bg-amber-100 dark:bg-amber-950',
		Tipografía: 'bg-rose-100 dark:bg-rose-950',
		Física: 'bg-sky-100 dark:bg-sky-950',
		'3D e isometría': 'bg-pink-100 dark:bg-pink-950'
	};
</script>

<aside class="flex w-56 shrink-0 flex-col overflow-hidden border-r bg-background">
	<div class="border-b p-2">
		<input
			type="text"
			placeholder="Buscar..."
			class="w-full rounded-md border bg-muted px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
		/>
	</div>

	<nav class="flex-1 overflow-y-auto py-2">
		{#each families as family}
			{@const tools = registry.filter((t) => t.family === family)}
			<div class="mb-1">
				<p
					class="px-3 py-1.5 text-[10px] font-medium tracking-widest text-muted-foreground uppercase"
				>
					{family}
				</p>
				{#each tools as tool}
					<button
						class="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-accent
              {activeslug === tool.slug
							? 'border-l-2 border-foreground bg-accent'
							: 'border-l-2 border-transparent'}"
						onclick={() => goto(`/tools/${tool.slug}`)}
					>
						<div
							class="flex h-5 w-5 shrink-0 items-center justify-center rounded {familyColors[
								family
							] ?? 'bg-muted'}"
						></div>
						<span
							class="truncate text-xs {activeslug === tool.slug
								? 'font-medium text-foreground'
								: 'text-muted-foreground'}"
						>
							{tool.name}
						</span>
					</button>
				{/each}
			</div>
		{/each}
	</nav>
</aside>
