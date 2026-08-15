<script lang="ts">
	import '$lib/styles/index.sass';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Header from '$lib/components/shell/Header.svelte';
	import AuraBackground from '$lib/components/shell/AuraBackground.svelte';
	import { menuState, closeMenuState } from '$lib/utils/menustate';
	import { themeState } from '$lib/utils/theme.svelte';
	import Nav from '$lib/docs/Nav.svelte';

	let { children } = $props();

	onMount(() => {
		themeState.init();

		function handleResize() {
			if (window.innerWidth > 1024 && $menuState) {
				closeMenuState();
			}
		}

		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
			if (browser) {
				document.documentElement.style.removeProperty('overflow');
				document.body.style.removeProperty('overflow');
			}
		};
	});

	// Lock body scroll when mobile menu is open (<= 1024px)
	$effect(() => {
		if (browser) {
			if ($menuState && window.innerWidth <= 1024) {
				document.documentElement.style.overflow = 'hidden';
				document.body.style.overflow = 'hidden';
			} else {
				document.documentElement.style.removeProperty('overflow');
				document.body.style.removeProperty('overflow');
			}
		}
	});

	// Close menu on client-side navigation
	$effect(() => {
		const _ = page.url.pathname;
		if (browser && $menuState) {
			closeMenuState();
		}
	});

	// Close menu only when clicking an <a> tag (not <summary> or <details> accordion)
	function handleMenuClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const anchor = target?.closest('a');
		if (anchor) {
			closeMenuState();
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AuraBackground />
<div class="box fullwrapper">
	<Header />
	<main class="inwrapper bodywrapper">
		{@render children()}
	</main>
	{#if $menuState}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<aside class="mobile-menu box gap16" onclick={handleMenuClick}>
			<a class="top-link" href="/docs/tags">TAGS</a>
			<a class="top-link" href="/studio">STUDIO</a>
			<Nav pathname={page.url.pathname} />
		</aside>
	{/if}
</div>
