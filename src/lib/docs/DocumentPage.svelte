<script lang="ts">
	import { tick, type Component } from 'svelte';
	import Toc from './Toc.svelte';
	import type { DocsTocItem } from './content';
	import { crumbs, docTags, getDoc, pager, tagHref, tocFrom } from './content';
	import '$lib/styles/docstypography.sass';
	let { slug, pathname }: { slug: string; pathname: string } = $props();

	const doc = $derived(getDoc(slug));
	const tags = $derived(docTags(slug));
	const trail = $derived(crumbs(pathname));
	const links = $derived(pager(pathname));

	// Bound to the article element so the TOC can scan the rendered headings.
	let articleEl = $state<HTMLElement>();

	// Resolve the lazy component into state rather than awaiting inline.
	//
	// The TOC scans the rendered DOM, so it must run *after* the body exists. With an
	// inline {#await}, `articleEl` binds immediately while its content arrives later,
	// and nothing the TOC depends on changes at that moment — so it scans an empty
	// article. Tracking the resolved component gives the TOC something to key off.
	let Article = $state<Component | undefined>();
	let loadError = $state<string | undefined>();

	$effect(() => {
		const current = doc;
		Article = undefined;
		loadError = undefined;
		tocItems = [];
		if (!current) return;

		let cancelled = false;
		current
			.loader()
			.then((mod) => {
				if (!cancelled) Article = mod as Component;
			})
			.catch((e: unknown) => {
				if (!cancelled) loadError = e instanceof Error ? e.message : String(e);
			});
		return () => {
			cancelled = true;
		};
	});

	// Acrolls builds the TOC by scanning rendered headings, so wait for the body to be
	// in the DOM.
	//
	// Levels 2–3 only. This corpus has 804 h2 and 333 h3 used structurally, no h4 at
	// all, and 518 h5 used decoratively for pull-quotes — scanning h5 fills the TOC with
	// whole paragraphs. Documents that never used a real heading simply get no TOC,
	// which is the honest outcome.
	let tocItems = $state<DocsTocItem[]>([]);

	$effect(() => {
		if (!Article || !articleEl) return;
		let cancelled = false;
		tick().then(() => {
			if (!cancelled && articleEl) tocItems = tocFrom(articleEl, 2, 3);
		});
		return () => {
			cancelled = true;
		};
	});
</script>

{#if doc}
	<div class="bodymain">
		<!--
				The compiled document. No PublicationLayout wrapper: content comes through
				bare, with Acrolls' compile-time work intact (heading ids/anchors, Shiki
				code frames, wrapped tables). `.doc-body` is ours to style.
			-->
		<div class="acrolls-post box gap32 padtop32 padbot32">
			<div class="acrolls-post-head box gap16">
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
				<div class="box gap16">
					<h1>{doc.title}</h1>
					{#if doc.description}<p class="doc-description">{doc.description}</p>{/if}
					{#if tags.length}
						<div class="row wrap gap4">
							{#each tags as tag}
								<a class="badge" href={tagHref(tag)}>{tag}</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			{#if loadError}
				<p class="doc-error">This document could not be rendered: {loadError}</p>
			{:else if Article}
				<article bind:this={articleEl}>
					<Article />
				</article>
			{:else}
				<p>Loading…</p>
			{/if}
			{#if links.previous || links.next}
				<nav class="acrolls-pagination row xbetween" aria-label="Pagination">
					{#if links.previous}<a href={links.previous.href}>
							← {links.previous.title}
						</a>{/if}
					{#if links.next}<a href={links.next.href}>{links.next.title} →</a>{/if}
				</nav>
			{/if}
		</div>
	</div>
	<aside class="sidebarright">
		<Toc items={tocItems} />
	</aside>
{:else}
	<p>Document not found.</p>
{/if}
