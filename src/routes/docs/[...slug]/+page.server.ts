import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import { getDoc, getSection, crumbs, allPages, docSections } from '$lib/docs/content';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const docSlugs = allPages
		.map((p) => (p.href ? p.href.replace(/^\/docs\/?/, '') : ''))
		.filter(Boolean);
	const sectionSlugs = docSections.map((s) => s.path);
	const uniqueSlugs = Array.from(new Set([...docSlugs, ...sectionSlugs]));
	return uniqueSlugs.map((slug) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug ?? '';
	const pathname = `/docs/${slug}`;

	// 1. A real document wins
	const doc = getDoc(slug);
	if (doc) {
		const trail = crumbs(pathname);
		const breadcrumbs = [
			{ name: 'Home', url: '/' },
			...trail.map((crumb) => ({
				name: crumb.label,
				url: crumb.href || `/docs/${slug}`
			}))
		];

		const meta = (doc.metadata || {}) as {
			tags?: string[];
			date?: string | Date;
			group?: string;
		};

		const rootSegment = slug.split('/')[0] ?? '';
		const sectionObj = getSection(rootSegment);
		const sectionName = sectionObj?.title ?? meta.group ?? 'Docs';

		const description =
			doc.description ||
			`${doc.title} — essay and research document in the ${sectionName} collection.`;

		let publishedDate: string | undefined;
		if (meta.date) {
			try {
				publishedDate = new Date(meta.date).toISOString();
			} catch {
				publishedDate = undefined;
			}
		}

		return {
			kind: 'document' as const,
			slug,
			seo: {
				title: `${doc.title} · Fractal Mandala`,
				description,
				url: `/docs/${slug}`,
				siteUrl: 'https://fractalmandala.in',
				siteName: 'Fractal Mandala',
				image: `/docs/${slug}/og.png`,
				imageAlt: `${doc.title} · Fractal Mandala`,
				type: 'article' as const,
				language: 'en-US',
				locale: 'en_US',
				tags: (Array.isArray(meta.tags) ? meta.tags : []).map(String),
				section: sectionName,
				publishedDate,
				breadcrumbs
			}
		};
	}

	// 2. Otherwise a bare folder path renders a derived section index
	const section = getSection(slug);
	if (section) {
		const trail = crumbs(pathname);
		const breadcrumbs = [
			{ name: 'Home', url: '/' },
			...trail.map((crumb) => ({
				name: crumb.label,
				url: crumb.href || `/docs/${slug}`
			}))
		];

		return {
			kind: 'section' as const,
			slug,
			seo: {
				title: `${section.title} · Fractal Mandala`,
				description: `Explore ${section.pages.length} documents and essays in the ${section.title} knowledge bank.`,
				url: `/docs/${slug}`,
				siteUrl: 'https://fractalmandala.in',
				siteName: 'Fractal Mandala',
				image: `/docs/${slug}/og.png`,
				imageAlt: `${section.title} · Fractal Mandala`,
				type: 'website' as const,
				language: 'en-US',
				locale: 'en_US',
				section: section.title,
				breadcrumbs
			}
		};
	}

	// 3. Genuinely unknown, or removed by the collection filter
	error(404, `Document "${slug || 'index'}" not found`);
};
