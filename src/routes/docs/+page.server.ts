import type { PageServerLoad } from './$types';
import { docs, sections } from '$lib/docs/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const total = docs.documents.length;
	return {
		seo: {
			title: 'Docs · Fractal Mandala',
			description: `Explore ${total} documents across ${sections.length} sections on Indian civilization, philosophy, history, and knowledge archives.`,
			url: '/docs',
			siteUrl: 'https://fractalmandala.in',
			siteName: 'Fractal Mandala',
			image: '/docs/og.png',
			imageAlt: 'Fractal Mandala Documentation Index',
			type: 'website' as const,
			language: 'en-US',
			locale: 'en_US',
			breadcrumbs: [
				{ name: 'Home', url: '/' },
				{ name: 'Docs', url: '/docs' }
			]
		}
	};
};
