<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		size?: 'sm' | 'md';
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		label,
		size = 'md',
		disabled = false,
		onchange
	}: Props = $props();

	function toggle() {
		checked = !checked;
		onchange?.(checked);
	}
</script>

<span class="switch" data-disabled={disabled || undefined}>
	<button
		type="button"
		class="switch-track"
		role="switch"
		aria-checked={checked}
		aria-label={label}
		data-size={size}
		{disabled}
		onclick={toggle}
	>
		<span class="switch-thumb"></span>
	</button>
	{#if label}<span>{label}</span>{/if}
</span>
