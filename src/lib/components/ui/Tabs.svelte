<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		value?: string;
		variant?: 'line' | 'pill';
		panel: Snippet<[string]>;
	}

	let { tabs, value = $bindable(tabs[0]?.id), variant = 'line', panel }: Props = $props();
	const id = $props.id();

	function onkeydown(event: KeyboardEvent) {
		const i = tabs.findIndex((t) => t.id === value);
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			const next = event.key === 'ArrowRight' ? i + 1 : i - 1;
			value = tabs[(next + tabs.length) % tabs.length].id;
			requestAnimationFrame(() =>
				document.getElementById(`${id}-tab-${value}`)?.focus()
			);
		}
	}
</script>

<div class="tabs">
	<div class="tablist" role="tablist" data-variant={variant} {onkeydown}>
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				class="tab"
				id={`${id}-tab-${tab.id}`}
				role="tab"
				aria-selected={tab.id === value}
				aria-controls={`${id}-panel-${tab.id}`}
				tabindex={tab.id === value ? 0 : -1}
				onclick={() => (value = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div
		class="tabpanel"
		id={`${id}-panel-${value}`}
		role="tabpanel"
		aria-labelledby={`${id}-tab-${value}`}
		tabindex="0"
	>
		{@render panel(value ?? '')}
	</div>
</div>
