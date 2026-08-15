<script lang="ts">
	import type { Snippet } from 'svelte';
	import Nav from '$lib/docs/Nav.svelte';
	import { page } from '$app/state';
	import { crumbs, getDoc, pager, tocFrom } from './content';
	import Toc from './Toc.svelte';
	import '$lib/styles/docsshell.sass';
	import type { DocsTocItem } from './content';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let drawerOpen = $state(false);
	let tocItems = $state<DocsTocItem[]>([]);

	// Close the drawer once the viewport is wide enough to show both rails.
	$effect(() => {
		if (!drawerOpen) return;
		const mq = matchMedia('(min-width: 1025px)');
		const onChange = () => mq.matches && (drawerOpen = false);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (drawerOpen = false)} />

<section class="appshell">
	<main class="appbody" data-mobile-open={drawerOpen}>
		{#if drawerOpen}
			<button
				class="appbody-backdrop"
				aria-label="Close navigation"
				onclick={() => (drawerOpen = false)}
			></button>
		{/if}

		<aside class="sidebarleft">
			<Nav pathname={page.url.pathname} />
		</aside>

		<article class="bodymain">
			{@render children()}
		</article>

		<aside class="sidebarright">
			<Toc items={tocItems} />
		</aside>
	</main>
</section>
