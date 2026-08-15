<script lang="ts">
	import { page } from '$app/state';
	import { SeoGeoOptimizer } from 'quartzo';
	import DocumentPage from '$lib/docs/DocumentPage.svelte';
	import SectionPage from '$lib/docs/SectionPage.svelte';

	let { data } = $props();
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
	tags={data.seo.tags}
	section={data.seo.section}
	publishedDate={data.seo.publishedDate}
	breadcrumbs={data.seo.breadcrumbs}
/>

{#if data.kind === 'section'}
	<SectionPage path={data.slug} pathname={page.url.pathname} />
{:else}
	<DocumentPage slug={data.slug} pathname={page.url.pathname} Article={data.component} />
{/if}
