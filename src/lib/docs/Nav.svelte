<script lang="ts">
	import type { DocsNavNode } from './content';
	import { docSections } from './content';
	let { pathname }: { pathname: string } = $props();

	// Accordion behaviour: every section starts collapsed and only opens when the
	// user clicks its title. Opening one section closes any other. The current
	// page's section is deliberately NOT auto-opened.
	let openId = $state<string | null>(null);

	function toggleSection(event: Event, id: string) {
		// Drive open state ourselves so we can enforce single-open accordion
		// semantics; prevent <details>' native toggle from fighting us.
		event.preventDefault();
		openId = openId === id ? null : id;
	}

	function isActive(href: string | undefined) {
		return !!href && href === pathname;
	}
</script>

{#snippet nodes(items: DocsNavNode[])}
	{#each items as item (item.id)}
		<div class="acrolls-nav">
			{#if item.href}
				<a href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
					{item.title}
				</a>
			{:else}
				<span>{item.title}</span>
			{/if}

			{#if item.children?.length}
				{@render nodes(item.children)}
			{/if}
		</div>
	{/each}
{/snippet}

<nav aria-label="Documentation" class="navtree">
	{#each docSections as section (section.id)}
		<!-- Collapsed by default; opens only on title click, and only one at a time. -->
		<details class="acrolls-nav-card box gap8" open={section.id === openId}>
			<!--
				Plain text, not a link. A link inside <summary> fights the disclosure: the
				click both navigates and toggles. Section pages are reachable from the
				breadcrumb instead.
			-->
			<summary
				class="acrolls-nav-title"
				onclick={(e) => toggleSection(e, section.id)}
			>{section.title}</summary>
			<div class="box gap8">
				{@render nodes(section.pages)}
			</div>
		</details>
	{/each}
</nav>
