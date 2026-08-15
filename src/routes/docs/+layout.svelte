<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Nav from '$lib/docs/Nav.svelte';
	import { site, docSections } from '$lib/docs/content';
	import Toc from '$lib/docs/Toc.svelte';
	import '$lib/styles/docsshell.sass';
	import type { DocsTocItem } from '$lib/docs/content';

	// No Acrolls components and no Acrolls CSS are imported anywhere in this surface.
	// Acrolls is used purely as the content engine; this shell is ours.
	let { children }: { children: Snippet } = $props();
	let tocItems = $state<DocsTocItem[]>([]);
	// Sidebar only on actual document pages. The /docs index and the derived section
	// pages are browse surfaces and get the full width. `kind` comes from the catch-all
	// route's load; the /docs index has no load, so it is undefined there — which is the
	// wanted result.
	const showSidebar = $derived((page.data as { kind?: string }).kind === 'document');

	// Browse surfaces get the full width with no shell wrapper: the /docs index, every
	// section landing page (/docs/history, /docs/writings, …), and the tag browse pages
	// (/docs/tags and /docs/tags/<tag>).
	const sectionLandings = new Set(docSections.map((s) => s.href));
	const isBrowseSurface = $derived(
		page.url.pathname === '/docs' ||
			page.url.pathname === '/docs/tags' ||
			page.url.pathname.startsWith('/docs/tags/') ||
			sectionLandings.has(page.url.pathname)
	);
</script>

{#if isBrowseSurface}
	{@render children()}
{:else}
	<div class="appbody" class:has-sidebar={showSidebar}>
		{#if showSidebar}
			<aside class="sidebarleft box gap16">
				<Nav pathname={page.url.pathname} />
			</aside>
		{/if}
		{@render children()}
	</div>
{/if}
