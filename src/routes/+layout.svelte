<script lang="ts">
	import '$lib/styles/index.sass';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Header from '$lib/components/shell/Header.svelte';
	import AuraBackground from '$lib/components/shell/AuraBackground.svelte';
	import { menuState, toggleMenuState } from '$lib/utils/menustate';
	import { themeState } from '$lib/utils/theme.svelte';
	import Nav from '$lib/docs/Nav.svelte';

	let { children } = $props();
	let menuOpen = $state(false);

	onMount(() => {
		themeState.init();
	});
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
		<aside class="mobile-menu">
			<Nav pathname={page.url.pathname} />
		</aside>
	{/if}
</div>
