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

// 2. Generate src/lib/utils/theme.svelte.ts
const rawThemes = [
	{ id: "theme-light-default", name: "Default Light", mode: "light", accentColor: "#059669", bgColor: "#FFFFFF", textColor: "#0F172A", description: "Emerald accent on clean white" },
	{ id: "theme-himalaya-light", name: "Himalaya Light", mode: "light", accentColor: "#2563EB", bgColor: "#F8FAFC", textColor: "#0F172A", description: "Alpine slate & azure on mist" },
	{ id: "theme-editorial-light", name: "Editorial Light", mode: "light", accentColor: "#2E5A36", bgColor: "#FAF8F5", textColor: "#232220", description: "Forest olive on classic book paper" },
	{ id: "theme-space-light", name: "Space Light", mode: "light", accentColor: "#0D7A4D", bgColor: "#F4F8F6", textColor: "#0D261C", description: "Pine mint & frost green canvas" },
	{ id: "theme-sun-light", name: "Sun Light", mode: "light", accentColor: "#C2542D", bgColor: "#FAF6F0", textColor: "#2E1E14", description: "Terracotta amber & sunbaked clay" },
	{ id: "theme-monochrono-light", name: "Monochrono Light", mode: "light", accentColor: "#312E81", bgColor: "#FFFFFF", textColor: "#09090B", description: "High contrast minimalist ink & indigo" },
	{ id: "theme-molly-light", name: "Molly Light", mode: "light", accentColor: "#0284C7", bgColor: "#F0F7FF", textColor: "#0B2545", description: "Sky azure & ocean periwinkle" },
	{ id: "theme-malana-light", name: "Malana Light", mode: "light", accentColor: "#D95D24", bgColor: "#FCF9F2", textColor: "#211812", description: "Cream sandstone & warm cinnamon" },
	{ id: "theme-coresync-light", name: "Coresync Light", mode: "light", accentColor: "#FF4500", bgColor: "#E6E8EC", textColor: "#111622", description: "Industrial titanium & flame orange" },
	{ id: "theme-studio-light", name: "Studio Light", mode: "light", accentColor: "#C99436", bgColor: "#F4F0E8", textColor: "#1C1A17", description: "Architectural bone & warm ochre" },
	{ id: "theme-matcha-light", name: "Matcha Light", mode: "light", accentColor: "#4D7C0F", bgColor: "#F5F7F2", textColor: "#1C2719", description: "Zen bamboo & sweet matcha tea" },
	{ id: "theme-sakura-light", name: "Sakura Light", mode: "light", accentColor: "#DB2777", bgColor: "#FDF7F8", textColor: "#331622", description: "Cherry blossom & rose quartz" },
	{ id: "theme-nordic-frost-light", name: "Nordic Frost Light", mode: "light", accentColor: "#0284C7", bgColor: "#F4FAFC", textColor: "#0C232F", description: "Glacier ice & deep fjord blue" },
	{ id: "theme-desert-dune-light", name: "Desert Dune Light", mode: "light", accentColor: "#D97706", bgColor: "#FDF9F0", textColor: "#291F14", description: "Sahara golden sand & warm ochre" },
	{ id: "theme-lavender-mist-light", name: "Lavender Mist Light", mode: "light", accentColor: "#7C3AED", bgColor: "#FAF8FD", textColor: "#221633", description: "Lilac garden & royal amethyst" },
	{ id: "theme-botanical-light", name: "Botanical Light", mode: "light", accentColor: "#16A34A", bgColor: "#F7FAF6", textColor: "#182819", description: "Lush fern herbarium & forest sage" },
	{ id: "theme-clay-studio-light", name: "Clay Studio Light", mode: "light", accentColor: "#B45309", bgColor: "#FAF5F0", textColor: "#2C1A12", description: "Terracotta pottery & warm bisque" },
	{ id: "theme-solaris-light", name: "Solaris Light", mode: "light", accentColor: "#D97706", bgColor: "#FFFCF2", textColor: "#291E04", description: "Golden sunbeam & marigold" },
	{ id: "theme-cyberpunk-day-light", name: "Cyberpunk Day Light", mode: "light", accentColor: "#E11D48", bgColor: "#FDFEFA", textColor: "#15102A", description: "Neo-Shinjuku daylight & neon fuchsia" },
	{ id: "theme-copper-patina-light", name: "Copper Patina Light", mode: "light", accentColor: "#0D9488", bgColor: "#F3FAF8", textColor: "#0F2824", description: "Oxidized verdigris & Aegean teal" },
	{ id: "theme-dracula-light", name: "Dracula Light", mode: "light", accentColor: "#7C3AED", bgColor: "#F8F7FA", textColor: "#282A36", description: "Alucard gothic cream & crimson coral" },
	{ id: "theme-lagoona-dark", name: "Lagoona Dark", mode: "dark", accentColor: "#38BDF8", bgColor: "#0E1118", textColor: "#EDF2F7", description: "Deep abyss neon cyan & electric aqua" },
	{ id: "theme-frozen-dark", name: "Frozen Dark", mode: "dark", accentColor: "#A3BE8C", bgColor: "#15171C", textColor: "#ECEFF4", description: "Nordic polar sage & frost carbon" },
	{ id: "theme-night-dark", name: "Night Dark", mode: "dark", accentColor: "#9ECE6A", bgColor: "#13141F", textColor: "#C0CAF5", description: "Tokyo night indigo & cyber lime" },
	{ id: "theme-inkworm-dark", name: "Inkworm Dark", mode: "dark", accentColor: "#E58A1F", bgColor: "#171513", textColor: "#E8E2D8", description: "Vintage espresso & warm amber" },
	{ id: "theme-monochrono-dark", name: "Monochrono Dark", mode: "dark", accentColor: "#FFFFFF", bgColor: "#050505", textColor: "#FFFFFF", description: "Pitch black high contrast titanium" },
	{ id: "theme-fouram-dark", name: "4 AM Dark", mode: "dark", accentColor: "#F43F8E", bgColor: "#080B14", textColor: "#F3F6FC", description: "Midnight neon magenta & electric mint" },
	{ id: "theme-wintercame-dark", name: "Winter Came Dark", mode: "dark", accentColor: "#FF6600", bgColor: "#0D0D0E", textColor: "#F8F8FA", description: "Obsidian charcoal & molten ember" },
	{ id: "theme-sun-dark", name: "Sun Dark", mode: "dark", accentColor: "#00E5FF", bgColor: "#0B0D11", textColor: "#EEF4FC", description: "Graphite carbon & cyber aqua" },
	{ id: "theme-console-dark", name: "Console Dark", mode: "dark", accentColor: "#10B981", bgColor: "#0D110E", textColor: "#DCF5E3", description: "CRT Matrix phosphor green & soot" },
	{ id: "theme-dracula-dark", name: "Dracula Dark", mode: "dark", accentColor: "#BD93F9", bgColor: "#282A36", textColor: "#F8F8F2", description: "Classic gothic vampire orchid & pink" },
	{ id: "theme-catppuccin-mocha", name: "Catppuccin Mocha", mode: "dark", accentColor: "#CBA6F7", bgColor: "#1E1E2E", textColor: "#CDD6F4", description: "Cozy pastel velvet & mauve" },
	{ id: "theme-nord-dark", name: "Nord Dark", mode: "dark", accentColor: "#88C0D0", bgColor: "#2E3440", textColor: "#ECEFF4", description: "Arctic polar night & frost aurora" },
	{ id: "theme-gruvbox-dark", name: "Gruvbox Dark", mode: "dark", accentColor: "#FE8019", bgColor: "#282828", textColor: "#EBDBB2", description: "Retro warm groove & saffron gold" },
	{ id: "theme-onedark-pro", name: "One Dark Pro", mode: "dark", accentColor: "#61AFEF", bgColor: "#21252B", textColor: "#ABB2BF", description: "Atom slate blue & coral mint" },
	{ id: "theme-rose-pine-dark", name: "Rosé Pine Dark", mode: "dark", accentColor: "#EB6F92", bgColor: "#191724", textColor: "#E0DEF4", description: "SoHo midnight rose & pine" },
	{ id: "theme-midnight-emerald-dark", name: "Midnight Emerald Dark", mode: "dark", accentColor: "#34D399", bgColor: "#0A140F", textColor: "#E2F8EE", description: "Deep malachite forest & glowing jade" },
	{ id: "theme-obsidian-crimson-dark", name: "Obsidian Crimson Dark", mode: "dark", accentColor: "#E11D48", bgColor: "#120B0D", textColor: "#FDE8ED", description: "Gothic bloodstone & velvet ruby" },
	{ id: "theme-synthwave-dark", name: "Synthwave 84 Dark", mode: "dark", accentColor: "#FF2A85", bgColor: "#160D26", textColor: "#FDF4FF", description: "Retro 80s neon violet & laser cyan" },
	{ id: "theme-deep-ocean-dark", name: "Deep Ocean Dark", mode: "dark", accentColor: "#00E5FF", bgColor: "#07111A", textColor: "#E0F5FE", description: "Bioluminescent abyss & aquamarine" },
	{ id: "theme-amethyst-void-dark", name: "Amethyst Void Dark", mode: "dark", accentColor: "#A855F7", bgColor: "#0F091A", textColor: "#F7EEFE", description: "Cosmic deep violet & starlight pink" }
];

