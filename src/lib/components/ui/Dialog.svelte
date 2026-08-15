<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Icon from '../Icon.svelte';

	interface Props {
		open?: boolean;
		title?: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet;
		footer?: Snippet<[{ close: () => void }]>;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		children,
		footer,
		onclose
	}: Props = $props();

	let el = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!el) return;
		if (open && !el.open) el.showModal();
		if (!open && el.open) el.close();
	});

	function close() {
		open = false;
	}
</script>

<dialog
	bind:this={el}
	class="dialog"
	data-size={size}
	onclose={() => {
		open = false;
		onclose?.();
	}}
	oncancel={close}
>
	{#if title}
		<div class="dialog-head">
			<div>
				<h2 class="dialog-title">{title}</h2>
				{#if description}<p class="dialog-desc">{description}</p>{/if}
			</div>
			<span class="dialog-close">
				<Button variant="ghost" size="sm" icon onclick={close} aria-label="Close dialog">
					<Icon name="close" />
				</Button>
			</span>
		</div>
	{/if}
	{#if children}<div class="dialog-body">{@render children()}</div>{/if}
	{#if footer}<div class="dialog-foot">{@render footer({ close })}</div>{/if}
</dialog>
