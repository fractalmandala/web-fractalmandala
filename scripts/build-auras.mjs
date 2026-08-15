import fs from 'node:fs';
import path from 'node:path';

const aurasPath = path.resolve('../vendors/gradientsaura/aura_gradients.json');
const auras = JSON.parse(fs.readFileSync(aurasPath, 'utf8'));

const aurasById = {};
for (const a of auras) {
	aurasById[a.id] = a;
}

const mapping = {
	'theme-light-default': 'mesh-frosted-jade',
	'theme-himalaya-light': 'glacier-mist',
	'theme-editorial-light': 'warm-ash',
	'theme-space-light': 'flux-sage-smoke',
	'theme-sun-light': 'golden-hour',
	'theme-monochrono-light': 'lattice-light-weave',
	'theme-molly-light': 'glass-aqua-bubble',
	'theme-malana-light': 'grain-terracotta',
	'theme-coresync-light': 'grain-concrete',
	'theme-studio-light': 'flux-milk-tea',
	'theme-matcha-light': 'mesh-alpine-meadow',
	'theme-sakura-light': 'mesh-sakura',
	'theme-nordic-frost-light': 'arctic-frost',
	'theme-desert-dune-light': 'grain-desert-sand',
	'theme-lavender-mist-light': 'mesh-lavender-haze',
	'theme-botanical-light': 'nebula-mint-cloud',
	'theme-clay-studio-light': 'mesh-saffron-silk',
	'theme-solaris-light': 'mesh-citrine',
	'theme-cyberpunk-day-light': 'sunrise-drift',
	'theme-copper-patina-light': 'ocean-pearl',
	'theme-dracula-light': 'orchid-bloom',
	'theme-lagoona-dark': 'deep-lagoon',
	'theme-frozen-dark': 'arctic-dawn',
	'theme-night-dark': 'midnight-horizon',
	'theme-inkworm-dark': 'mesh-bourbon-smoke',
	'theme-monochrono-dark': 'mesh-graphite',
	'theme-fouram-dark': 'neon-skyline',
	'theme-wintercame-dark': 'eclipse-flare',
	'theme-sun-dark': 'glass-liquid-cyan',
	'theme-console-dark': 'greenflare',
	'theme-dracula-dark': 'violet-horizon',
	'theme-catppuccin-mocha': 'solstice-veil',
	'theme-nord-dark': 'aurora-beams',
	'theme-gruvbox-dark': 'copper-shadow',
	'theme-onedark-pro': 'deep-cosmos',
	'theme-rose-pine-dark': 'nebula-midnight-rose',
	'theme-midnight-emerald-dark': 'glass-emerald-lens',
	'theme-obsidian-crimson-dark': 'blood-aurora',
	'theme-synthwave-dark': 'mesh-neon-tokyo',
	'theme-deep-ocean-dark': 'deep-current',
	'theme-amethyst-void-dark': 'starlit-abyss'
};

// 1. Generate _auras.sass
let sass = `// Aura Gradients Engine for Fractal Mandala
// Provides GPU-accelerated atmospheric gradient blend layers matched to all 41 themes.
// Controlled via [data-bg-style="aura"] on <html>.
// Format: Indented SASS (strictly single tabs, no braces, no semicolons)

[data-bg-style="plain"]
\t.aura-ambient
\t\tdisplay: none !important

[data-bg-style="aura"]
\t.aura-ambient
\t\tdisplay: block
\t.fullwrapper, .appshell, .bodywrapper, .appbody
\t\tbackground: transparent !important
\t\tbackground-color: transparent !important
\t\tbackground-image: none !important
\t.newheader, .appheader
\t\tbackground: color-mix(in srgb, var(--bg) 75%, transparent) !important
\t\tbackdrop-filter: blur(12px)
\t\t-webkit-backdrop-filter: blur(12px)

.aura-ambient
\tposition: fixed
\tinset: 0
\tz-index: 0
\toverflow: hidden
\tpointer-events: none
\tcontain: strict
\ttransform: translateZ(0)
\twill-change: transform

.fullwrapper, .appshell
\tposition: relative
\tz-index: 1

.aura-layer
\tposition: absolute
\tinset: 0
\ttransform: translateZ(0)
\twill-change: transform
\tpointer-events: none

`;

