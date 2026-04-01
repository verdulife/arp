<script lang="ts">
	import { resolve } from '$app/paths';
	import { registry, families } from '$lib/registry';
	import { mode, setMode } from 'mode-watcher';

	let { activeslug }: { activeslug: string } = $props();

	const familyColors: Record<string, string> = {
		Densidad: 'bg-violet-100 dark:bg-violet-950',
		'Ruido y campo': 'bg-emerald-100 dark:bg-emerald-950',
		Líneas: 'bg-amber-100 dark:bg-amber-950',
		Tipografía: 'bg-rose-100 dark:bg-rose-950',
		Física: 'bg-sky-100 dark:bg-sky-950',
		'3D e isometría': 'bg-pink-100 dark:bg-pink-950'
	};

	const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
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
		{#each families as family (family)}
			{@const tools = registry.filter((t) => t.family === family)}
			<div class="mb-1">
				<p
					class="px-3 py-1.5 text-[10px] font-medium tracking-widest text-muted-foreground uppercase"
				>
					{family}
				</p>
				{#each tools as tool (tool.slug)}
					<a
						href={resolve(`/tools/${tool.slug}`)}
						class="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-accent
    {activeslug === tool.slug
							? 'border-l-2 border-foreground bg-accent'
							: 'border-l-2 border-transparent'}"
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
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<div class="border-t p-3">
		<div class="flex items-center justify-between rounded-md border bg-muted p-1">
			{#each modes as m (m)}
				<button
					class="flex flex-1 items-center justify-center rounded py-1 text-xs transition-colors
            {mode.current === m
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'}"
					onclick={() => setMode(m)}
				>
					{#if m === 'light'}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="4" /><path
								d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
							/>
						</svg>
					{:else if m === 'dark'}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
						</svg>
					{:else}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10" /><path
								d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
							/>
						</svg>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</aside>
