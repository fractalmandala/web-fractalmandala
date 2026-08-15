<script lang="ts">
	import { allTags } from './content';

	// allTags() is already alphabetical; keep that as the base and re-sort a copy for the
	// count view so the original order is untouched.
	const tags = allTags();

	type SortMode = 'alpha' | 'count';
	let sortMode = $state<SortMode>('alpha');

	const sortedTags = $derived(
		sortMode === 'count'
			? // Most documents first; ties fall back to alphabetical.
				[...tags].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
			: tags
	);

	const trail = [{ label: 'Docs', href: '/docs' }, { label: 'Tags' }];
</script>

<div class="pagebox">
	<nav aria-label="Breadcrumb" class="fa-breadcrumb">
		{#each trail as crumb, i (crumb.label + i)}
			{#if i > 0}<div class="spacer">|</div>{/if}
			{#if crumb.href}
				<a href={crumb.href}>{crumb.label}</a>
			{:else}
				<span>{crumb.label}</span>
			{/if}
		{/each}
	</nav>
	<h1 class="text2xl w500">Tags</h1>
	<div class="fs-tabs" role="tablist" aria-label="Sort tags">
		<button
			type="button"
			role="tab"
			aria-selected={sortMode === 'alpha'}
			class="button-tab"
			class:active={sortMode === 'alpha'}
			onclick={() => (sortMode = 'alpha')}
		>
			Alphabetical
		</button>
		<button
			type="button"
			role="tab"
			aria-selected={sortMode === 'count'}
			class="button-tab"
			class:active={sortMode === 'count'}
			onclick={() => (sortMode = 'count')}
		>
			Most documents
		</button>
	</div>
	<!-- Same `.card` primitive and grid as the section pages. Each card is one tag; the
	     muted line is its document count. -->
	<div class="grid grid-cols-auto gap16">
		{#each sortedTags as { tag, href, count } (tag)}
			<a class="card blank box gap8" {href}>
				<span class="text-lg card-title">{tag}</span>
				<span class="text-md text-muted">
					{count} {count === 1 ? 'document' : 'documents'}
				</span>
			</a>
		{/each}
	</div>
</div>