let ts = `/**
 * Theme & Aura Gradient Management Module for Fractal Mandala
 * Supports 41 curated themes with dual Plain & Aura Gradient modes
 * Default theme: .theme-light-default
 */

export type BgStyle = 'plain' | 'aura';

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
}

export const THEMES: ThemeInfo[] = [
`;

rawThemes.forEach(t => {
	const aura = aurasById[mapping[t.id]];
	ts += `\t{\n`;
	ts += `\t\tid: '${t.id}',\n`;
	ts += `\t\tname: '${t.name}',\n`;
	ts += `\t\tmode: '${t.mode}',\n`;
	ts += `\t\taccentColor: '${t.accentColor}',\n`;
	ts += `\t\tbgColor: '${t.bgColor}',\n`;
	ts += `\t\ttextColor: '${t.textColor}',\n`;
	ts += `\t\tdescription: '${t.description}',\n`;
	ts += `\t\tauraId: '${aura.id}',\n`;
	ts += `\t\tauraName: '${aura.name}',\n`;
	ts += `\t\tauraDescription: '${aura.description.replace(/'/g, "\\'")}'\n`;
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

	get currentTheme(): ThemeInfo {
		return THEMES.find((t) => t.id === this.current) ?? THEMES[0];
	}

	get isDark(): boolean {
		return this.currentTheme.mode === 'dark';
	}

	get isAura(): boolean {
		return this.bgStyle === 'aura';
	}

	init() {
		if (typeof window === 'undefined') return;
		
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
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
		if (!THEMES.some((t) => t.id === id)) return;
		this.current = id;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('theme', id);
			} catch {
				// localStorage unavailable
			}
			this.apply(id, this.bgStyle);
		}
	}

	setBgStyle(style: BgStyle) {
		this.bgStyle = style;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem('bgStyle', style);
			} catch {
				// localStorage unavailable
			}
			this.apply(this.current, style);
		}
	}

	toggleBgStyle() {
		this.setBgStyle(this.bgStyle === 'aura' ? 'plain' : 'aura');
	}

	toggleMode() {
		const targetMode = this.isDark ? 'light' : 'dark';
		const matching = THEMES.filter((t) => t.mode === targetMode);
		if (targetMode === 'light') {
			this.setTheme(DEFAULT_THEME_ID);
		} else {
			const candidate = matching.find((t) => t.id === 'theme-night-dark') ?? matching[0];
			if (candidate) this.setTheme(candidate.id);
		}
	}

	cycleNext() {
		const idx = THEMES.findIndex((t) => t.id === this.current);
		const nextIdx = (idx + 1) % THEMES.length;
		this.setTheme(THEMES[nextIdx].id);
	}

	cycleRandom() {
		const pool = THEMES.filter((t) => t.id !== this.current);
		const randomTheme = pool[Math.floor(Math.random() * pool.length)];
		if (randomTheme) {
			this.setTheme(randomTheme.id);
		}
	}

	resetDefault() {
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

	apply(id: string, style?: BgStyle) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const currentStyle = style ?? this.bgStyle;

		// Remove all theme classes
		for (const theme of THEMES) {
			root.classList.remove(theme.id);
		}

		// Apply target theme class
		root.classList.add(id);

		const theme = THEMES.find((t) => t.id === id);
		if (theme) {
			root.setAttribute('data-theme', theme.id);
			root.setAttribute('data-mode', theme.mode);
			root.setAttribute('data-bg-style', currentStyle);
			root.style.colorScheme = theme.mode;
		}
	}
}

export const themeState = new ThemeState();
`;

fs.writeFileSync('./src/lib/utils/theme.svelte.ts', ts, 'utf8');
console.log('✓ Generated src/lib/utils/theme.svelte.ts');
