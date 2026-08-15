<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Nav from '$lib/docs/Nav.svelte';
	import { docSections } from '$lib/docs/content';
	import '$lib/styles/docsshell.sass';

	let { children }: { children: Snippet } = $props();

	// Sidebar only on actual document pages. The /docs index and the derived section
	// pages are browse surfaces and get the full width. `kind` comes from the catch-all
	// route's load.
	const showSidebar = $derived((page.data as { kind?: string }).kind === 'document');

	// Browse surfaces get full-width container layout: /docs, /docs/tags, /docs/tags/<tag>,
	// and section landing pages (/docs/writings, /docs/history, …).
	const sectionLandings = new Set(docSections.map((s) => s.href));
	const isBrowseSurface = $derived(
		page.url.pathname === '/docs' ||
			page.url.pathname === '/docs/tags' ||
			page.url.pathname.startsWith('/docs/tags/') ||
			sectionLandings.has(page.url.pathname)
	);
</script>

{#if isBrowseSurface}
	<div class="pagebox">
		{@render children()}
	</div>
{:else}
	<div class="blume-body" class:has-sidebar={showSidebar}>
		{#if showSidebar}
			<aside class="sidebar box gap16" data-pagefind-ignore>
				<Nav pathname={page.url.pathname} />
			</aside>
		{/if}
		{@render children()}
	</div>
{/if}
