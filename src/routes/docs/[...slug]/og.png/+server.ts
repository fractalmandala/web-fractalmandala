import { error } from '@sveltejs/kit';
import type { RequestHandler, EntryGenerator } from './$types';
import { renderDocsOgImage } from '$lib/server/og';
import { getDoc, getSection, allPages, docSections } from '$lib/docs/content';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const docSlugs = allPages
		.map((p) => (p.href ? p.href.replace(/^\/docs\/?/, '') : ''))
		.filter(Boolean);
	const sectionSlugs = docSections.map((s) => s.path);
	const uniqueSlugs = Array.from(new Set([...docSlugs, ...sectionSlugs]));
	return uniqueSlugs.map((slug) => ({ slug }));
};

export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug ?? '';

	// 1. Match document
	const doc = getDoc(slug);
	if (doc) {
		const meta = (doc.metadata || {}) as {
			tags?: string[];
			date?: string | Date;
			group?: string;
		};

		const rootSegment = slug.split('/')[0] ?? '';
		const sectionObj = getSection(rootSegment);
		const sectionName = sectionObj?.title ?? meta.group ?? 'Docs';

		return renderDocsOgImage({
			title: doc.title,
			description:
				doc.description ||
				`${doc.title} — essay and research document in the ${sectionName} collection.`,
			section: sectionName,
			badge: 'Document',
			tags: (Array.isArray(meta.tags) ? meta.tags : []).map(String),
			path: `/docs/${slug}`
		});
	}

	// 2. Match section
	const section = getSection(slug);
	if (section) {
		return renderDocsOgImage({
			title: section.title,
			description: `Explore ${section.pages.length} documents and essays in the ${section.title} knowledge bank.`,
			section: section.title,
			badge: 'Section Archive',
			tags: [],
			path: `/docs/${slug}`
		});
	}

	// 3. Not found
	error(404, `OG image for "${slug}" not found`);
};
