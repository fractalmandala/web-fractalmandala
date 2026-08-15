/**
 * Headless docs data.
 *
 * Everything here is plain serializable data or pure functions re-exported from Acrolls.
 * No Acrolls components and no Acrolls CSS are involved — the shell, nav, TOC, and body
 * markup are all ours. Acrolls' job is limited to: discovering the corpus, compiling each
 * document, and deriving titles/sections/routes/order from it.
 */
import {
	buildDocsCrumbs,
	docsPager,
	findActiveSection,
	findActiveTrail,
	flattenDocsNav,
	openIdsForPath,
	scanHeadings
} from 'acrolls/docs';
import type { DocsCrumb, DocsNavNode, DocsPagerLink, DocsTocItem } from 'acrolls/docs';
import { docs } from './source';

export { docs };
export type { DocsCrumb, DocsNavNode, DocsPagerLink, DocsTocItem };

/** Top-level sections, in configured order. `items` is the recursive page tree. */
export const sections = docs.nav.sections;

/** Every visible page as a flat list — useful for search, feeds, sitemaps. */
export const allPages = flattenDocsNav(docs.nav);

/** Corpus title/subtitle/base path, from defineDocsConfig. */
export const site = {
	title: docs.nav.title,
	subtitle: docs.nav.subtitle,
	baseHref: docs.nav.baseHref
};

/** Build/compile diagnostics for this corpus (schema failures, admission warnings). */
export const diagnostics = docs.diagnostics;

/**
 * Section landing pages.
 *
 * This corpus has no index.md anywhere, so Acrolls builds each folder as a navigation
 * group with no landing page and refuses to invent one (it will not redirect a group to
 * an arbitrary first child). These entries are derived instead, from data Acrolls already
 * produced, so /docs/writings etc. resolve without authoring seven files.
 *
 * The folder path is recovered from the first child href rather than from `section.id`,
 * because Acrolls hashes ids (`section-<stableId>`) and they are not path-derived.
 *
 * If you later add src/docs/<folder>/index.md, Acrolls picks it up as the real landing
 * page and `landingSlug` becomes non-null — the route below prefers it automatically.
 */
export type DocsSection = {
	id: string;
	title: string;
	/** Path segment, e.g. "writings". */
	path: string;
	href: string;
	/** Set only when the folder has a real index.md landing document. */
	landingSlug: string | null;
	pages: DocsNavNode[];
};

function pathFromHref(href: string): string {
	const base = docs.nav.baseHref.replace(/\/$/, '');
	const rest = href.startsWith(base) ? href.slice(base.length) : href;
	return rest.replace(/^\/+/, '').split('/')[0] ?? '';
}

export const docSections: DocsSection[] = docs.nav.sections
	.map((section) => {
		// A section's own href exists only when it has a landing document.
		const path = section.href
			? pathFromHref(section.href)
			: pathFromHref(section.items.find((i) => i.href)?.href ?? '');
		if (!path) return null;
		return {
			id: section.id,
			title: section.title,
			path,
			href: `${docs.nav.baseHref.replace(/\/$/, '')}/${path}`,
			landingSlug: section.slug ?? null,
			pages: section.items
		} satisfies DocsSection;
	})
	.filter((s): s is DocsSection => s !== null);

/** Look up a section by its path segment, e.g. "writings". */
export function getSection(path: string): DocsSection | undefined {
	return docSections.find((s) => s.path === path);
}

/** One document's metadata record, or undefined. Accepts slug, href, or source key. */
export function getDoc(slug: string) {
	return docs.get(slug);
}

/**
 * Frontmatter tags for a document, resolved by href/slug/key.
 *
 * Nav nodes (DocsNavNode) don't carry tags — only `metadata` on the resolved document does —
 * so card lists must look the document up. Returns [] when the ref is missing, the document
 * is unknown, or it has no `tags` array.
 */
