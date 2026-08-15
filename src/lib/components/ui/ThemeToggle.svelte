<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '../Icon.svelte';
	import Button from './Button.svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
		theme =
			stored ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		apply();
	});

	function apply() {
		document.documentElement.dataset.theme = theme;
	}

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', theme);
		apply();
	}
</script>

<Button
	variant="ghost"
	size="sm"
	icon
	onclick={toggle}
	aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
>
	<Icon name={theme === 'dark' ? 'sun' : 'moon'} />
</Button>
