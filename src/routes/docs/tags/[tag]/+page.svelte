<script lang="ts">
	import { page } from '$app/state';
	import { SeoGeoOptimizer } from 'quartzo';
	import TagPage from '$lib/docs/TagPage.svelte';

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
	breadcrumbs={data.seo.breadcrumbs}
/>

<TagPage tag={data.tag} pathname={page.url.pathname} />
