<script lang="ts">
	import '$lib/styles/index.sass';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Header from '$lib/components/shell/Header.svelte';
	import AuraBackground from '$lib/components/shell/AuraBackground.svelte';
	import SearchModal from '$lib/components/search/SearchModal.svelte';
	import { menuState, closeMenuState } from '$lib/utils/menustate';
	import { searchState, toggleSearch, openSearch } from '$lib/utils/searchstate';
	import { themeState } from '$lib/utils/theme.svelte';
	import Nav from '$lib/docs/Nav.svelte';
	import Search from '$lib/icons/search.svelte';

	let { children } = $props();

	onMount(() => {
		themeState.init();

		function handleResize() {
			if (window.innerWidth >= 1024 && menuState.open) {
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

	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			toggleSearch();
			return;
		}
		if (e.key === '/' && !searchState.open) {
			const active = document.activeElement;
			const isInput =
				active instanceof HTMLInputElement ||
				active instanceof HTMLTextAreaElement ||
				active?.getAttribute('contenteditable') === 'true';
			if (!isInput) {
				e.preventDefault();
				openSearch();
			}
		}
	}

	// Lock body scroll when mobile menu is open (< 1024px)
	$effect(() => {
		if (browser) {
			if (menuState.open && window.innerWidth < 1024) {
				document.documentElement.style.overflow = 'hidden';
				document.body.style.overflow = 'hidden';
			} else if (!searchState.open) {
				document.documentElement.style.removeProperty('overflow');
				document.body.style.removeProperty('overflow');
			}
		}
	});

	// Close menu only when URL actually changes
	let lastPath = $state('');
	$effect(() => {
		const currentPath = page.url.pathname;
		if (lastPath && lastPath !== currentPath) {
			closeMenuState();
		}
		lastPath = currentPath;
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

<svelte:window onkeydown={handleGlobalKeydown} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AuraBackground />
<div class="box fullwrapper">
	<Header />
	<main class="inwrapper bodywrapper">
		{@render children()}
	</main>
	{#if menuState.open}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<aside class="mobile-menu box gap16" onclick={handleMenuClick} data-pagefind-ignore>
			<button
				class="header-search-btn row ycenter gap8"
				style="width: 100%; justify-content: flex-start;"
				onclick={() => {
					closeMenuState();
					openSearch();
				}}
			>
				<Search size={16} />
				<span>Search Documentation...</span>
				<kbd style="margin-left: auto;">⌘K</kbd>
			</button>
			<a class="top-link" href="/docs/tags">TAGS</a>
			<a class="top-link" href="/studio">STUDIO</a>
			<Nav pathname={page.url.pathname} />
		</aside>
	{/if}
</div>

<SearchModal />
