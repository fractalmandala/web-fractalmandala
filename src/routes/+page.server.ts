import type { PageServerLoad } from './$types';
import { docs, sections } from '$lib/docs/content';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const total = docs.documents.length;
	return {
		seo: {
			title: 'Fractal Mandala · Living Knowledge Archive',
			description:
				'Indian civilization, philosophy, history, and modern technology in an open knowledge archive of long-form essays and research.',
			url: '/',
			siteUrl: 'https://fractalmandala.in',
			siteName: 'Fractal Mandala',
			image: '/og.png',
			imageAlt: 'Fractal Mandala · Living Knowledge Archive',
			type: 'website' as const,
			language: 'en-US',
			locale: 'en_US',
			breadcrumbs: [{ name: 'Home', url: '/' }]
		}
	};
};
