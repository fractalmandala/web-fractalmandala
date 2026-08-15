<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		/** Receives the id + invalid flag to spread onto the control. */
		children: Snippet<[{ id: string; 'aria-describedby': string; 'data-invalid': true | undefined }]>;
	}

	let { label, hint, error, required = false, children }: Props = $props();
	const id = $props.id();
</script>

<div class="field">
	{#if label}
		<label class="field-label" for={id}>
			{label}
			{#if required}<span class="field-req" aria-hidden="true">*</span>{/if}
		</label>
	{/if}
	{@render children({
		id,
		'aria-describedby': `${id}-help`,
		'data-invalid': error ? true : undefined
	})}
	{#if error}
		<p class="field-error" id={`${id}-help`}>{error}</p>
	{:else if hint}
		<p class="field-hint" id={`${id}-help`}>{hint}</p>
	{/if}
</div>
