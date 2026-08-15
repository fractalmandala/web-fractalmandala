<script lang="ts">
	import { crumbs, docTags, getSection, site } from './content';

	let { path, pathname }: { path: string; pathname: string } = $props();

	const section = $derived(getSection(path));

	// Acrolls doesn't know this path (the folder has no landing document), so its trail
	// stops at the docs root. Append the section itself as the final, unlinked crumb.
	const trail = $derived.by(() => {
		const base = crumbs(pathname);
		if (!section) return base;
		if (base.at(-1)?.label === section.title) return base;
		return [...base, { label: section.title }];
	});
</script>

<div class="pagebox">
	{#if section}
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
		<h1 class="text2xl w500">{section.title}</h1>
		<!-- `.card` is the host's own primitive (_primitives.sass) — not restyled here. -->
		<div class="grid grid-cols-auto gap16">
			{#each section.pages as item (item.id)}
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
	{:else}
		<p>Section not found.</p>
	{/if}
</div>
