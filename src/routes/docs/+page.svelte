<script lang="ts">
	import { SeoGeoOptimizer } from 'quartzo';
	import { sections, site, docs, docTags } from '$lib/docs/content';

	let { data } = $props();
	const total = docs.documents.length;

	// Default to the Writings section; fall back to the first section if it's missing.
	const defaultIndex = Math.max(
		0,
		sections.findIndex((section) => section.title === 'Writings')
	);
	let activeIndex = $state(defaultIndex);

	function onTabKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const dir = event.key === 'ArrowRight' ? 1 : -1;
		activeIndex = (activeIndex + dir + sections.length) % sections.length;
		document.getElementById(`tab-${activeIndex}`)?.focus();
	}
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
	<div class="fs-tabs" role="tablist" aria-label="Browse by section">
		{#each sections as section, i (section.id)}
			<button
				type="button"
				role="tab"
				id="tab-{i}"
				aria-selected={i === activeIndex}
				aria-controls="panel-{i}"
				tabindex={i === activeIndex ? 0 : -1}
				class="button-tab"
				class:active={i === activeIndex}
				onclick={() => (activeIndex = i)}
				onkeydown={onTabKeydown}
			>
				{section.title}
			</button>
		{/each}
	</div>
	<div
		id="panel-{activeIndex}"
		role="tabpanel"
		aria-labelledby="tab-{activeIndex}"
		class="grid grid-cols-auto gap16"
	>
		{#each sections[activeIndex].items as item (item.id)}
			{@const tags = docTags(item.href)}
			<a class="card blank box gap8" href={item.href}>
				<span class="text-lg card-title">{item.title}</span>
				<span class="text-md text-muted">{item.description}</span>
				{#if tags.length}
					<div class="row wrap gap4">
						{#each tags as tag}
							<span class="badge">{tag}</span>
						{/each}
					</div>
				{/if}
			</a>
		{/each}
	</div>
</div>
