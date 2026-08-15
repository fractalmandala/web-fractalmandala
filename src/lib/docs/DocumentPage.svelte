<script lang="ts">
	import { tick, type Component } from 'svelte';
	import Toc from './Toc.svelte';
	import type { DocsTocItem } from './content';
	import { crumbs, docTags, getDoc, getSection, pager, tagHref, tocFrom } from './content';
	import '$lib/styles/docstypography.sass';
	let {
		slug,
		pathname,
		Article
	}: {
		slug: string;
		pathname: string;
		Article?: Component;
	} = $props();

	const doc = $derived(getDoc(slug));
	const tags = $derived(docTags(slug));
	const trail = $derived(crumbs(pathname));
	const links = $derived(pager(pathname));
	const rootSegment = $derived(slug.split('/')[0] ?? '');
	const sectionObj = $derived(getSection(rootSegment));
	const sectionName = $derived(sectionObj?.title ?? 'Docs');

	// Bound to the article element so the TOC can scan the rendered headings.
	let articleEl = $state<HTMLElement>();
	let tocItems = $state<DocsTocItem[]>([]);

	// Acrolls builds the TOC by scanning rendered headings, so wait for the body to be
	// in the DOM. Levels 2–3 only.
	$effect(() => {
		if (!articleEl) return;
		const _ = slug;
		let cancelled = false;
		tick().then(() => {
			if (!cancelled && articleEl) {
				tocItems = tocFrom(articleEl, 2, 3);
			}
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
		<div
			class="acrolls-post box gap32 padtop32 padbot32"
			data-pagefind-body
			data-pagefind-filter={`section:${sectionName}`}
		>
			<div class="acrolls-post-head box gap16">
				<nav aria-label="Breadcrumb" class="fa-breadcrumb" data-pagefind-ignore>
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
					<h1 data-pagefind-meta="title">{doc.title}</h1>
					{#if doc.description}
						<p class="doc-description" data-pagefind-meta="description">{doc.description}</p>
					{/if}
					{#if tags.length}
						<div class="row wrap gap4">
							{#each tags as tag}
								<a class="badge" href={tagHref(tag)} data-pagefind-filter="tag">{tag}</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			{#if Article}
				<article bind:this={articleEl}>
					<Article />
				</article>
			{:else}
				<p>Loading…</p>
			{/if}
			{#if links.previous || links.next}
				<nav class="acrolls-pagination row xbetween" aria-label="Pagination" data-pagefind-ignore>
					{#if links.previous}<a href={links.previous.href}>
							← {links.previous.title}
						</a>{/if}
					{#if links.next}<a href={links.next.href}>{links.next.title} →</a>{/if}
				</nav>
			{/if}
		</div>
	</div>
	<aside class="sidebarright" data-pagefind-ignore>
		<Toc items={tocItems} />
	</aside>
{:else}
	<p>Document not found.</p>
{/if}
