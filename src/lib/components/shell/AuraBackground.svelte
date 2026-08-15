<script lang="ts">
	import { themeState } from '$lib/utils/theme.svelte';
</script>

{#if themeState.isAura}
	<div class="aura-ambient" aria-hidden="true">
		<div class="aura-layer aura-layer-1"></div>
		<div class="aura-layer aura-layer-2"></div>
		<div class="aura-layer aura-layer-3"></div>
		<div class="aura-layer aura-layer-4"></div>
		<div class="aura-layer aura-layer-5"></div>
		<div class="aura-layer aura-layer-6"></div>
	</div>
{/if}
