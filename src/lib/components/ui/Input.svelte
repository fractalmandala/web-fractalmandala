<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		multiline?: boolean;
		icon?: Snippet;
		[key: string]: unknown;
	}

	let { value = $bindable(''), multiline = false, icon, ...rest }: Props = $props();
</script>

{#if icon}
	<div class="input-wrap">
		<span class="input-icon">{@render icon()}</span>
		<input class="input" bind:value {...rest} />
	</div>
{:else if multiline}
	<textarea class="input" bind:value {...rest}></textarea>
{:else}
	<input class="input" bind:value {...rest} />
{/if}
