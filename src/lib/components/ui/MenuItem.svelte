<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		hint?: string;
		tone?: 'default' | 'danger';
		disabled?: boolean;
		active?: boolean;
		children: Snippet;
		[key: string]: unknown;
	}

	let { href, hint, tone = 'default', disabled = false, active = false, children, ...rest }: Props =
		$props();
</script>

{#if href}
	<a
		class="menu-item"
		{href}
		role="menuitem"
		data-tone={tone}
		data-active={active || undefined}
		aria-disabled={disabled || undefined}
		{...rest}
	>
		{@render children()}
		{#if hint}<span class="menu-item-hint">{hint}</span>{/if}
	</a>
{:else}
	<button
		class="menu-item"
		type="button"
		role="menuitem"
		data-tone={tone}
		data-active={active || undefined}
		aria-disabled={disabled || undefined}
		{...rest}
	>
		{@render children()}
		{#if hint}<span class="menu-item-hint">{hint}</span>{/if}
	</button>
{/if}
