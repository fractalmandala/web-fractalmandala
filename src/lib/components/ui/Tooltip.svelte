<script lang="ts">
	import type { Snippet } from 'svelte';
	import { anchored, type Placement } from '$lib/actions/anchored';

	interface Props {
		text: string;
		children: Snippet;
		placement?: Placement;
		delay?: number;
	}

	let { text, children, placement = 'top', delay = 120 }: Props = $props();
	const id = $props.id();
	let wrap = $state<HTMLElement | null>(null);
	let surface = $state<(HTMLElement & { showPopover(): void; hidePopover(): void }) | null>(null);
	let timer: ReturnType<typeof setTimeout>;

	function show() {
		clearTimeout(timer);
		timer = setTimeout(() => {
			try {
				surface?.showPopover();
			} catch {
				/* already open */
			}
		}, delay);
	}

	function hide() {
		clearTimeout(timer);
		try {
			surface?.hidePopover();
		} catch {
			/* already closed */
		}
	}
</script>

<span
	bind:this={wrap}
	style="display:inline-flex"
	aria-describedby={id}
	onmouseenter={show}
	onmouseleave={hide}
	onfocusin={show}
	onfocusout={hide}
>
	{@render children()}
</span>

<div
	{id}
	bind:this={surface}
	popover="manual"
	role="tooltip"
	class="pop tooltip"
	use:anchored={{ placement, offset: 8, anchor: wrap }}
>
	{text}
</div>
