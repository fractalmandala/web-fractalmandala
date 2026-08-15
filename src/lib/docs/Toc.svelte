<script lang="ts">
	import type { DocsTocItem } from './content';

	let { items }: { items: DocsTocItem[] } = $props();
</script>

{#if items.length}
	<nav aria-label="On this page" class="box gap8">
		<p class="toc-title">On this page</p>
		<div class="box gap8">
			{#each items as item (item.id)}
				<a class="toc-link" data-level={item.level} href="#{item.id}">
					{item.text}
				</a>
			{/each}
		</div>
	</nav>
{/if}
