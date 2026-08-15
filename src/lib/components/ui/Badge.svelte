<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'default' | 'brand' | 'danger';
		children: Snippet;
	}

	let { tone = 'default', children }: Props = $props();
</script>

<span class="badge" data-tone={tone}>
{@render children()}
</span>
