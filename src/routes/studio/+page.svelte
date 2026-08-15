<script lang="ts">
	import { onMount } from 'svelte';
	import {
		themeState,
		THEMES,
		AURA_PRESETS,
		CORE_TOKENS,
		type ThemeInfo,
		type AuraPreset,
		type AuraLayer,
		type BgStyle,
		type TokenMeta
	} from '$lib/utils/theme.svelte';
	import { SeoGeoOptimizer } from 'quartzo';
	import Aura from '$lib/icons/aura.svelte';
	import Plain from '$lib/icons/plain.svelte';
	import Sun from '$lib/icons/sun.svelte';
	import Moon from '$lib/icons/moon.svelte';
	import Random from '$lib/icons/random.svelte';
	import Reset from '$lib/icons/reset.svelte';
	import Save from '$lib/icons/save.svelte';

	// Studio State
	let selectedBaseId = $state<string>(themeState.current);
	let themeName = $state<string>('My Custom Theme');
	let themeMode = $state<'light' | 'dark'>('light');
	let activeBgStyle = $state<BgStyle>('aura');
	let activeTab = $state<'surfaces' | 'typography' | 'borders' | 'aura' | 'saved' | 'export'>(
		'surfaces'
	);
	let exportFormat = $state<'sass' | 'css' | 'json' | 'tailwind'>('sass');
	let copySuccess = $state<boolean>(false);
	let saveSuccess = $state<boolean>(false);

	// Editable Token Map
	let tokens = $state<Record<string, string>>({});

	// Editable Aura Layers
	let auraLayers = $state<AuraLayer[]>([]);
	let selectedAuraPresetId = $state<string>('golden-hour');

	// WCAG 2.1 Contrast Helper Functions
	function hexToRgb(hex: string) {
		let clean = (hex || '').trim().replace(/^#/, '');
		if (clean.length === 3)
			clean = clean
				.split('')
				.map((c) => c + c)
				.join('');
		if (clean.length < 6) return { r: 0, g: 0, b: 0 };
		const num = parseInt(clean.slice(0, 6), 16);
		return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
	}

	function sRgbToLinear(c: number) {
		const v = c / 255;
		return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	}

	function luminance(hex: string) {
		const rgb = hexToRgb(hex);
		return (
			0.2126 * sRgbToLinear(rgb.r) + 0.7152 * sRgbToLinear(rgb.g) + 0.0722 * sRgbToLinear(rgb.b)
		);
	}

	function contrast(hex1: string, hex2: string) {
		const l1 = luminance(hex1);
		const l2 = luminance(hex2);
		const lighter = Math.max(l1, l2);
		const darker = Math.min(l1, l2);
		return (lighter + 0.05) / (darker + 0.05);
	}

	function getContrastScore(fgHex: string, bgHex: string) {
		const cr = contrast(fgHex, bgHex);
		if (cr >= 7.0) return { ratio: cr.toFixed(1) + ':1', label: 'AAA', class: 'pass-aaa' };
		if (cr >= 4.5) return { ratio: cr.toFixed(1) + ':1', label: 'AA', class: 'pass-aa' };
		return { ratio: cr.toFixed(1) + ':1', label: 'Fail', class: 'fail' };
	}

	// Initialize with base theme
	function loadTheme(base: ThemeInfo) {
		selectedBaseId = base.id;
		themeName = base.isCustom ? base.name : `${base.name} (Custom)`;
		themeMode = base.mode;
		tokens = { ...base.tokens };

		// Load aura
		if (base.customAura) {
			auraLayers = JSON.parse(JSON.stringify(base.customAura.layers));
			selectedAuraPresetId = base.customAura.id;
		} else {
			const preset = AURA_PRESETS.find((a) => a.id === base.auraId) ?? AURA_PRESETS[0];
			if (preset) {
				selectedAuraPresetId = preset.id;
				auraLayers = JSON.parse(JSON.stringify(preset.layers));
			}
		}
		applyLiveChanges();
	}

	function loadAuraPreset(presetId: string) {
		const preset = AURA_PRESETS.find((a) => a.id === presetId);
		if (!preset) return;
		selectedAuraPresetId = preset.id;
		auraLayers = JSON.parse(JSON.stringify(preset.layers));
		applyLiveChanges();
	}

	function updateToken(key: string, value: string) {
		tokens[key] = value;
		applyLiveChanges();
	}

	function applyLiveChanges() {
		themeState.applyCustomOverrides(tokens, auraLayers);
	}

	function toggleMode() {
		themeMode = themeMode === 'light' ? 'dark' : 'light';
		if (themeMode === 'dark' && luminance(tokens['bg'] || '#fff') > 0.5) {
			tokens['bg'] = '#0F172A';
			tokens['bg-surface'] = '#1E293B';
			tokens['bg-raised'] = '#334155';
			tokens['bg-panel'] = '#1E293B';
			tokens['text-primary'] = '#F8FAFC';
			tokens['text-secondary'] = '#CBD5E1';
			tokens['text-muted'] = '#94A3B8';
			tokens['border'] = '#334155';
			tokens['border-subtle'] = '#1E293B';
		} else if (themeMode === 'light' && luminance(tokens['bg'] || '#000') < 0.5) {
			tokens['bg'] = '#FFFFFF';
			tokens['bg-surface'] = '#F8F9FA';
			tokens['bg-raised'] = '#FFFFFF';
			tokens['bg-panel'] = '#F1F3F5';
			tokens['text-primary'] = '#0F172A';
			tokens['text-secondary'] = '#475569';
			tokens['text-muted'] = '#7F91AA';
			tokens['border'] = '#E2E8F0';
			tokens['border-subtle'] = '#EDF2F7';
		}
		applyLiveChanges();
	}

	function addAuraLayer() {
		auraLayers = [
			...auraLayers,
			{
				layer: auraLayers.length + 1,
				background:
					'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.45) 0%, transparent 65%)',
				blendMode: 'screen',
				blurMobile: 70,
				blurDesktop: 120,
				opacity: 0.9
			}
		];
		applyLiveChanges();
	}

	function removeAuraLayer(index: number) {
		auraLayers = auraLayers.filter((_, i) => i !== index);
		applyLiveChanges();
	}

	function saveToLocalStorage() {
		const customTheme = themeState.saveCustomTheme({
			name: themeName || 'Untitled Theme',
			mode: themeMode,
			tokens: { ...tokens },
			aura: {
				id: selectedAuraPresetId || 'custom-aura',
				name: `${themeName} Aura`,
				description: 'Custom gradient bloom layer stack',
				layers: JSON.parse(JSON.stringify(auraLayers))
			}
		});
		saveSuccess = true;
		setTimeout(() => (saveSuccess = false), 2500);
	}

	function deleteCustomTheme(id: string) {
		themeState.deleteCustomTheme(id);
		loadTheme(THEMES[0]);
	}

	function randomizeColors() {
		const randomHue = Math.floor(Math.random() * 360);
		const isDark = themeMode === 'dark';
		tokens['theme-color'] = `hsl(${randomHue}, 75%, ${isDark ? 65 : 45}%)`;
		tokens['theme-color-alt'] = `hsl(${randomHue}, 80%, ${isDark ? 55 : 35}%)`;
		const bgHue = (randomHue + 180) % 360;
		if (isDark) {
			tokens['bg'] = `hsl(${bgHue}, 20%, 7%)`;
			tokens['bg-surface'] = `hsl(${bgHue}, 18%, 11%)`;
			tokens['bg-panel'] = `hsl(${bgHue}, 18%, 13%)`;
			tokens['border'] = `hsl(${bgHue}, 15%, 22%)`;
		} else {
			tokens['bg'] = `hsl(${bgHue}, 25%, 98%)`;
			tokens['bg-surface'] = `hsl(${bgHue}, 20%, 96%)`;
			tokens['bg-panel'] = `hsl(${bgHue}, 18%, 94%)`;
			tokens['border'] = `hsl(${bgHue}, 15%, 88%)`;
		}
		applyLiveChanges();
	}

	// Generated Code
	const generatedCode = $derived.by(() => {
		const id =
			themeName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '') || 'custom-theme';
		if (exportFormat === 'sass') {
			let res = `// ${themeName} (${themeMode.toUpperCase()})\n.theme-${id}\n`;
			for (const [k, v] of Object.entries(tokens)) {
				res += `\t--${k}: ${v}\n`;
			}
			return res;
		}
		if (exportFormat === 'css') {
			let res = `/* ${themeName} */\n.theme-${id} {\n`;
			for (const [k, v] of Object.entries(tokens)) {
				res += `  --${k}: ${v};\n`;
			}
			res += `}\n`;
			return res;
		}
		if (exportFormat === 'json') {
			return JSON.stringify({ name: themeName, mode: themeMode, tokens, auraLayers }, null, 2);
		}
		if (exportFormat === 'tailwind') {
			let res = `// tailwind.config.js theme colors\ncolors: {\n`;
			for (const [k, v] of Object.entries(tokens)) {
				res += `  '${k}': 'var(--${k})',\n`;
			}
			res += `}\n`;
			return res;
		}
		return '';
	});

	function copyExportCode() {
		navigator.clipboard.writeText(generatedCode);
		copySuccess = true;
		setTimeout(() => (copySuccess = false), 2000);
	}

	onMount(() => {
		themeState.init();
		const current = themeState.currentTheme;
		loadTheme(current);
		return () => {
			// Restore active theme when navigating away
			themeState.apply(themeState.current, themeState.bgStyle);
		};
	});
