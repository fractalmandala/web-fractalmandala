<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		/** flat = hairline border · raised = shadow, no border · seamless = page surface */
		variant?: 'flat' | 'raised' | 'seamless' | 'plain';
		span?: 'full';
		media?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let { href, variant = 'flat', span, media, children, footer }: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'article'}
	class="card"
	{href}
	data-variant={variant}
	data-span={span}
	data-interactive={href ? 'true' : undefined}
>
	{#if media}<div class="card-media">{@render media()}</div>{/if}
	<div class="card-body">
		{@render children()}
		{#if footer}<div class="card-foot">{@render footer()}</div>{/if}
	</div>
</svelte:element>
