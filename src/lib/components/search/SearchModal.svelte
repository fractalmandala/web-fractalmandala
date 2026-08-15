<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { searchOpen, closeSearch } from '$lib/utils/searchstate';
	import { searchPagefind, type SearchResultItem } from '$lib/search/pagefind';
	import SearchIcon from '$lib/icons/search.svelte';
	import CloseIcon from '$lib/icons/close.svelte';

	const SECTIONS = [
		{ id: 'all', label: 'All' },
		{ id: 'Writings', label: 'Writings' },
		{ id: 'Civilization', label: 'Civilization' },
		{ id: 'Comparative Civilization', label: 'Comparative Civ' },
		{ id: 'History', label: 'History' },
		{ id: 'Karmic Streams', label: 'Karmic Streams' },
		{ id: 'Sri Aurobindo', label: 'Sri Aurobindo' },
		{ id: 'Ram Swarup & Sita Ram Goel', label: 'Ram Swarup & Sita Ram Goel' }
	];

	const QUICK_TOPICS = [
		'Consciousness',
		'Dharmik',
		'Rigveda',
		'Civilization',
		'Sri Aurobindo',
		'Hindupunk',
		'Itihasa',
		'Samsara'
	];

	let query = $state('');
	let activeSection = $state('all');
	let results = $state<SearchResultItem[]>([]);
	let totalCount = $state(0);
	let loading = $state(false);
	let selectedIndex = $state(0);
	let inputEl = $state<HTMLInputElement>();
	let resultsContainerEl = $state<HTMLDivElement>();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	// Reset & focus input whenever modal opens
	$effect(() => {
		if ($searchOpen) {
			query = '';
			results = [];
			totalCount = 0;
			selectedIndex = 0;
			tick().then(() => {
				inputEl?.focus();
			});
		}
	});

	// Lock body scroll when modal is open
	$effect(() => {
		if (!browser) return;
		if ($searchOpen) {
			const originalOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalOverflow;
			};
		}
	});

	// Debounced search
	function handleQueryChange() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			if (!query.trim()) {
				results = [];
				totalCount = 0;
				loading = false;
				selectedIndex = 0;
				return;
			}

			loading = true;
			try {
				const response = await searchPagefind(query, {
					section: activeSection === 'all' ? null : activeSection,
					limit: 12
				});
				results = response.results;
				totalCount = response.total;
				selectedIndex = 0;
			} catch (err) {
				console.error('Search error:', err);
				results = [];
				totalCount = 0;
			} finally {
				loading = false;
			}
		}, 120);
	}

	function handleSectionSelect(sectionId: string) {
		activeSection = sectionId;
		if (query.trim()) {
			handleQueryChange();
		}
	}

	function handleTopicClick(topic: string) {
		query = topic;
		handleQueryChange();
		tick().then(() => {
			inputEl?.focus();
		});
	}

	function navigateTo(url: string) {
		closeSearch();
		goto(url);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!$searchOpen) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch();
			return;
		}

		if (results.length > 0) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				selectedIndex = (selectedIndex + 1) % results.length;
				scrollActiveIntoView();
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				selectedIndex = (selectedIndex - 1 + results.length) % results.length;
				scrollActiveIntoView();
			} else if (event.key === 'Enter') {
				event.preventDefault();
				if (results[selectedIndex]) {
					navigateTo(results[selectedIndex].url);
				}
			}
		}
	}

	function scrollActiveIntoView() {
		tick().then(() => {
			const activeItem = resultsContainerEl?.querySelector('[data-active="true"]');
			activeItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		});
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeSearch();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $searchOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="search-backdrop"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-label="Search Documentation"
	>
		<div class="search-modal box">
			<!-- Header / Input Field -->
			<div class="search-input-wrapper row ycenter gap12">
				<span class="search-icon-slot">
					<SearchIcon size={20} />
				</span>
				<input
					bind:this={inputEl}
					type="search"
					class="search-input"
					placeholder="Search 300+ articles, topics, keywords..."
					bind:value={query}
					oninput={handleQueryChange}
					autocomplete="off"
					spellcheck="false"
				/>
				{#if loading}
					<div class="search-spinner" aria-label="Searching..."></div>
				{:else if query}
					<button
						type="button"
						class="search-clear-btn"
						onclick={() => {
							query = '';
							results = [];
							totalCount = 0;
							inputEl?.focus();
						}}
						aria-label="Clear query"
					>
						<CloseIcon />
					</button>
				{/if}
				<button type="button" class="search-kbd" onclick={closeSearch} title="Close search (ESC)">
					ESC
				</button>
			</div>

			<!-- Category Filter Pills -->
			<div class="search-filters-bar row wrap gap6 ycenter">
				{#each SECTIONS as sec (sec.id)}
					<button
						type="button"
						class="search-filter-chip"
						class:active={activeSection === sec.id}
						onclick={() => handleSectionSelect(sec.id)}
					>
						{sec.label}
					</button>
				{/each}
			</div>

			<!-- Results Body -->
			<div bind:this={resultsContainerEl} class="search-results-container box gap8">
				{#if query.trim() && results.length > 0}
					<div class="search-meta-count row xbetween ycenter">
						<span>Found {totalCount} {totalCount === 1 ? 'match' : 'matches'}</span>
						<span class="search-meta-hint">Use ↑ ↓ arrows to navigate, Enter to select</span>
					</div>

					<div class="search-results-list box gap8" role="listbox" aria-label="Search results">
						{#each results as result, idx (result.id)}
							<div
								class="search-result-card box gap6"
								class:selected={idx === selectedIndex}
								data-active={idx === selectedIndex}
								onclick={() => navigateTo(result.url)}
								onmouseenter={() => (selectedIndex = idx)}
								role="option"
								aria-selected={idx === selectedIndex}
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && navigateTo(result.url)}
							>
								<div class="row xbetween ycenter gap8">
									<span class="search-result-title">{result.title}</span>
									{#if result.section}
										<span class="search-section-badge">{result.section}</span>
									{/if}
								</div>

								{#if result.excerpt}
									<p class="search-result-excerpt">
										<!-- Render sanitized snippet with highlighted <mark> keywords -->
										{@html result.excerpt}
									</p>
								{/if}

								{#if result.subResults && result.subResults.length > 0}
									<div class="search-subresults row wrap gap6">
										{#each result.subResults as sub}
											<a
												href={sub.url}
												class="search-subresult-pill"
												onclick={(e) => {
													e.stopPropagation();
													navigateTo(sub.url);
												}}
											>
												<span class="subresult-hash">#</span>
												<span class="subresult-title">{sub.title}</span>
											</a>
										{/each}
									</div>
								{/if}

								{#if result.tags && result.tags.length > 0}
									<div class="search-result-tags row wrap gap4">
										{#each result.tags as tag}
											<span class="search-tag-chip">{tag}</span>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else if query.trim() && !loading && results.length === 0}
					<div class="search-empty-state box xcenter ycenter gap12">
						<p class="search-empty-title">No results found for "{query}"</p>
						<p class="search-empty-desc">
							Try searching for alternative keywords, broader themes, or select "All" categories.
						</p>
					</div>
				{:else if !query.trim()}
					<div class="search-initial-state box gap16">
						<span class="search-initial-label">Suggested topics:</span>
						<div class="row wrap gap8">
							{#each QUICK_TOPICS as topic}
								<button
									type="button"
									class="search-suggest-chip"
									onclick={() => handleTopicClick(topic)}
								>
									{topic}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer info -->
			<div class="search-footer row xbetween ycenter">
				<div class="row gap12 ycenter search-footer-hints">
					<span><kbd>↵</kbd> Select</span>
					<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
					<span><kbd>ESC</kbd> Close</span>
				</div>
				<span class="search-powered-by">Powered by Pagefind</span>
			</div>
		</div>
	</div>
{/if}
