import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import { allTags, pagesForTag } from '$lib/docs/content';

export const prerender = true;

// One entry per distinct tag. The param is the raw (decoded) tag; SvelteKit encodes it back
// into the prerendered URL, matching `tagHref()`.
export const entries: EntryGenerator = () => {
	return allTags().map(({ tag }) => ({ tag }));
};

export const load: PageServerLoad = async ({ params }) => {
	const tag = params.tag;
	const items = pagesForTag(tag);

	// A tag with no documents isn't a real browse surface — 404 rather than render an empty grid.
	if (items.length === 0) {
		error(404, `No documents tagged "${tag}"`);
	}

	return {
		tag,
		seo: {
			title: `${tag} · Tags · Fractal Mandala`,
			description: `Explore ${items.length} ${items.length === 1 ? 'document' : 'documents'} tagged "${tag}" in the Fractal Mandala corpus.`,
			url: `/docs/tags/${encodeURIComponent(tag)}`,
			siteUrl: 'https://fractalmandala.in',
			siteName: 'Fractal Mandala',
			image: '/docs/og.png',
			imageAlt: `${tag} · Fractal Mandala`,
			type: 'website' as const,
			language: 'en-US',
			locale: 'en_US',
			breadcrumbs: [
				{ name: 'Home', url: '/' },
				{ name: 'Docs', url: '/docs' },
				{ name: 'Tags', url: '/docs/tags' },
				{ name: tag, url: `/docs/tags/${encodeURIComponent(tag)}` }
			]
		}
	};
};