export function docTags(ref: string | undefined | null): string[] {
	if (!ref) return [];
	const tags = (docs.get(ref)?.metadata as { tags?: unknown } | undefined)?.tags;
	return Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : [];
}

/** One tag plus how many documents carry it, and its browse-page href. */
export type TagSummary = { tag: string; href: string; count: number };

/** URL for a tag's browse page. Encoded so tags with spaces/punctuation stay routeable. */
export function tagHref(tag: string): string {
	return `/docs/tags/${encodeURIComponent(tag)}`;
}

/**
 * Every distinct tag across the corpus, alphabetical, with document counts.
 *
 * Reads `docs.documents` (not the nav tree, which drops tags) and skips hidden documents so
 * the tag index matches what is actually reachable.
 */
export function allTags(): TagSummary[] {
	const counts = new Map<string, number>();
	for (const doc of docs.documents) {
		if (doc.hidden) continue;
		const tags = (doc.metadata as { tags?: unknown } | undefined)?.tags;
		if (!Array.isArray(tags)) continue;
		for (const tag of tags) {
			if (typeof tag !== 'string') continue;
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, href: tagHref(tag), count }))
		.sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * Documents carrying `tag`, shaped as nav nodes so the section-page card markup renders them
 * verbatim. Hidden documents are excluded; results follow corpus order.
 */
export function pagesForTag(tag: string): DocsNavNode[] {
	return docs.documents
		.filter((doc) => {
			if (doc.hidden) return false;
			const tags = (doc.metadata as { tags?: unknown } | undefined)?.tags;
			return Array.isArray(tags) && tags.includes(tag);
		})
		.map((doc) => ({
			id: doc.slug,
			title: doc.title,
			href: doc.href,
			description: doc.description
		}));
}

/** Lazily load one document's compiled Svelte component. */
export function loadDoc(slug: string) {
	return docs.load(slug);
}

/** Every routeable href — for prerender entries or a sitemap. */
export function allHrefs(): string[] {
	return docs.entries();
}

/** Previous/next links for a pathname, following configured order. */
export function pager(pathname: string): { previous: DocsPagerLink; next: DocsPagerLink } {
	return docsPager(docs.nav, pathname);
}

/**
 * Breadcrumb trail for a pathname. Last crumb is the current page and stays unlinked.
 *
 * Acrolls leaves a folder crumb hrefless when that folder has no landing document, which
 * is every folder in this corpus. Since section pages are derived (see `docSections`),
 * the href is filled in here so the section is reachable from the breadcrumb.
 */
export function crumbs(pathname: string): DocsCrumb[] {
	const trail = buildDocsCrumbs(docs.nav, pathname);
	const last = trail.length - 1;
	return trail.map((crumb, i) => {
		if (crumb.href || i === last) return crumb;
		const match = docSections.find((s) => s.title === crumb.label);
		return match ? { ...crumb, href: match.href } : crumb;
	});
}

/** The chain of nav nodes leading to the active page — for highlighting an open path. */
export function activeTrail(pathname: string) {
	return findActiveTrail(docs.nav, pathname);
}

/** The single section containing the current page, or undefined. */
export function activeSection(pathname: string) {
	return findActiveSection(docs.nav, pathname);
}

/**
 * Node ids Acrolls thinks should start open.
 *
 * Careful: this opens every section whose `defaultOpen` is true, and Acrolls sets that
 * on all folders — so for this corpus it returns all seven. Use `activeSection` when you
 * want only the current page's section open.
 */
export function openIds(pathname: string): string[] {
	return openIdsForPath(docs.nav, pathname);
}

/**
 * On-page TOC. Acrolls scans the *rendered* DOM rather than the source, so call this
 * after the article has mounted (in an $effect), not during load.
 */
export function tocFrom(root: ParentNode, minLevel = 2, maxLevel = 3): DocsTocItem[] {
	return scanHeadings({ root, minLevel, maxLevel, ensureIds: true });
}
