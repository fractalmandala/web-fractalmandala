class SearchState {
	open = $state(false);

	openModal() {
		this.open = true;
		console.log('SearchState.openModal called -> true');
	}

	closeModal() {
		this.open = false;
		console.log('SearchState.closeModal called -> false');
	}

	toggleModal() {
		this.open = !this.open;
		console.log('SearchState.toggleModal called ->', this.open);
	}
}

export const searchState = new SearchState();

export function openSearch() {
	searchState.open = true;
}

export function closeSearch() {
	searchState.open = false;
}

export function toggleSearch() {
	searchState.open = !searchState.open;
}
