/**
 * Theme Management Module for Fractal Mandala
 * Supports 41 curated themes defined in _themes.sass
 * Default theme: .theme-light-default
 */

export interface ThemeInfo {
	id: string;
	name: string;
	mode: 'light' | 'dark';
	accentColor: string;
	bgColor: string;
	textColor: string;
	description: string;
}

export const THEMES: ThemeInfo[] = [
	// ========================================================================
	// Light Themes (21)
	// ========================================================================
	{
		id: 'theme-light-default',
		name: 'Default Light',
		mode: 'light',
		accentColor: '#059669',
		bgColor: '#FFFFFF',
		textColor: '#0F172A',
		description: 'Emerald accent on clean white'
	},
	{
		id: 'theme-himalaya-light',
		name: 'Himalaya Light',
		mode: 'light',
		accentColor: '#2563EB',
		bgColor: '#F8FAFC',
		textColor: '#0F172A',
		description: 'Alpine slate & azure on mist'
	},
	{
		id: 'theme-editorial-light',
		name: 'Editorial Light',
		mode: 'light',
		accentColor: '#2E5A36',
		bgColor: '#FAF8F5',
		textColor: '#232220',
		description: 'Forest olive on classic book paper'
	},
	{
		id: 'theme-space-light',
		name: 'Space Light',
		mode: 'light',
		accentColor: '#0D7A4D',
		bgColor: '#F4F8F6',
		textColor: '#0D261C',
		description: 'Pine mint & frost green canvas'
	},
	{
		id: 'theme-sun-light',
		name: 'Sun Light',
		mode: 'light',
		accentColor: '#C2542D',
		bgColor: '#FAF6F0',
		textColor: '#2E1E14',
		description: 'Terracotta amber & sunbaked clay'
	},
	{
		id: 'theme-monochrono-light',
		name: 'Monochrono Light',
		mode: 'light',
		accentColor: '#312E81',
		bgColor: '#FFFFFF',
		textColor: '#09090B',
		description: 'High contrast minimalist ink & indigo'
	},
	{
		id: 'theme-molly-light',
		name: 'Molly Light',
		mode: 'light',
		accentColor: '#0284C7',
		bgColor: '#F0F7FF',
		textColor: '#0B2545',
		description: 'Sky azure & ocean periwinkle'
	},
	{
		id: 'theme-malana-light',
		name: 'Malana Light',
		mode: 'light',
		accentColor: '#D95D24',
		bgColor: '#FCF9F2',
		textColor: '#211812',
		description: 'Cream sandstone & warm cinnamon'
	},
	{
		id: 'theme-coresync-light',
		name: 'Coresync Light',
		mode: 'light',
		accentColor: '#FF4500',
		bgColor: '#E6E8EC',
		textColor: '#111622',
		description: 'Industrial titanium & flame orange'
	},
	{
		id: 'theme-studio-light',
		name: 'Studio Light',
		mode: 'light',
		accentColor: '#C99436',
		bgColor: '#F4F0E8',
		textColor: '#1C1A17',
		description: 'Architectural bone & warm ochre'
	},
	{
		id: 'theme-matcha-light',
		name: 'Matcha Light',
		mode: 'light',
		accentColor: '#4D7C0F',
		bgColor: '#F5F7F2',
		textColor: '#1C2719',
		description: 'Zen bamboo & sweet matcha tea'
	},
	{
		id: 'theme-sakura-light',
		name: 'Sakura Light',
		mode: 'light',
		accentColor: '#DB2777',
		bgColor: '#FDF7F8',
		textColor: '#331622',
		description: 'Cherry blossom & rose quartz'
	},
	{
		id: 'theme-nordic-frost-light',
		name: 'Nordic Frost Light',
		mode: 'light',
		accentColor: '#0284C7',
		bgColor: '#F4FAFC',
		textColor: '#0C232F',
		description: 'Glacier ice & deep fjord blue'
	},
	{
		id: 'theme-desert-dune-light',
		name: 'Desert Dune Light',
		mode: 'light',
		accentColor: '#D97706',
		bgColor: '#FDF9F0',
		textColor: '#291F14',
		description: 'Sahara golden sand & warm ochre'
	},
	{
		id: 'theme-lavender-mist-light',
		name: 'Lavender Mist Light',
		mode: 'light',
		accentColor: '#7C3AED',
		bgColor: '#FAF8FD',
		textColor: '#221633',
		description: 'Lilac garden & royal amethyst'
	},
	{
		id: 'theme-botanical-light',
		name: 'Botanical Light',
		mode: 'light',
		accentColor: '#16A34A',
		bgColor: '#F7FAF6',
		textColor: '#182819',
		description: 'Lush fern herbarium & forest sage'
	},
	{
		id: 'theme-clay-studio-light',
		name: 'Clay Studio Light',
		mode: 'light',
		accentColor: '#B45309',
		bgColor: '#FAF5F0',
		textColor: '#2C1A12',
		description: 'Terracotta pottery & warm bisque'
	},
	{
		id: 'theme-solaris-light',
		name: 'Solaris Light',
		mode: 'light',
		accentColor: '#D97706',
		bgColor: '#FFFCF2',
		textColor: '#291E04',
		description: 'Golden sunbeam & marigold'
	},
	{
		id: 'theme-cyberpunk-day-light',
		name: 'Cyberpunk Day Light',
		mode: 'light',
		accentColor: '#E11D48',
		bgColor: '#FDFEFA',
		textColor: '#15102A',
		description: 'Neo-Shinjuku daylight & neon fuchsia'
	},
	{
		id: 'theme-copper-patina-light',
		name: 'Copper Patina Light',
		mode: 'light',
		accentColor: '#0D9488',
		bgColor: '#F3FAF8',
		textColor: '#0F2824',
		description: 'Oxidized verdigris & Aegean teal'
	},
	{
		id: 'theme-dracula-light',
		name: 'Dracula Light',
		mode: 'light',
		accentColor: '#7C3AED',
		bgColor: '#F8F7FA',
		textColor: '#282A36',
		description: 'Alucard gothic cream & crimson coral'
	},

	// ========================================================================
	// Dark Themes (20)
	// ========================================================================
	{
		id: 'theme-lagoona-dark',
		name: 'Lagoona Dark',
		mode: 'dark',
		accentColor: '#38BDF8',
		bgColor: '#0E1118',
		textColor: '#EDF2F7',
		description: 'Deep abyss neon cyan & electric aqua'
	},
	{
		id: 'theme-frozen-dark',
		name: 'Frozen Dark',
		mode: 'dark',
		accentColor: '#A3BE8C',
		bgColor: '#15171C',
		textColor: '#ECEFF4',
		description: 'Nordic polar sage & frost carbon'
	},
	{
		id: 'theme-night-dark',
		name: 'Night Dark',
		mode: 'dark',
		accentColor: '#9ECE6A',
		bgColor: '#13141F',
		textColor: '#C0CAF5',
		description: 'Tokyo night indigo & cyber lime'
	},
	{
		id: 'theme-inkworm-dark',
		name: 'Inkworm Dark',
		mode: 'dark',
		accentColor: '#E58A1F',
		bgColor: '#171513',
		textColor: '#E8E2D8',
		description: 'Vintage espresso & warm amber'
	},
	{
		id: 'theme-monochrono-dark',
		name: 'Monochrono Dark',
		mode: 'dark',
		accentColor: '#FFFFFF',
		bgColor: '#050505',
		textColor: '#FFFFFF',
		description: 'Pitch black high contrast titanium'
	},
	{
		id: 'theme-fouram-dark',
		name: '4 AM Dark',
		mode: 'dark',
		accentColor: '#F43F8E',
		bgColor: '#080B14',
		textColor: '#F3F6FC',
		description: 'Midnight neon magenta & electric mint'
	},
	{
		id: 'theme-wintercame-dark',
		name: 'Winter Came Dark',
		mode: 'dark',
		accentColor: '#FF6600',
		bgColor: '#0D0D0E',
		textColor: '#F8F8FA',
		description: 'Obsidian charcoal & molten ember'
	},
	{
		id: 'theme-sun-dark',
		name: 'Sun Dark',
		mode: 'dark',
		accentColor: '#00E5FF',
		bgColor: '#0B0D11',
		textColor: '#EEF4FC',
		description: 'Graphite carbon & cyber aqua'
	},
	{
		id: 'theme-console-dark',
		name: 'Console Dark',
		mode: 'dark',
		accentColor: '#10B981',
		bgColor: '#0D110E',
		textColor: '#DCF5E3',
		description: 'CRT Matrix phosphor green & soot'
	},
	{
		id: 'theme-dracula-dark',
		name: 'Dracula Dark',
		mode: 'dark',
		accentColor: '#BD93F9',
		bgColor: '#282A36',
		textColor: '#F8F8F2',
		description: 'Classic gothic vampire orchid & pink'
	},
	{
		id: 'theme-catppuccin-mocha',
		name: 'Catppuccin Mocha',
		mode: 'dark',
		accentColor: '#CBA6F7',
		bgColor: '#1E1E2E',
		textColor: '#CDD6F4',
		description: 'Cozy pastel velvet & mauve'
	},
	{
		id: 'theme-nord-dark',
		name: 'Nord Dark',
		mode: 'dark',
		accentColor: '#88C0D0',
		bgColor: '#2E3440',
		textColor: '#ECEFF4',
		description: 'Arctic polar night & frost aurora'
	},
	{
		id: 'theme-gruvbox-dark',
		name: 'Gruvbox Dark',
		mode: 'dark',
		accentColor: '#FE8019',
		bgColor: '#282828',
		textColor: '#EBDBB2',
		description: 'Retro warm groove & saffron gold'
	},
	{
		id: 'theme-onedark-pro',
		name: 'One Dark Pro',
		mode: 'dark',
		accentColor: '#61AFEF',
		bgColor: '#21252B',
		textColor: '#ABB2BF',
		description: 'Atom slate blue & coral mint'
	},
	{
		id: 'theme-rose-pine-dark',
		name: 'Rosé Pine Dark',
		mode: 'dark',
		accentColor: '#EB6F92',
		bgColor: '#191724',
		textColor: '#E0DEF4',
		description: 'SoHo midnight rose & pine'
	},
	{
		id: 'theme-midnight-emerald-dark',
		name: 'Midnight Emerald Dark',
		mode: 'dark',
		accentColor: '#34D399',
		bgColor: '#0A140F',
		textColor: '#E2F8EE',
		description: 'Deep malachite forest & glowing jade'
	},
	{
		id: 'theme-obsidian-crimson-dark',
		name: 'Obsidian Crimson Dark',
		mode: 'dark',
		accentColor: '#E11D48',
		bgColor: '#120B0D',
		textColor: '#FDE8ED',
		description: 'Gothic bloodstone & velvet ruby'
	},
	{
		id: 'theme-synthwave-dark',
		name: 'Synthwave 84 Dark',
		mode: 'dark',
		accentColor: '#FF2A85',
		bgColor: '#160D26',
		textColor: '#FDF4FF',
		description: 'Retro 80s neon violet & laser cyan'
	},
	{
		id: 'theme-deep-ocean-dark',
		name: 'Deep Ocean Dark',
		mode: 'dark',
		accentColor: '#00E5FF',
		bgColor: '#07111A',
		textColor: '#E0F5FE',
		description: 'Bioluminescent abyss & aquamarine'
	},
	{
		id: 'theme-amethyst-void-dark',
		name: 'Amethyst Void Dark',
		mode: 'dark',
		accentColor: '#A855F7',
		bgColor: '#0F091A',
		textColor: '#F7EEFE',
		description: 'Cosmic deep violet & starlight pink'
	}
];

export const DEFAULT_THEME_ID = 'theme-light-default';

export const LIGHT_THEMES = THEMES.filter((t) => t.mode === 'light');
export const DARK_THEMES = THEMES.filter((t) => t.mode === 'dark');

class ThemeState {
	current = $state<string>(DEFAULT_THEME_ID);
	isOpen = $state<boolean>(false);

	get currentTheme(): ThemeInfo {
		return THEMES.find((t) => t.id === this.current) ?? THEMES[0];
	}

	get isDark(): boolean {
		return this.currentTheme.mode === 'dark';
	}

	init() {
		if (typeof window === 'undefined') return;
		const saved = localStorage.getItem('theme');
		if (saved && THEMES.some((t) => t.id === saved)) {
			this.current = saved;
		} else {
			this.current = DEFAULT_THEME_ID;
		}
		this.apply(this.current);
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
			this.apply(id);
		}
	}

	toggleMode() {
		const targetMode = this.isDark ? 'light' : 'dark';
		const matching = THEMES.filter((t) => t.mode === targetMode);
		// Switch to corresponding or first theme of the opposite mode
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

	apply(id: string) {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;

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
			root.style.colorScheme = theme.mode;
		}
	}
}

export const themeState = new ThemeState();