for (const [themeId, auraId] of Object.entries(mapping)) {
	const a = aurasById[auraId];
	sass += `// ${themeId} -> ${a.name} (${a.id})\n`;
	sass += `.${themeId}[data-bg-style="aura"] .aura-ambient,\n`;
	sass += `[data-theme="${themeId}"][data-bg-style="aura"] .aura-ambient\n`;

	const layers = a.tailwindConfig?.layers || a.layers;
	layers.forEach((l, i) => {
		const idx = i + 1;
		const cleanBg = l.background.replace(/\s+/g, ' ').trim();
		const blend = l.blendMode || 'normal';
		const blur = l.blurMobile || (l.blur ? Math.min(Math.round(l.blur * 1.5), 90) : 75);
		const op = l.opacity !== undefined ? l.opacity : 1;

		sass += `\t.aura-layer-${idx}\n`;
		sass += `\t\tbackground: ${cleanBg}\n`;
		sass += `\t\tmix-blend-mode: ${blend}\n`;
		sass += `\t\tfilter: blur(${blur}px)\n`;
		if (op !== 1) {
			sass += `\t\topacity: ${op}\n`;
		}
	});
	sass += `\n`;
}

fs.writeFileSync('./src/lib/styles/_auras.sass', sass, 'utf8');
console.log('✓ Generated src/lib/styles/_auras.sass');

// 2. Parse tokens for each theme from _themes.sass
const themesFile = path.resolve('./src/lib/styles/_themes.sass');
const themesContent = fs.readFileSync(themesFile, 'utf8');
const themeTokensMap = {};
let curId = null;

