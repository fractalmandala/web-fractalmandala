<script lang="ts">
	import type { Snippet } from 'svelte';
	import { anchored, type Placement } from '$lib/actions/anchored';

	interface Props {
		/** The trigger. Receives the props it must spread onto a button. */
		trigger: Snippet<[{ popovertarget: string }]>;
		children: Snippet;
		placement?: Placement;
		label?: string;
	}

	let { trigger, children, placement = 'bottom-start', label = 'Menu' }: Props = $props();
	const id = $props.id();
	let surface = $state<HTMLElement | null>(null);

	function onkeydown(event: KeyboardEvent) {
		const items = [...(surface?.querySelectorAll<HTMLElement>('.menu-item:not([aria-disabled])') ?? [])];
		if (!items.length) return;
		const i = items.indexOf(document.activeElement as HTMLElement);
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const next = event.key === 'ArrowDown' ? i + 1 : i - 1;
			items[(next + items.length) % items.length].focus();
		}
		if (event.key === 'Home') items[0].focus();
		if (event.key === 'End') items[items.length - 1].focus();
	}

	function ontoggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			requestAnimationFrame(() =>
				surface?.querySelector<HTMLElement>('.menu-item:not([aria-disabled])')?.focus()
			);
		}
	}
</script>

{@render trigger({ popovertarget: id })}

<div
	{id}
	bind:this={surface}
	popover="auto"
	class="pop"
	role="menu"
	aria-label={label}
	use:anchored={{ placement }}
	{onkeydown}
	{ontoggle}
>
	<div class="menu">{@render children()}</div>
</div>
