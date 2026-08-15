import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedMenuState = browser ? JSON.parse(localStorage.getItem('menuState') || 'false') : false;
export const menuState = writable<boolean>(storedMenuState);

export function toggleMenuState() {
	if (browser) {
		menuState.update((mode) => {
			const newMode = !mode;
			try {
				localStorage.setItem('menuState', JSON.stringify(newMode));
			} catch {}
			return newMode;
		});
	}
}

export function closeMenuState() {
	if (browser) {
		menuState.set(false);
		try {
			localStorage.setItem('menuState', 'false');
		} catch {}
	}
}

export function openMenuState() {
	if (browser) {
		menuState.set(true);
		try {
			localStorage.setItem('menuState', 'true');
		} catch {}
	}
}
