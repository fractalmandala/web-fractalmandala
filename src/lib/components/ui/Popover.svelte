<script lang="ts">
	import type { Snippet } from 'svelte';
	import { anchored, type Placement } from '$lib/actions/anchored';

	interface Props {
		trigger: Snippet<[{ popovertarget: string }]>;
		children: Snippet;
		title?: string;
		placement?: Placement;
		width?: string;
	}

	let { trigger, children, title, placement = 'bottom-start', width }: Props = $props();
	const id = $props.id();
</script>

{@render trigger({ popovertarget: id })}

<div
	{id}
	popover="auto"
	class="pop"
	style={width ? `width:${width}` : undefined}
	use:anchored={{ placement, offset: 8 }}
>
	<div class="popover-body">
		{#if title}<p class="popover-title">{title}</p>{/if}
		{@render children()}
	</div>
</div>
