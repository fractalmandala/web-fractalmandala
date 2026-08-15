<script lang="ts">
	import type { Snippet } from 'svelte';
	import Nav from '$lib/docs/Nav.svelte';
	import { page } from '$app/state';
	import Toc from './Toc.svelte';
	import '$lib/styles/docsshell.sass';
	import type { DocsTocItem } from './content';
	import { menuState } from '$lib/utils/menustate';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let drawerOpen = $state(false);
	let tocItems = $state<DocsTocItem[]>([]);

	// Close the drawer once the viewport is wide enough for sticky layout (>= 768px).
	$effect(() => {
		if (!drawerOpen) return;
		const mq = matchMedia('(min-width: 768px)');
		const onChange = () => mq.matches && (drawerOpen = false);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (drawerOpen = false)} />

<section class="blume-root">
	<main class="blume-body">
		{#if drawerOpen}
			<button
				class="sidebar-backdrop"
				aria-label="Close navigation"
				onclick={() => (drawerOpen = false)}
			></button>
		{/if}

		<aside class="sidebar" data-open={drawerOpen}>
			<Nav pathname={page.url.pathname} />
		</aside>

		<article class="content-wrapper">
			{@render children()}
		</article>

		<aside class="toc-sidebar">
			<Toc items={tocItems} />
		</aside>
	</main>
</section>
