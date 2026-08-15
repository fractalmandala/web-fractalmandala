<script lang="ts">
	import { SeoGeoOptimizer } from 'quartzo';
	import { allTags } from '$lib/docs/content';

	let { data } = $props();
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

<SeoGeoOptimizer
	title={data.seo.title}
	description={data.seo.description}
	url={data.seo.url}
	siteUrl={data.seo.siteUrl}
	siteName={data.seo.siteName}
	image={data.seo.image}
	imageAlt={data.seo.imageAlt}
	type={data.seo.type}
	language={data.seo.language}
	locale={data.seo.locale}
	breadcrumbs={data.seo.breadcrumbs}
/>

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
				<span class="text-bs card-title">{tag}</span>
				<span class="text-sm text-muted">
					{count}
				</span>
			</a>
		{/each}
	</div>
</div>