</script>

<SeoGeoOptimizer
	title="Theme & Aura Studio | Fractal Mandala"
	description="Interactive theme and aura gradient design studio with live WCAG contrast auditing and local persistence."
	url="https://fractalmandala.in/studio"
	siteUrl="https://fractalmandala.in"
	siteName="Fractal Mandala"
	type="website"
	language="en"
	locale="en_US"
/>

<div class="pagebox h100vh">
	<!-- Top Bar -->
	<div class="row ycenter gap8 xbetween wrap">
		<!-- Theme Name & Base Preset Selector -->
		<div class="row gap8 ycenter wrap">
			<select
				class="select"
				value={selectedBaseId}
				onchange={(e) => {
					const found = themeState.allThemes.find((t) => t.id === e.currentTarget.value);
					if (found) loadTheme(found);
				}}
			>
				<optgroup label="Preset Themes (41)">
					{#each THEMES as t (t.id)}
						<option value={t.id}>{t.name} ({t.mode})</option>
					{/each}
				</optgroup>
				{#if themeState.customThemes.length > 0}
					<optgroup label="My Custom Themes">
						{#each themeState.customThemes as ct (ct.id)}
							<option value={ct.id}>★ {ct.name}</option>
						{/each}
					</optgroup>
				{/if}
			</select>
			<div class="studio-actions">
				<!-- Plain vs Aura Toggle -->
				<button
					type="button"
					class="button-icon-pad"
					data-variant="primary"
					class:active={themeState.bgStyle === 'aura'}
					onclick={() => themeState.toggleBgStyle()}
				>
					{#if themeState.bgStyle === 'aura'}
						<Plain />
					{:else}
						<Aura />
					{/if}
				</button>

				<!-- Light / Dark Flip -->
				<button type="button" class="button-icon-pad" onclick={toggleMode}>
					{#if themeMode === 'dark'}
						<Sun />
					{:else}
						<Moon />
					{/if}
				</button>

				<!-- Randomize -->
				<button
					type="button"
					class="button-icon-pad"
					onclick={randomizeColors}
					title="Generate harmonious random accents"
				>
					<Random />
				</button>

				<!-- Reset -->
				<button
					type="button"
					class="button-icon-pad"
					onclick={() => {
						const found = THEMES.find((t) => t.id === selectedBaseId) ?? THEMES[0];
						loadTheme(found);
					}}
				>
					<Reset />
				</button>
			</div>
		</div>
		<!-- Action Controls -->
		<div class="row ycenter gap8">
			<!-- Save to Local Storage -->
			<input
				type="text"
				bind:value={themeName}
				class="input"
				style="width: 240px; text-align: left;"
				placeholder="Theme Name"
			/>
			<button type="button" class="button-icon-pad" onclick={saveToLocalStorage}>
				<Save />
			</button>
		</div>
	</div>

	<!-- Split Studio Layout -->
	<div class="grid grid-cols-2 gap32">
		<!-- Left: Interactive Live Preview Canvas -->
		<div class="box gap16">
			<!-- Canvas Header Demo -->
			<div
				class="row xbetween ycenter wrap gap12"
				style="border-bottom: 1px solid var(--border); padding-bottom: 1rem;"
			>
				<div class="column gap4">
					<span class="text-xs text-muted">BREADCRUMBS: DOCS / ESSAYS / THEOLOGY</span>
					<h2 class="text2xl w600" style="margin: 0; color: var(--text-primary);">
						The Architecture of Cosmic Perception
					</h2>
				</div>
				<div class="row gap8">
					<button type="button" class="studio-btn primary">Explore Series</button>
					<button type="button" class="studio-btn">Bookmark</button>
				</div>
			</div>

			<!-- Typography & Text Demo -->
			<div class="column gap12">
				<p class="text-base" style="color: var(--text-secondary); line-height: 1.6; margin: 0;">
					In ancient Vedic cosmologies, sound (<em style="color: var(--theme-color);">Śabda</em>) is
					not merely an acoustic vibration, but the metaphysical substrate of manifest reality. When
					consciousness vibrates, reality unfolds into recursive geometric mandalas.
				</p>

				<!-- Blockquote -->
				<blockquote
					style="border-left: 3px solid var(--theme-color); padding: 0.75rem 1rem; margin: 0; background: var(--bg-surface); border-radius: 0 8px 8px 0;"
				>
					<p style="color: var(--text-primary); font-style: italic; margin: 0;">
						“Whatever exists in this cosmos is energized by the subtle pulse of the primordial
						breath.”
					</p>
					<span class="text-xs text-muted" style="display: block; margin-top: 0.4rem;"
						>— Chāndogya Upaniṣad III.14.1</span
					>
				</blockquote>
			</div>

			<!-- Card Surface & Raised Grid Demo -->
			<div class="grid grid-cols-auto gap16">
				<div
					class="card blank box gap8"
					style="background: var(--bg-surface); border: 1px solid var(--border); padding: 1.25rem; border-radius: 12px;"
				>
					<div class="row xbetween ycenter">
						<span class="text-lg w600" style="color: var(--text-primary);">Surface Card Tier</span>
						<span class="studio-badge">Active</span>
					</div>
					<p class="text-sm" style="color: var(--text-secondary); margin: 0;">
						Rendered on <code style="font-family: monospace; color: var(--theme-color);"
							>--bg-surface</code
						>
						with <code style="font-family: monospace; color: var(--text-muted);">--border</code> outlines.
					</p>
					<div class="row gap8" style="margin-top: 0.5rem;">
						<span class="contrast-pill pass-aaa">AAA 8.4:1</span>
						<span class="text-xs text-muted">Text Primary</span>
					</div>
				</div>

				<div
					class="card blank box gap8"
					style="background: var(--bg-raised); border: 1px solid var(--border-subtle); padding: 1.25rem; border-radius: 12px;"
				>
					<div class="row xbetween ycenter">
						<span class="text-lg w600" style="color: var(--text-primary);">Raised Surface Tier</span
						>
						<span class="contrast-pill pass-aa">Interactive</span>
					</div>
					<p class="text-sm" style="color: var(--text-secondary); margin: 0;">
						Elevated container on <code style="font-family: monospace; color: var(--theme-color);"
							>--bg-raised</code
						> with subtle divider borders.
					</p>
					<div class="row gap8" style="margin-top: 0.5rem;">
						<button
							type="button"
							class="studio-btn"
							style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">Test Hover</button
						>
						<button
							type="button"
							class="studio-btn active"
							style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">Selected</button
						>
					</div>
				</div>
			</div>

			<!-- Terminal / Code Demo -->
			<div class="export-code-box" style="background: var(--bg-terminal);">
				<span style="color: #94A3B8;">// Live Token Engine Demonstration</span>
				<br />
				<span style="color: #F43F8E;">const</span> <span style="color: #38BDF8;">currentTheme</span>
				= &#123;
				<br />
				&nbsp;&nbsp;name: <span style="color: #A3E635;">"{themeName}"</span>,
				<br />
				&nbsp;&nbsp;mode: <span style="color: #FBBF24;">"{themeMode}"</span>,
				<br />
				&nbsp;&nbsp;accent:
				<span style="color: {tokens['theme-color']}; font-weight: bold;"
					>"{tokens['theme-color']}"</span
				>,
				<br />
				&nbsp;&nbsp;contrastRatio:
				<span style="color: #38BDF8;"
					>"{contrast(tokens['text-primary'] || '#000', tokens['bg'] || '#fff').toFixed(2)}:1"</span
				>
				<br />
				&#125;;
			</div>

			<!-- Form Inputs Demo -->
			<div
				class="row gap12 wrap ycenter"
				style="background: var(--bg-panel); padding: 1rem; border-radius: 8px; border: 1px solid var(--border);"
			>
				<input
					type="text"
					placeholder="Sample Form Input Field (--bg-input)"
					class="token-hex-input"
					style="flex: 1; text-align: left; padding: 0.5rem 0.75rem;"
				/>
				<button type="button" class="studio-btn primary">Submit Action</button>
			</div>
		</div>

		<!-- Right: Controls Sidebar -->
		<aside class="studio-sidebar">
			<!-- Controls Navigation Tabs -->
			<div class="studio-tabs">
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'surfaces'}
					onclick={() => (activeTab = 'surfaces')}
				>
					Surfaces
				</button>
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'typography'}
					onclick={() => (activeTab = 'typography')}
				>
					Typography
				</button>
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'borders'}
					onclick={() => (activeTab = 'borders')}
				>
					Borders & States
				</button>
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'aura'}
					onclick={() => (activeTab = 'aura')}
				>
					✨ Aura ({auraLayers.length})
				</button>
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'saved'}
					onclick={() => (activeTab = 'saved')}
				>
					Saved ({themeState.customThemes.length})
				</button>
				<button
					type="button"
					class="studio-tab"
					class:active={activeTab === 'export'}
					onclick={() => (activeTab = 'export')}
				>
					Export
				</button>
			</div>

			<!-- TAB 1: Surfaces -->
			{#if activeTab === 'surfaces'}
				<div class="studio-section">
					<h3 class="studio-section-title">Surface Elevation Tiers</h3>
					{#each CORE_TOKENS.filter((t) => t.category === 'surface') as token (token.key)}
						<div class="token-row">
							<div class="token-info">
								<span class="token-label">{token.label}</span>
								<span class="token-name">--{token.key}</span>
							</div>
							<div class="token-picker-wrap">
								<div
									class="token-color-preview"
									style="background: {tokens[token.key] || token.defaultVal}"
								>
									<input
										type="color"
										value={tokens[token.key] || token.defaultVal}
										oninput={(e) => updateToken(token.key, e.currentTarget.value)}
									/>
								</div>
								<input
									type="text"
									class="token-hex-input"
									value={tokens[token.key] || token.defaultVal}
									oninput={(e) => updateToken(token.key, e.currentTarget.value)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- TAB 2: Typography & Accents -->
			{#if activeTab === 'typography'}
				<div class="studio-section">
					<h3 class="studio-section-title">Typography & Brand Accents</h3>
					{#each CORE_TOKENS.filter((t) => t.category === 'typography' || t.category === 'accent') as token (token.key)}
						{@const score = getContrastScore(
							tokens[token.key] || token.defaultVal,
							tokens['bg'] || '#FFFFFF'
						)}
						<div class="token-row">
							<div class="token-info">
								<div class="row gap6 ycenter">
									<span class="token-label">{token.label}</span>
									<span class="contrast-pill {score.class}" title="WCAG contrast against --bg">
										{score.label}
										{score.ratio}
									</span>
								</div>
								<span class="token-name">--{token.key}</span>
							</div>
							<div class="token-picker-wrap">
								<div
									class="token-color-preview"
									style="background: {tokens[token.key] || token.defaultVal}"
								>
									<input
										type="color"
										value={tokens[token.key] || token.defaultVal}
										oninput={(e) => updateToken(token.key, e.currentTarget.value)}
									/>
								</div>
								<input
									type="text"
									class="token-hex-input"
									value={tokens[token.key] || token.defaultVal}
									oninput={(e) => updateToken(token.key, e.currentTarget.value)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- TAB 3: Borders & States -->
			{#if activeTab === 'borders'}
				<div class="studio-section">
					<h3 class="studio-section-title">Borders & Interactive States</h3>
					{#each CORE_TOKENS.filter((t) => t.category === 'border' || t.category === 'state') as token (token.key)}
						<div class="token-row">
							<div class="token-info">
								<span class="token-label">{token.label}</span>
								<span class="token-name">--{token.key}</span>
							</div>
							<div class="token-picker-wrap">
								<div
									class="token-color-preview"
									style="background: {tokens[token.key] || token.defaultVal}"
								>
									<input
										type="color"
										value={tokens[token.key] || token.defaultVal}
										oninput={(e) => updateToken(token.key, e.currentTarget.value)}
									/>
								</div>
								<input
									type="text"
									class="token-hex-input"
									value={tokens[token.key] || token.defaultVal}
									oninput={(e) => updateToken(token.key, e.currentTarget.value)}
								/>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- TAB 4: Aura Layers -->
			{#if activeTab === 'aura'}
				<div class="studio-section">
					<div class="row xbetween ycenter">
						<h3 class="studio-section-title">Aura Gradient Stack</h3>
						<button
							type="button"
							class="studio-btn"
							style="font-size: 0.75rem;"
							onclick={addAuraLayer}
						>
							+ Add Layer
						</button>
					</div>

					<!-- Choose from 203 Aura Presets -->
					<div class="column gap4">
						<span class="text-xs text-muted">Load Preset Aura (203 options)</span>
						<select
							class="layer-select"
							value={selectedAuraPresetId}
							onchange={(e) => loadAuraPreset(e.currentTarget.value)}
						>
							{#each AURA_PRESETS as aura (aura.id)}
								<option value={aura.id}>
									{aura.name} ({aura.category} - {aura.mood})
								</option>
							{/each}
						</select>
					</div>

					<!-- Editable Layer Cards -->
					<div class="column gap8">
						{#each auraLayers as layer, i (i)}
							<div class="layer-card">
								<div class="layer-header">
									<span class="layer-title">Layer {i + 1}</span>
									{#if auraLayers.length > 1}
										<button
											type="button"
											class="studio-btn"
											style="font-size: 0.7rem; padding: 0.15rem 0.4rem;"
											onclick={() => removeAuraLayer(i)}
										>
											✕ Remove
										</button>
									{/if}
								</div>

								<!-- Background Gradient Input -->
								<div class="column gap2">
									<span class="layer-label">CSS Background Gradient</span>
									<textarea
										class="token-hex-input"
										style="width: 100%; height: 50px; text-align: left; resize: vertical;"
										bind:value={layer.background}
										oninput={() => applyLiveChanges()}></textarea>
								</div>

								<!-- Blend Mode & Blur -->
								<div class="grid grid-cols-2 gap8">
									<div class="column gap2">
										<span class="layer-label">Blend Mode</span>
										<select
											class="layer-select"
											bind:value={layer.blendMode}
											onchange={() => applyLiveChanges()}
										>
											<option value="normal">normal</option>
											<option value="hard-light">hard-light</option>
											<option value="soft-light">soft-light</option>
											<option value="overlay">overlay</option>
											<option value="screen">screen</option>
											<option value="multiply">multiply</option>
											<option value="color-dodge">color-dodge</option>
											<option value="difference">difference</option>
										</select>
									</div>

									<div class="column gap2">
										<span class="layer-label"
											>Blur Radius ({layer.blurMobile || layer.blur || 75}px)</span
										>
										<input
											type="range"
											min="10"
											max="200"
											class="layer-slider"
											value={layer.blurMobile || layer.blur || 75}
											oninput={(e) => {
												layer.blurMobile = parseInt(e.currentTarget.value);
												layer.blur = parseInt(e.currentTarget.value);
												applyLiveChanges();
											}}
										/>
									</div>
								</div>

								<!-- Opacity -->
								<div class="layer-control-row">
									<span class="layer-label"
										>Opacity ({Math.round((layer.opacity ?? 1) * 100)}%)</span
									>
									<input
										type="range"
										min="0"
										max="1"
										step="0.05"
										class="layer-slider"
										value={layer.opacity ?? 1}
										oninput={(e) => {
											layer.opacity = parseFloat(e.currentTarget.value);
											applyLiveChanges();
										}}
									/>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- TAB 5: Saved Themes -->
			{#if activeTab === 'saved'}
				<div class="studio-section">
					<h3 class="studio-section-title">My Custom Themes</h3>
					{#if themeState.customThemes.length === 0}
						<p class="text-sm text-muted" style="margin: 0.5rem 0;">
							No custom themes saved yet. Customize tokens and click <strong>"Save Theme"</strong> to
							persist your themes in local storage!
						</p>
					{:else}
						<div class="column gap8">
							{#each themeState.customThemes as custom (custom.id)}
								<div class="custom-theme-item">
									<div class="column gap2">
										<span class="text-sm w600" style="color: var(--text-primary);"
											>{custom.name}</span
										>
										<span class="text-xs text-muted"
											>{custom.mode.toUpperCase()} • {custom.auraName}</span
										>
									</div>
									<div class="row gap4">
										<button
											type="button"
											class="studio-btn"
											style="font-size: 0.75rem; padding: 0.25rem 0.5rem;"
											onclick={() => loadTheme(custom)}
										>
											Edit
										</button>
										<button
											type="button"
											class="studio-btn"
											style="font-size: 0.75rem; padding: 0.25rem 0.5rem; color: #DC2626;"
											onclick={() => deleteCustomTheme(custom.id)}
										>
											✕
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- TAB 6: Export -->
			{#if activeTab === 'export'}
				<div class="studio-section">
					<h3 class="studio-section-title">Export Code</h3>
					<div class="row gap4">
						<button
							type="button"
							class="studio-btn"
							class:active={exportFormat === 'sass'}
							onclick={() => (exportFormat = 'sass')}
						>
							SASS
						</button>
						<button
							type="button"
							class="studio-btn"
							class:active={exportFormat === 'css'}
							onclick={() => (exportFormat = 'css')}
						>
							CSS
						</button>
						<button
							type="button"
							class="studio-btn"
							class:active={exportFormat === 'json'}
							onclick={() => (exportFormat = 'json')}
						>
							JSON
						</button>
						<button
							type="button"
							class="studio-btn"
							class:active={exportFormat === 'tailwind'}
							onclick={() => (exportFormat = 'tailwind')}
						>
							Tailwind
						</button>
					</div>

					<div class="export-code-box">
						{generatedCode}
					</div>

					<button type="button" class="studio-btn primary" onclick={copyExportCode}>
						{copySuccess ? '✓ Copied to Clipboard!' : '📋 Copy Code'}
					</button>
				</div>
			{/if}
		</aside>
	</div>
</div>
