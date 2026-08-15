import type { RequestHandler } from './$types';
import { renderDocsOgImage } from '$lib/server/og';
import { docs, sections } from '$lib/docs/content';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const total = docs.documents.length;
	return renderDocsOgImage({
		title: 'Fractal Mandala',
		description: `${total} documents across ${sections.length} sections on Indian civilization, philosophy, history, and modern technology.`,
		section: 'Living Archive',
		badge: 'Knowledge Base',
		path: '/'
	});
};
