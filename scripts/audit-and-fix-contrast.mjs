import fs from 'node:fs';
import path from 'node:path';

// WCAG 2.1 Color Contrast Algorithms
function hexToRgb(hex) {
	let cleanHex = hex.trim().replace(/^#/, '');
	if (cleanHex.length === 3) {
		cleanHex = cleanHex.split('').map(c => c + c).join('');
	}
	const num = parseInt(cleanHex, 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255
	};
}

function rgbToHex({ r, g, b }) {
	const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0').toUpperCase();
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
			case g: h = ((b - r) / d + 2) / 6; break;
			case b: h = ((r - g) / d + 4) / 6; break;
		}
	}
	return { h: h * 360, s, l };
}

function hslToRgb({ h, s, l }) {
	h = (h % 360 + 360) % 360;
	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		const hNorm = h / 360;
		r = hue2rgb(p, q, hNorm + 1/3);
		g = hue2rgb(p, q, hNorm);
		b = hue2rgb(p, q, hNorm - 1/3);
	}
	return { r: r * 255, g: g * 255, b: b * 255 };
}

function sRgbToLinear(c) {
	const v = c / 255;
	return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb) {
	return 0.2126 * sRgbToLinear(rgb.r) + 0.7152 * sRgbToLinear(rgb.g) + 0.0722 * sRgbToLinear(rgb.b);
}

function contrastRatio(hex1, hex2) {
	try {
		const rgb1 = hexToRgb(hex1);
		const rgb2 = hexToRgb(hex2);
		const l1 = relativeLuminance(rgb1);
		const l2 = relativeLuminance(rgb2);
		const lighter = Math.max(l1, l2);
		const darker = Math.min(l1, l2);
		return (lighter + 0.05) / (darker + 0.05);
	} catch {
		return 1;
	}
}

function ensureContrast(fgHex, bgHex, targetRatio, isDarkBg) {
	let currentRatio = contrastRatio(fgHex, bgHex);
	if (currentRatio >= targetRatio) return fgHex;

	const rgb = hexToRgb(fgHex);
	let { h, s, l } = rgbToHsl(rgb);

	const step = isDarkBg ? 0.01 : -0.01;
	for (let i = 0; i < 100; i++) {
		l = Math.max(0.02, Math.min(0.98, l + step));
		const candidateRgb = hslToRgb({ h, s, l });
		const candidateHex = rgbToHex(candidateRgb);
		if (contrastRatio(candidateHex, bgHex) >= targetRatio) {
			return candidateHex;
		}
	}
	return isDarkBg ? '#FFFFFF' : '#000000';
}

// Read _themes.sass
const themesFile = path.resolve('./src/lib/styles/_themes.sass');
let sassContent = fs.readFileSync(themesFile, 'utf8');

const lines = sassContent.split('\n');
const updatedLines = [];
let currentThemeSelector = null;
let currentBg = '#FFFFFF';
let currentIsDark = false;
let adjustmentsCount = 0;

for (let i = 0; i < lines.length; i++) {
	const line = lines[i];
	const themeMatch = line.match(/^(\.theme-[a-zA-Z0-9-]+)/);
	if (themeMatch) {
		currentThemeSelector = themeMatch[1];
		updatedLines.push(line);
		continue;
	}

	if (!currentThemeSelector || (!line.startsWith('\t--') && !line.startsWith('  --'))) {
		if (line.startsWith('.') && !line.startsWith('.theme-')) {
			currentThemeSelector = null;
		}
		updatedLines.push(line);
		continue;
	}

	const tokenMatch = line.match(/^(\s*--)([a-zA-Z0-9-]+)(:\s*)(#[a-fA-F0-9]{3,8})(.*)$/);
	if (!tokenMatch) {
		updatedLines.push(line);
		continue;
	}

	const [, prefix, tokenName, colon, colorVal, suffix] = tokenMatch;

	if (tokenName === 'bg') {
		currentBg = colorVal;
		currentIsDark = relativeLuminance(hexToRgb(currentBg)) < 0.4;
		updatedLines.push(line);
		continue;
	}

	let targetRatio = 0;
	if (tokenName === 'text-primary') targetRatio = 7.0;
	else if (tokenName === 'text-secondary') targetRatio = 4.5;
	else if (tokenName === 'text-muted') targetRatio = 3.0;
	else if (tokenName === 'theme-color' || tokenName === 'theme-color-alt') targetRatio = 4.5;
	else if (tokenName.startsWith('syntax-') && tokenName !== 'syntax-comment') targetRatio = 4.5;
	else if (tokenName === 'syntax-comment') targetRatio = 3.0;
	else if (tokenName.startsWith('md-') && tokenName !== 'md-code-back') targetRatio = 4.5;

	if (targetRatio > 0) {
		const ratio = contrastRatio(colorVal, currentBg);
		if (ratio < targetRatio) {
			const targetWithBuffer = targetRatio + 0.15;
			const fixedHex = ensureContrast(colorVal, currentBg, targetWithBuffer, currentIsDark);
			adjustmentsCount++;
			updatedLines.push(`${prefix}${tokenName}${colon}${fixedHex}${suffix}`);
			continue;
		}
	}

	updatedLines.push(line);
}

fs.writeFileSync(themesFile, updatedLines.join('\n'), 'utf8');
console.log(`✓ Audited and updated _themes.sass with ${adjustmentsCount} accessibility contrast corrections!`);
