<script lang="ts">
	import type { DocsTocItem } from './content';

	// Presentational only. The scan happens in DocumentPage, where the article body's
	// mount timing is known — passing an element across a component boundary and trying
	// to guess when its children exist is what made this silently empty before.
	let { items }: { items: DocsTocItem[] } = $props();
</script>

{#if items.length}
	<nav aria-label="On this page" class="box gap8">
		<p class="text-muted tt-c text-sm">On this page</p>
		<div class="box gap8">
			{#each items as item (item.id)}
				<a class="secondary-to-theme text-sm" data-level={item.level} href="#{item.id}"
					>{item.text}</a
				>
			{/each}
		</div>
	</nav>
{/if}
