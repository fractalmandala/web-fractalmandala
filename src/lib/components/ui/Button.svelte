<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		variant?: 'solid' | 'outline' | 'ghost' | 'link';
		tone?: 'ink' | 'brand' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		/** Square, icon-only button. */
		icon?: boolean;
		block?: boolean;
		loading?: boolean;
		disabled?: boolean;
		href?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'solid',
		tone = 'ink',
		size = 'md',
		icon = false,
		block = false,
		loading = false,
		disabled = false,
		href,
		children,
		...rest
	}: Props & (HTMLButtonAttributes | HTMLAnchorAttributes) = $props();
</script>

{#if href}
	<a
		class="btn"
		{href}
		data-variant={variant}
		data-tone={tone}
		data-size={size}
		data-icon={icon || undefined}
		data-block={block || undefined}
		aria-disabled={disabled || undefined}
		{...rest}
	>
		{#if loading}<span class="btn-spinner"></span>{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		class="btn"
		type="button"
		data-variant={variant}
		data-tone={tone}
		data-size={size}
		data-icon={icon || undefined}
		data-block={block || undefined}
		data-loading={loading || undefined}
		{disabled}
		{...rest}
	>
		{#if loading}<span class="btn-spinner"></span>{/if}
		{@render children?.()}
	</button>
{/if}
