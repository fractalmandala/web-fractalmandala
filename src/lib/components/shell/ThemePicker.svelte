<script lang="ts">
	import { onMount } from 'svelte';
	import {
		themeState,
		THEMES,
		LIGHT_THEMES,
		DARK_THEMES,
		DEFAULT_THEME_ID,
		type ThemeInfo
	} from '$lib/utils/theme.svelte';
	import ThemeButton from '$lib/icons/theme.svelte';
	import Sun from '$lib/icons/sun.svelte';
	import Moon from '$lib/icons/moon.svelte';

	let activeTab = $state<'all' | 'light' | 'dark'>('all');
	let searchFilter = $state<string>('');
	let pickerEl = $state<HTMLDivElement | null>(null);

	onMount(() => {
		themeState.init();

		function handleClickOutside(e: MouseEvent) {
			if (themeState.isOpen && pickerEl && !pickerEl.contains(e.target as Node)) {
				themeState.closePicker();
			}
		}

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && themeState.isOpen) {
				themeState.closePicker();
			}
		}

		window.addEventListener('click', handleClickOutside);
		window.addEventListener('keydown', handleKeydown);

		return () => {
			window.removeEventListener('click', handleClickOutside);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	const filteredThemes = $derived.by(() => {
		let list: ThemeInfo[] = [];
		if (activeTab === 'light') {
			list = LIGHT_THEMES;
		} else if (activeTab === 'dark') {
			list = DARK_THEMES;
		} else {
			list = THEMES;
		}

		if (!searchFilter.trim()) return list;

		const q = searchFilter.toLowerCase().trim();
		return list.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				t.description.toLowerCase().includes(q)
		);
	});
</script>

<div class="theme-controls" bind:this={pickerEl}>
	<!-- Quick Mode Flip (Sun/Moon) -->
	<button
		type="button"
		class="button-icon button-desk"
		data-variation="icon"
		title={themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		aria-label={themeState.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
		onclick={() => themeState.toggleMode()}
	>
		{#if themeState.isDark}
			<!-- Sun Icon -->
			<Sun />
		{:else}
			<!-- Moon Icon -->
			<Moon />
		{/if}
	</button>

	<!-- Theme Dropdown Trigger -->
	<button
		type="button"
		class="button-icon"
		data-variant="icon"
		aria-haspopup="dialog"
		aria-expanded={themeState.isOpen}
		onclick={(e) => {
			e.stopPropagation();
			themeState.togglePicker();
		}}
	>
		<ThemeButton />
	</button>

	<!-- Popover Modal -->
</div>
{#if themeState.isOpen}
	<div class="theme-popover" role="dialog" aria-label="Theme Palette Switcher">
		<!-- Filter Tabs -->
		<div class="theme-tabs row xbetween">
			<div class="row gap8 ycenter">
				<button
					type="button"
					class="theme-tab-btn"
					class:active={activeTab === 'all'}
					onclick={() => (activeTab = 'all')}
				>
					All ({THEMES.length})
				</button>
				<button
					type="button"
					class="theme-tab-btn"
					class:active={activeTab === 'light'}
					onclick={() => (activeTab = 'light')}
				>
					Light ({LIGHT_THEMES.length})
				</button>
				<button
					type="button"
					class="theme-tab-btn"
					class:active={activeTab === 'dark'}
					onclick={() => (activeTab = 'dark')}
				>
					Dark ({DARK_THEMES.length})
				</button>
				<button
					type="button"
					class="theme-tab-btn"
					title="Cycle to next theme"
					aria-label="Cycle to next theme"
					onclick={() => themeState.cycleNext()}
				>
					NEXT
				</button>
			</div>
			<button
				type="button"
				class="theme-icon-btn"
				aria-label="Close theme menu"
				onclick={() => themeState.closePicker()}
			>
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>

		<!-- Themes Grid -->
		<div class="theme-grid-container">
			{#each filteredThemes as theme (theme.id)}
				<button
					type="button"
					class="theme-card"
					class:active={themeState.current === theme.id}
					onclick={() => {
						themeState.setTheme(theme.id);
					}}
				>
					<span class="theme-card-name">{theme.name}</span>
					<div
						class="theme-card-preview"
						style="background-color: {theme.bgColor}; color: {theme.textColor}; border-color: {theme.accentColor}33"
					>
						<span class="theme-preview-dot" style="background-color: {theme.accentColor}"></span>
						<span class="theme-preview-dot" style="background-color: {theme.textColor}"></span>
						<span class="theme-card-badge">{theme.mode}</span>
					</div>
				</button>
			{/each}
		</div>

		<!-- Popover Footer -->
		<div class="theme-popover-footer">
			<button
				type="button"
				class="theme-footer-btn"
				onclick={() => themeState.resetDefault()}
				title="Set default theme (.theme-light-default)"
			>
				Reset to Default
			</button>
			<button
				type="button"
				class="theme-footer-btn"
				onclick={() => themeState.cycleRandom()}
				title="Pick a random theme"
			>
				🎲 Random Theme
			</button>
		</div>
	</div>
{/if}
