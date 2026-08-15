import { writable } from 'svelte/store';

export const searchOpen = writable<boolean>(false);

export function openSearch() {
	searchOpen.set(true);
}

export function closeSearch() {
	searchOpen.set(false);
}

export function toggleSearch() {
	searchOpen.update((v) => !v);
}