for (const line of themesContent.split('\n')) {
	const matchTheme = line.match(/^(\.theme-[a-zA-Z0-9-]+)/);
	if (matchTheme) {
		curId = matchTheme[1].replace(/^\./, '');
		themeTokensMap[curId] = {};
	} else if (curId && (line.startsWith('\t--') || line.startsWith('  --'))) {
		const matchToken = line.match(/--([a-zA-Z0-9-]+):\s*(#[a-fA-F0-9]{3,8})/);
		if (matchToken) {
			themeTokensMap[curId][matchToken[1]] = matchToken[2];
		}
	}
}

// 3. Generate src/lib/utils/theme.svelte.ts
const rawThemes = [
	{ id: "theme-light-default", name: "Default Light", mode: "light", description: "Emerald accent on clean white" },
	{ id: "theme-himalaya-light", name: "Himalaya Light", mode: "light", description: "Alpine slate & azure on mist" },
	{ id: "theme-editorial-light", name: "Editorial Light", mode: "light", description: "Forest olive on classic book paper" },
	{ id: "theme-space-light", name: "Space Light", mode: "light", description: "Pine mint & frost green canvas" },
	{ id: "theme-sun-light", name: "Sun Light", mode: "light", description: "Terracotta amber & sunbaked clay" },
	{ id: "theme-monochrono-light", name: "Monochrono Light", mode: "light", description: "High contrast minimalist ink & indigo" },
	{ id: "theme-molly-light", name: "Molly Light", mode: "light", description: "Sky azure & ocean periwinkle" },
	{ id: "theme-malana-light", name: "Malana Light", mode: "light", description: "Cream sandstone & warm cinnamon" },
	{ id: "theme-coresync-light", name: "Coresync Light", mode: "light", description: "Industrial titanium & flame orange" },
	{ id: "theme-studio-light", name: "Studio Light", mode: "light", description: "Architectural bone & warm ochre" },
	{ id: "theme-matcha-light", name: "Matcha Light", mode: "light", description: "Zen bamboo & sweet matcha tea" },
	{ id: "theme-sakura-light", name: "Sakura Light", mode: "light", description: "Cherry blossom & rose quartz" },
	{ id: "theme-nordic-frost-light", name: "Nordic Frost Light", mode: "light", description: "Glacier ice & deep fjord blue" },
	{ id: "theme-desert-dune-light", name: "Desert Dune Light", mode: "light", description: "Sahara golden sand & warm ochre" },
	{ id: "theme-lavender-mist-light", name: "Lavender Mist Light", mode: "light", description: "Lilac garden & royal amethyst" },
	{ id: "theme-botanical-light", name: "Botanical Light", mode: "light", description: "Lush fern herbarium & forest sage" },
	{ id: "theme-clay-studio-light", name: "Clay Studio Light", mode: "light", description: "Terracotta pottery & warm bisque" },
	{ id: "theme-solaris-light", name: "Solaris Light", mode: "light", description: "Golden sunbeam & marigold" },
	{ id: "theme-cyberpunk-day-light", name: "Cyberpunk Day Light", mode: "light", description: "Neo-Shinjuku daylight & neon fuchsia" },
	{ id: "theme-copper-patina-light", name: "Copper Patina Light", mode: "light", description: "Oxidized verdigris & Aegean teal" },
	{ id: "theme-dracula-light", name: "Dracula Light", mode: "light", description: "Alucard gothic cream & crimson coral" },
	{ id: "theme-lagoona-dark", name: "Lagoona Dark", mode: "dark", description: "Deep abyss neon cyan & electric aqua" },
	{ id: "theme-frozen-dark", name: "Frozen Dark", mode: "dark", description: "Nordic polar sage & frost carbon" },
	{ id: "theme-night-dark", name: "Night Dark", mode: "dark", description: "Tokyo night indigo & cyber lime" },
	{ id: "theme-inkworm-dark", name: "Inkworm Dark", mode: "dark", description: "Vintage espresso & warm amber" },
	{ id: "theme-monochrono-dark", name: "Monochrono Dark", mode: "dark", description: "Pitch black high contrast titanium" },
	{ id: "theme-fouram-dark", name: "4 AM Dark", mode: "dark", description: "Midnight neon magenta & electric mint" },
	{ id: "theme-wintercame-dark", name: "Winter Came Dark", mode: "dark", description: "Obsidian charcoal & molten ember" },
	{ id: "theme-sun-dark", name: "Sun Dark", mode: "dark", description: "Graphite carbon & cyber aqua" },
	{ id: "theme-console-dark", name: "Console Dark", mode: "dark", description: "CRT Matrix phosphor green & soot" },
	{ id: "theme-dracula-dark", name: "Dracula Dark", mode: "dark", description: "Classic gothic vampire orchid & pink" },
	{ id: "theme-catppuccin-mocha", name: "Catppuccin Mocha", mode: "dark", description: "Cozy pastel velvet & mauve" },
	{ id: "theme-nord-dark", name: "Nord Dark", mode: "dark", description: "Arctic polar night & frost aurora" },
	{ id: "theme-gruvbox-dark", name: "Gruvbox Dark", mode: "dark", description: "Retro warm groove & saffron gold" },
	{ id: "theme-onedark-pro", name: "One Dark Pro", mode: "dark", description: "Atom slate blue & coral mint" },
	{ id: "theme-rose-pine-dark", name: "Rosé Pine Dark", mode: "dark", description: "SoHo midnight rose & pine" },
	{ id: "theme-midnight-emerald-dark", name: "Midnight Emerald Dark", mode: "dark", description: "Deep malachite forest & glowing jade" },
	{ id: "theme-obsidian-crimson-dark", name: "Obsidian Crimson Dark", mode: "dark", description: "Gothic bloodstone & velvet ruby" },
	{ id: "theme-synthwave-dark", name: "Synthwave 84 Dark", mode: "dark", description: "Retro 80s neon violet & laser cyan" },
	{ id: "theme-deep-ocean-dark", name: "Deep Ocean Dark", mode: "dark", description: "Bioluminescent abyss & aquamarine" },
	{ id: "theme-amethyst-void-dark", name: "Amethyst Void Dark", mode: "dark", description: "Cosmic deep violet & starlight pink" }
];

let ts = `/**
 * Theme & Aura Gradient Management Module for Fractal Mandala
 * Supports 41 curated themes, interactive Theme & Aura Studio, and custom theme storage
 * Default theme: .theme-light-default
 */

export type BgStyle = 'plain' | 'aura';

export interface AuraLayer {
	layer: number;
	background: string;
	blendMode: string;
	blurMobile?: number;
	blurDesktop?: number;
	blur?: number;
	opacity?: number;
}

export interface AuraPreset {
	id: string;
	name: string;
	category: string;
	mood: string;
	dark: boolean;
	baseColor: string;
	textColor: string;
	description: string;
	layers: AuraLayer[];
}

export interface ThemeInfo {
	id: string;
	name: string;
	mode: 'light' | 'dark';
	accentColor: string;
	bgColor: string;
	textColor: string;
	description: string;
	auraId: string;
	auraName: string;
	auraDescription: string;
	tokens: Record<string, string>;
	isCustom?: boolean;
	customAura?: {
		id: string;
		name: string;
		description: string;
		layers: AuraLayer[];
	};
}

export interface TokenMeta {
	key: string;
	label: string;
	category: 'surface' | 'typography' | 'border' | 'state' | 'accent';
	description: string;
	defaultVal: string;
}

export const CORE_TOKENS: TokenMeta[] = [
	{ key: 'bg', label: 'App Canvas Base', category: 'surface', description: 'Deepest backdrop surface of the application', defaultVal: '#FFFFFF' },
	{ key: 'bg-surface', label: 'Card Surface', category: 'surface', description: 'Primary card and content container background', defaultVal: '#F8F9FA' },
	{ key: 'bg-raised', label: 'Raised Elements', category: 'surface', description: 'Elevated popovers, floating headers, tooltips', defaultVal: '#FFFFFF' },
	{ key: 'bg-panel', label: 'Sidebars & Panels', category: 'surface', description: 'Navbars, lateral sidebars, drawer panels', defaultVal: '#F1F3F5' },
	{ key: 'bg-footer', label: 'Footer Surface', category: 'surface', description: 'Bottom footer area', defaultVal: '#E9ECEF' },
	{ key: 'bg-popover', label: 'Popover & Modals', category: 'surface', description: 'Modal dialogs, dropdowns, popup menus', defaultVal: '#FFFFFF' },
	{ key: 'bg-dialog', label: 'Dialog Backdrop', category: 'surface', description: 'Dialog card background', defaultVal: '#FFFFFF' },
	{ key: 'bg-terminal', label: 'Code & Terminal', category: 'surface', description: 'Terminal blocks and code view background', defaultVal: '#0F172A' },
	{ key: 'bg-input', label: 'Form Inputs', category: 'surface', description: 'Input fields, textareas, select boxes', defaultVal: '#FFFFFF' },
	{ key: 'bg-canvas', label: 'Canvas / Viewport', category: 'surface', description: 'Outer workspace canvas background', defaultVal: '#F8F9FA' },
	{ key: 'border', label: 'Standard Border', category: 'border', description: 'Primary borders, card outlines, separators', defaultVal: '#E2E8F0' },
	{ key: 'border-subtle', label: 'Subtle Border', category: 'border', description: 'Faint divider lines and inner item borders', defaultVal: '#EDF2F7' },
	{ key: 'text-primary', label: 'Primary Text', category: 'typography', description: 'Headings, titles, high-contrast text', defaultVal: '#0F172A' },
	{ key: 'text-secondary', label: 'Secondary Text', category: 'typography', description: 'Body paragraphs, descriptions, labels', defaultVal: '#475569' },
	{ key: 'text-muted', label: 'Muted Text', category: 'typography', description: 'Captions, timestamps, metadata', defaultVal: '#7F91AA' },
	{ key: 'text-inverse', label: 'Inverse Text', category: 'typography', description: 'Contrast text on brand/accent buttons', defaultVal: '#FFFFFF' },
	{ key: 'state-hover', label: 'Hover State', category: 'state', description: 'Background tint on button and card hover', defaultVal: '#E2E8F0' },
	{ key: 'state-hover-subtle', label: 'Subtle Hover', category: 'state', description: 'Gentle hover state on list items', defaultVal: '#F1F5F9' },
	{ key: 'state-selected', label: 'Selected State', category: 'state', description: 'Active tab, selected item highlight', defaultVal: '#CBD5E1' },
	{ key: 'theme-color', label: 'Brand Accent', category: 'accent', description: 'Primary brand action color, active badges, highlights', defaultVal: '#04825B' },
	{ key: 'theme-color-alt', label: 'Accent Alternate', category: 'accent', description: 'Hover state for brand accent buttons', defaultVal: '#047857' },
];

export const THEMES: ThemeInfo[] = [
`;

rawThemes.forEach(t => {
	const aura = aurasById[mapping[t.id]];
	const tokens = themeTokensMap[t.id] || {};
	const accentColor = tokens['theme-color'] || '#04825B';
	const bgColor = tokens['bg'] || '#FFFFFF';
	const textColor = tokens['text-primary'] || '#0F172A';

	ts += `\t{\n`;
	ts += `\t\tid: '${t.id}',\n`;
	ts += `\t\tname: '${t.name}',\n`;
	ts += `\t\tmode: '${t.mode}',\n`;
	ts += `\t\taccentColor: '${accentColor}',\n`;
	ts += `\t\tbgColor: '${bgColor}',\n`;
	ts += `\t\ttextColor: '${textColor}',\n`;
	ts += `\t\tdescription: '${t.description}',\n`;
	ts += `\t\tauraId: '${aura.id}',\n`;
	ts += `\t\tauraName: '${aura.name}',\n`;
	ts += `\t\tauraDescription: '${aura.description.replace(/'/g, "\\'")}',\n`;
	ts += `\t\ttokens: ${JSON.stringify(tokens, null, 2).replace(/\n/g, '\n\t\t')}\n`;
	ts += `\t},\n`;
});

ts += `];

export const AURA_PRESETS: AuraPreset[] = [
`;

auras.forEach(a => {
	const layers = (a.tailwindConfig?.layers || a.layers).map((l, i) => ({
		layer: i + 1,
		background: l.background.replace(/\s+/g, ' ').trim(),
		blendMode: l.blendMode || 'normal',
		blurMobile: l.blurMobile || (l.blur ? Math.min(Math.round(l.blur * 1.5), 90) : 75),
		blurDesktop: l.blurDesktop || (l.blur ? Math.round(l.blur * 2.5) : 100),
		opacity: l.opacity !== undefined ? l.opacity : 1
	}));

	ts += `\t{\n`;
	ts += `\t\tid: '${a.id}',\n`;
	ts += `\t\tname: '${a.name.replace(/'/g, "\\'")}',\n`;
	ts += `\t\tcategory: '${a.category}',\n`;
	ts += `\t\tmood: '${a.mood}',\n`;
	ts += `\t\tdark: ${Boolean(a.dark)},\n`;
	ts += `\t\tbaseColor: '${a.baseColor}',\n`;
	ts += `\t\ttextColor: '${a.textColor}',\n`;
	ts += `\t\tdescription: '${(a.description || '').replace(/'/g, "\\'")}',\n`;
	ts += `\t\tlayers: ${JSON.stringify(layers, null, 2).replace(/\n/g, '\n\t\t')}\n`;
	ts += `\t},\n`;
});

ts += `];

export const DEFAULT_THEME_ID = 'theme-light-default';

export const LIGHT_THEMES = THEMES.filter((t) => t.mode === 'light');
export const DARK_THEMES = THEMES.filter((t) => t.mode === 'dark');

class ThemeState {
	current = $state<string>(DEFAULT_THEME_ID);
	bgStyle = $state<BgStyle>('plain');
	isOpen = $state<boolean>(false);
	customThemes = $state<ThemeInfo[]>([]);
	activeCustomOverrides = $state<Record<string, string> | null>(null);
	activeCustomAuraLayers = $state<AuraLayer[] | null>(null);

	get allThemes(): ThemeInfo[] {
		return [...THEMES, ...this.customThemes];
	}

	get currentTheme(): ThemeInfo {
		return this.allThemes.find((t) => t.id === this.current) ?? THEMES[0];
	}

	get isDark(): boolean {
		return this.currentTheme.mode === 'dark';
	}

	get isAura(): boolean {
		return this.bgStyle === 'aura';
	}

	init() {
		if (typeof window === 'undefined') return;

		// Load custom themes from localStorage
		try {
			const savedCustom = localStorage.getItem('customThemes');
			if (savedCustom) {
				const parsed = JSON.parse(savedCustom);
				if (Array.isArray(parsed)) {
					this.customThemes = parsed;
				}
			}
		} catch {
			this.customThemes = [];
		}

		const savedTheme = localStorage.getItem('theme');
		if (savedTheme && this.allThemes.some((t) => t.id === savedTheme)) {
			this.current = savedTheme;
		} else {
			this.current = DEFAULT_THEME_ID;
		}

		const savedBgStyle = localStorage.getItem('bgStyle') as BgStyle | null;
		if (savedBgStyle === 'aura' || savedBgStyle === 'plain') {
			this.bgStyle = savedBgStyle;
		} else {
			this.bgStyle = 'plain';
		}

		this.apply(this.current, this.bgStyle);
	}

	setTheme(id: string) {
		const target = this.allThemes.find((t) => t.id === id);
		if (!target) return;

		this.current = id;
		if (target.isCustom && target.tokens) {
			this.activeCustomOverrides = target.tokens;
			this.activeCustomAuraLayers = target.customAura?.layers ?? null;
		} else {
			this.activeCustomOverrides = null;
			this.activeCustomAuraLayers = null;
		}

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('theme', id);
			} catch {}
			this.apply(id, this.bgStyle);
		}
	}

	setBgStyle(style: BgStyle) {
		this.bgStyle = style;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('bgStyle', style);
			} catch {}
			this.apply(this.current, style);
		}
	}

	toggleBgStyle() {
		this.setBgStyle(this.bgStyle === 'aura' ? 'plain' : 'aura');
	}

	toggleMode() {
		const targetMode = this.isDark ? 'light' : 'dark';
		const matching = this.allThemes.filter((t) => t.mode === targetMode);
		if (targetMode === 'light') {
			this.setTheme(DEFAULT_THEME_ID);
		} else {
			const candidate = matching.find((t) => t.id === 'theme-night-dark') ?? matching[0];
			if (candidate) this.setTheme(candidate.id);
		}
	}

	cycleNext() {
		const list = this.allThemes;
		const idx = list.findIndex((t) => t.id === this.current);
		const nextIdx = (idx + 1) % list.length;
		this.setTheme(list[nextIdx].id);
	}

	cycleRandom() {
		const pool = this.allThemes.filter((t) => t.id !== this.current);
		const randomTheme = pool[Math.floor(Math.random() * pool.length)];
		if (randomTheme) {
			this.setTheme(randomTheme.id);
		}
	}

	resetDefault() {
		this.activeCustomOverrides = null;
		this.activeCustomAuraLayers = null;
		this.clearCustomOverrides();
		this.setTheme(DEFAULT_THEME_ID);
		this.setBgStyle('plain');
	}

	togglePicker() {
		this.isOpen = !this.isOpen;
	}

	closePicker() {
		this.isOpen = false;
	}

	openPicker() {
		this.isOpen = true;
	}

	saveCustomTheme(custom: {
		id?: string;
		name: string;
		mode: 'light' | 'dark';
		description?: string;
		tokens: Record<string, string>;
		aura?: { id: string; name: string; description: string; layers: AuraLayer[] };
	}): ThemeInfo {
		const id = custom.id || ('custom-' + Date.now().toString(36));
		const themeInfo: ThemeInfo = {
			id,
			name: custom.name,
			mode: custom.mode,
			accentColor: custom.tokens['theme-color'] || '#04825B',
			bgColor: custom.tokens['bg'] || (custom.mode === 'dark' ? '#0F172A' : '#FFFFFF'),
			textColor: custom.tokens['text-primary'] || (custom.mode === 'dark' ? '#F8FAFC' : '#0F172A'),
			description: custom.description || 'User created custom theme',
			auraId: custom.aura?.id || 'custom-aura',
			auraName: custom.aura?.name || 'Custom Aura',
			auraDescription: custom.aura?.description || 'Custom crafted gradient bloom',
			tokens: custom.tokens,
			isCustom: true,
			customAura: custom.aura
		};

		const existingIdx = this.customThemes.findIndex(t => t.id === id);
		if (existingIdx >= 0) {
			this.customThemes[existingIdx] = themeInfo;
		} else {
			this.customThemes = [...this.customThemes, themeInfo];
		}

		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
			} catch {}
		}

		this.setTheme(id);
		return themeInfo;
	}

	deleteCustomTheme(id: string) {
		this.customThemes = this.customThemes.filter(t => t.id !== id);
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('customThemes', JSON.stringify(this.customThemes));
			} catch {}
		}
		if (this.current === id) {
			this.resetDefault();
		}
	}

	applyCustomOverrides(tokens: Record<string, string>, auraLayers?: AuraLayer[]) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		this.activeCustomOverrides = tokens;
		if (auraLayers) this.activeCustomAuraLayers = auraLayers;

		for (const [key, val] of Object.entries(tokens)) {
			root.style.setProperty('--' + key, val);
		}
	}

	clearCustomOverrides() {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		this.activeCustomOverrides = null;
		this.activeCustomAuraLayers = null;

		for (const token of CORE_TOKENS) {
			root.style.removeProperty('--' + token.key);
		}
	}

	apply(id: string, style?: BgStyle) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const currentStyle = style ?? this.bgStyle;

		// Clear inline token properties first
		this.clearCustomOverrides();

		// Remove all theme classes
		for (const theme of this.allThemes) {
			root.classList.remove(theme.id);
		}

		// Apply target theme class
		root.classList.add(id);

		const theme = this.allThemes.find((t) => t.id === id);
		if (theme) {
			root.setAttribute('data-theme', theme.id);
			root.setAttribute('data-mode', theme.mode);
			root.setAttribute('data-bg-style', currentStyle);
			root.style.colorScheme = theme.mode;

			if (theme.isCustom && theme.tokens) {
				this.applyCustomOverrides(theme.tokens, theme.customAura?.layers);
			}
		}
	}
}

export const themeState = new ThemeState();
`;

fs.writeFileSync('./src/lib/utils/theme.svelte.ts', ts, 'utf8');
console.log('✓ Generated src/lib/utils/theme.svelte.ts with Custom Theme Engine and AURA_PRESETS');
