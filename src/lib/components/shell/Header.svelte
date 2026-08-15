<script lang="ts">
	import ThemePicker from '$lib/components/shell/ThemePicker.svelte';
	import { toggleMenuState, menuState } from '$lib/utils/menustate';
	import { openSearch } from '$lib/utils/searchstate';
	import Search from '$lib/icons/search.svelte';
	import Menu from '$lib/icons/menu.svelte';
	import Close from '$lib/icons/close.svelte';
	import Github from '$lib/icons/github.svelte';
	import Twitter from '$lib/icons/twitter.svelte';
</script>

<header class="row xbetween ycenter newheader" data-pagefind-ignore>
	<div class="row xbetween ycenter inwrapper gap16">
		<div class="row ycenter gap24">
			<a class="blank row ycenter gap16" href="/" aria-label="Fractal Mandala Home">
				<img class="logomotif" src="/images/logomotif.png" alt="motif" />
				<img
					class="logotype mode-light-only"
					src="/images/logotype-black.png"
					alt="Fractal Mandala"
				/>
				<img
					class="logotype mode-dark-only"
					src="/images/logotype-white.png"
					alt="Fractal Mandala"
				/>
			</a>
		</div>

		<div class="row ycenter gap16">
			<div class="menu-links row gap16 ycenter">
				<a href="/docs/tags">TAGS</a>
				<a href="/studio">STUDIO</a>
			</div>
			<button class="header-search-btn" onclick={openSearch} aria-label="Search (⌘K)">
				<Search size={15} />
				<span>Search</span>
				<kbd>⌘K</kbd>
			</button>
			<ThemePicker />
			<a
				class="button-icon"
				href="https://github.com/fractalmandala?tab=repositories"
				target="_blank"
				rel="noreferrer"
			>
				<Github />
			</a>
			<a class="button-icon" href="https://x.com/saamaanyafreaky" target="_blank" rel="noreferrer">
				<Twitter />
			</a>
			<button class="button-icon button-menu" onclick={toggleMenuState}>
				{#if $menuState}
					<Close />
				{:else}
					<Menu />
				{/if}
			</button>
		</div>
	</div>
</header>
