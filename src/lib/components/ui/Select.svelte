<script lang="ts">
	import { anchored } from '$lib/actions/anchored';
	import Icon from '../Icon.svelte';

	export interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		name?: string;
		onchange?: (value: string) => void;
	}

	let {
		options,
		value = $bindable(''),
		placeholder = 'Select…',
		disabled = false,
		name,
		onchange
	}: Props = $props();

	const id = $props.id();
	let surface = $state<HTMLElement | null>(null);
	let active = $state(0);
	const selected = $derived(options.find((o) => o.value === value));

	function pick(option: Option) {
		value = option.value;
		onchange?.(option.value);
		(document.getElementById(id) as HTMLElement & { hidePopover(): void })?.hidePopover();
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			active = (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			pick(options[active]);
		}
	}

	function ontoggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			active = Math.max(0, options.findIndex((o) => o.value === value));
			requestAnimationFrame(() => surface?.focus());
		}
	}
</script>

<button
	type="button"
	class="select-trigger"
	popovertarget={id}
	{disabled}
	data-placeholder={!selected || undefined}
	aria-haspopup="listbox"
>
	<span>{selected?.label ?? placeholder}</span>
	<span class="select-caret"><Icon name="chevron-down" /></span>
</button>
{#if name}<input type="hidden" {name} {value} />{/if}

<div {id} popover="auto" class="pop" use:anchored={{ matchWidth: true }} {ontoggle}>
	<div
		class="select-list"
		bind:this={surface}
		role="listbox"
		tabindex="-1"
		aria-activedescendant={`${id}-${active}`}
		{onkeydown}
	>
		{#each options as option, i (option.value)}
			<button
				type="button"
				class="select-option"
				id={`${id}-${i}`}
				role="option"
				aria-selected={option.value === value}
				data-active={i === active || undefined}
				onmouseenter={() => (active = i)}
				onclick={() => pick(option)}
			>
				<span>{option.label}</span>
				<span class="select-check"><Icon name="check" /></span>
			</button>
		{/each}
	</div>
</div>
