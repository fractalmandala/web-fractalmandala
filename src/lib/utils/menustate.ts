import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedMenuState = browser ? JSON.parse(localStorage.getItem('menuState') || 'false') : false;
export const menuState = writable(storedMenuState);
export function toggleMenuState() {
	if (browser) {
		menuState.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('menuState', JSON.stringify(newMode));
			return newMode;
		});
	}
}
