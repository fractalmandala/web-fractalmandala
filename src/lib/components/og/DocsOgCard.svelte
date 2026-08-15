<script lang="ts">
	interface Props {
		title?: string;
		description?: string;
		section?: string;
		badge?: string;
		tags?: string[];
		path?: string;
		siteTitle?: string;
	}

	let {
		title = 'Fractal Mandala',
		description = '',
		section = 'Docs',
		badge = '',
		tags = [],
		path = '/docs',
		siteTitle = 'FRACTAL MANDALA'
	}: Props = $props();

	// Dynamic title size calculation for balanced social cards
	const titleLength = $derived(title.length);
	const titleFontSize = $derived(titleLength > 80 ? '40px' : titleLength > 45 ? '50px' : '62px');
	const titleLineHeight = $derived(titleLength > 80 ? '1.2' : titleLength > 45 ? '1.18' : '1.14');

	const activeBadge = $derived(badge || section || 'Archive');
	const displayTags = $derived(tags.slice(0, 3));
</script>

<div
	style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; background-color: #090a0f; color: #f8fafc; font-family: 'Inter', sans-serif; box-sizing: border-box; padding: 56px; position: relative; overflow: hidden;"
>
	<!-- Ambient Background Glow & Decorative Framing -->
	<div
		style="display: flex; position: absolute; top: -100px; right: -100px; width: 450px; height: 450px; border-radius: 9999px; background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(9, 10, 15, 0) 70%);"
	></div>
	<div
		style="display: flex; position: absolute; bottom: -80px; left: -80px; width: 400px; height: 400px; border-radius: 9999px; background: radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(9, 10, 15, 0) 70%);"
	></div>

	<!-- Outer Geometric Border -->
	<div
		style="display: flex; position: absolute; top: 24px; left: 24px; right: 24px; bottom: 24px; border: 1px solid rgba(245, 158, 11, 0.22); border-radius: 16px; pointer-events: none;"
	></div>
	<div
		style="display: flex; position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px; pointer-events: none;"
	></div>

	<!-- Top Header: Brand & Section Badge -->
	<div
		style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; z-index: 10;"
	>
		<div style="display: flex; flex-direction: row; align-items: center;">
			<div
				style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); margin-right: 16px; color: #fbbf24; font-size: 24px; font-weight: 700;"
			>
				ॐ
			</div>
			<div style="display: flex; flex-direction: column;">
				<span
					style="font-size: 18px; font-weight: 800; letter-spacing: 0.14em; color: #f59e0b;"
				>
					{siteTitle}
				</span>
				<span style="font-size: 12px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">
					Knowledge & Civilization Archive
				</span>
			</div>
		</div>

		<div
			style="display: flex; align-items: center; padding: 8px 18px; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35);"
		>
			<span
				style="font-size: 15px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase;"
			>
				{activeBadge}
			</span>
		</div>
	</div>

	<!-- Main Body: Breadcrumb kicker, Large Title, Excerpt -->
	<div
		style="display: flex; flex-direction: column; justify-content: center; width: 100%; margin-top: 16px; margin-bottom: 16px; z-index: 10;"
	>
		<div
			style="display: flex; flex-direction: row; align-items: center; margin-bottom: 14px; font-size: 16px; font-weight: 600; color: #d97706; letter-spacing: 0.06em; text-transform: uppercase;"
		>
			<span>{path.replace(/^\//, '').replaceAll('/', ' / ')}</span>
		</div>

		<h1
			style="display: flex; margin: 0; font-size: {titleFontSize}; line-height: {titleLineHeight}; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; max-height: 240px; overflow: hidden;"
		>
			{title}
		</h1>

		{#if description}
			<p
				style="display: flex; margin: 16px 0 0 0; font-size: 23px; line-height: 1.42; color: #94a3b8; font-weight: 400; max-height: 100px; overflow: hidden;"
			>
				{description}
			</p>
		{/if}
	</div>

	<!-- Bottom Footer: URL & Tags / Metadata -->
	<div
		style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; z-index: 10;"
	>
		<div style="display: flex; flex-direction: row; align-items: center; gap: 16px;">
			<span style="font-size: 17px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.02em;">
				fractalmandala.in
			</span>
			<span style="color: #475569;">•</span>
			<span style="font-size: 15px; color: #64748b;">
				Open Research & Philology
			</span>
		</div>

		<div style="display: flex; flex-direction: row; gap: 8px;">
			{#each displayTags as tag}
				<div
					style="display: flex; padding: 4px 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #94a3b8;"
				>
					#{tag.replaceAll('-', ' ')}
				</div>
			{/each}
			{#if displayTags.length === 0}
				<div
					style="display: flex; padding: 4px 12px; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); font-size: 13px; color: #fbbf24;"
				>
					Fractal Mandala Corpus
				</div>
			{/if}
		</div>
	</div>
</div>
