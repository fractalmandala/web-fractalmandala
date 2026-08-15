// Svelte 5 Reactive Menu / Drawer State
class MenuState {
	open = $state(false);

	openMenu() {
		this.open = true;
		console.log('MenuState.openMenu called -> true');
	}

	closeMenu() {
		this.open = false;
		console.log('MenuState.closeMenu called -> false');
	}

	toggleMenu() {
		this.open = !this.open;
		console.log('MenuState.toggleMenu called ->', this.open);
	}
}

export const menuState = new MenuState();

export function toggleMenuState() {
	menuState.toggleMenu();
}

export function closeMenuState() {
	menuState.closeMenu();
}

export function openMenuState() {
	menuState.openMenu();
}
