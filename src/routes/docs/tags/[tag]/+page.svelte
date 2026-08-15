<script lang="ts">
	import { SeoGeoOptimizer } from 'quartzo';
	import { docTags, pagesForTag } from '$lib/docs/content';

	let { data } = $props();

	const items = $derived(pagesForTag(data.tag));

	// The tag routes live outside Acrolls' nav, so build the trail by hand to match the
	// section page's breadcrumb: Docs | Tags | <tag>.
	const trail = $derived([
		{ label: 'Docs', href: '/docs' },
		{ label: 'Tags', href: '/docs/tags' },
		{ label: data.tag }
	]);
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
	<h1 class="text2xl w500">{data.tag}</h1>
	<!-- Same `.card` primitive and grid as the section pages — tag pages are just another
	     browse surface over the corpus. -->
	<div class="grid grid-cols-auto gap16">
		{#each items as item (item.id)}
			{@const tags = docTags(item.href)}
			<a class="card blank box gap8" href={item.href}>
				<span class="text-lg card-title">{item.title}</span>
				<span class="text-md text-muted">{item.description}</span>
				{#if tags.length}
					<div class="row wrap gap4">
						{#each tags as t}
							<span class="badge">{t}</span>
						{/each}
					</div>
				{/if}
			</a>
		{/each}
	</div>
</div>
