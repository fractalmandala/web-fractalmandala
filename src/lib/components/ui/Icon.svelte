<script lang="ts">
	// Minimal 24px stroke icon set. One path per name, no icon font, no deps.
	type Name =
		| 'chevron-down'
		| 'chevron-right'
		| 'check'
		| 'close'
		| 'menu'
		| 'search'
		| 'sun'
		| 'moon'
		| 'arrow-right'
		| 'plus'
		| 'list';

	interface Props {
		name: Name;
		size?: number;
		strokeWidth?: number;
	}

	let { name, size = 16, strokeWidth = 1.75 }: Props = $props();

	const paths: Record<Name, string> = {
		'chevron-down': 'M4 7l4 4 4-4',
		'chevron-right': 'M6 3.5l5 4.5-5 4.5',
		check: 'M3 8.5l3.5 3.5L13 4.5',
		close: 'M4 4l8 8M12 4l-8 8',
		menu: 'M2.5 5h11M2.5 11h11',
		search: 'M11.2 11.2L14 14M12 7.2a4.8 4.8 0 11-9.6 0 4.8 4.8 0 019.6 0z',
		sun: 'M8 11.2A3.2 3.2 0 108 4.8a3.2 3.2 0 000 6.4zM8 1.4v1.4M8 13.2v1.4M1.4 8h1.4M13.2 8h1.4M3.3 3.3l1 1M11.7 11.7l1 1M12.7 3.3l-1 1M4.3 11.7l-1 1',
		moon: 'M13 9.8A5.6 5.6 0 016.2 3a5.8 5.8 0 106.8 6.8z',
		'arrow-right': 'M3 8h10M9 4l4 4-4 4',
		plus: 'M8 3.5v9M3.5 8h9',
		list: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h7'
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 16 16"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
><path d={paths[name]} /></svg>
