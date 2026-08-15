import type { PageServerLoad } from './$types';
import { allTags } from '$lib/docs/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const tags = allTags();
	return {
		seo: {
			title: 'Tags · Fractal Mandala',
			description: `Browse all ${tags.length} tags across the Fractal Mandala corpus.`,
			url: '/docs/tags',
			siteUrl: 'https://fractalmandala.in',
			siteName: 'Fractal Mandala',
			image: '/docs/og.png',
			imageAlt: 'Fractal Mandala Tags',
			type: 'website' as const,
			language: 'en-US',
			locale: 'en_US',
			breadcrumbs: [
				{ name: 'Home', url: '/' },
				{ name: 'Docs', url: '/docs' },
				{ name: 'Tags', url: '/docs/tags' }
			]
		}
	};
};
