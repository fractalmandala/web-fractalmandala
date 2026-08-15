import { browser } from '$app/environment';

export interface PagefindSubResult {
	title: string;
	url: string;
	excerpt: string;
	anchor?: {
		element: string;
		id: string;
		text: string;
	};
}

export interface PagefindResultData {
	url: string;
	content: string;
	word_count: number;
	filters: Record<string, string[]>;
	meta: {
		title?: string;
		image?: string;
		[key: string]: string | undefined;
	};
	anchors: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations: number[];
	raw_content?: string;
	raw_url?: string;
	excerpt: string;
	sub_results: PagefindSubResult[];
}

export interface PagefindSearchResult {
	id: string;
	score: number;
	words: number[];
	data: () => Promise<PagefindResultData>;
}

export interface PagefindSearchResponse {
	results: PagefindSearchResult[];
	unfilteredResultCount: number;
	filters: Record<string, Record<string, number>>;
	timings: {
		preload: number;
		search: number;
		total: number;
	};
}

export interface PagefindInstance {
	init: () => Promise<void>;
	search: (
		query: string,
		options?: {
			filters?: Record<string, string | string[]>;
			sort?: Record<string, 'asc' | 'desc'>;
		}
	) => Promise<PagefindSearchResponse | null>;
	filters: () => Promise<Record<string, Record<string, number>>>;
	preload: (term: string) => Promise<void>;
}

export interface SearchResultItem {
	id: string;
	url: string;
	title: string;
	section?: string;
	tags?: string[];
	excerpt: string;
	subResults: Array<{
		title: string;
		url: string;
		excerpt: string;
	}>;
}

let pagefindInstance: PagefindInstance | null = null;
let initPromise: Promise<PagefindInstance | null> | null = null;

export async function getPagefind(): Promise<PagefindInstance | null> {
	if (!browser) return null;
	if (pagefindInstance) return pagefindInstance;
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			// Dynamically import the static pagefind bundle generated at build time
			const pf = (await import(/* @vite-ignore */ '/pagefind/pagefind.js')) as PagefindInstance;
			if (pf?.init) {
				await pf.init();
			}
			pagefindInstance = pf;
			return pf;
		} catch (err) {
			console.warn(
				'[Pagefind] Search index not yet available or failed to load. Run `pnpm run build` or `pnpm run index:search`.',
				err
			);
			return null;
		}
	})();

	return initPromise;
}

function cleanDocUrl(rawUrl: string): string {
	let url = rawUrl.replace(/^https?:\/\/[^/]+/, '');
	const [path, hash] = url.split('#');
	let cleanPath = path
		.replace(/\.md\.html$/i, '')
		.replace(/\.html$/i, '')
		.replace(/\.md$/i, '');
	if (!cleanPath.startsWith('/')) {
		cleanPath = `/${cleanPath}`;
	}
	return hash ? `${cleanPath}#${hash}` : cleanPath;
}

export async function searchPagefind(
	query: string,
	options: {
		section?: string | null;
		tag?: string | null;
		limit?: number;
	} = {}
): Promise<{
	results: SearchResultItem[];
	total: number;
	availableFilters: Record<string, Record<string, number>>;
}> {
	const trimmed = query.trim();
	if (!trimmed) {
		return { results: [], total: 0, availableFilters: {} };
	}

	const pagefind = await getPagefind();
	if (!pagefind) {
		return { results: [], total: 0, availableFilters: {} };
	}

	const filters: Record<string, string> = {};
	if (options.section && options.section !== 'all') {
		filters.section = options.section;
	}
	if (options.tag) {
		filters.tag = options.tag;
	}

	const response = await pagefind.search(trimmed, {
		filters: Object.keys(filters).length > 0 ? filters : undefined
	});

	if (!response || !response.results) {
		return { results: [], total: 0, availableFilters: {} };
	}

	const limit = options.limit ?? 10;
	const topResults = response.results.slice(0, limit);
	const resolvedData = await Promise.all(topResults.map((r) => r.data()));

	const formatted: SearchResultItem[] = resolvedData.map((d, index) => {
		const rawSection = d.filters?.section?.[0];
		const rawTags = d.filters?.tag ?? [];

		// Clean up title: Pagefind derives title from meta or h1
		let title = d.meta?.title || '';
		if (!title) {
			const cleanUrl = d.url.replace(/\/$/, '').split('/').pop() || 'Untitled';
			title = cleanUrl.replace(/\.(md|html).*$/i, '').replace(/[-_]/g, ' ');
		}
		// Strip any trailing site suffix if present in meta
		title = title.replace(/\s*·\s*Fractal Mandala$/i, '').trim();

		// Clean and normalize URL for SvelteKit routing
		const url = cleanDocUrl(d.url);

		// Process sub-results (heading sections)
		const subResults = (d.sub_results || []).slice(0, 3).map((sub) => {
			return {
				title: sub.title || 'Section',
				url: cleanDocUrl(sub.url),
				excerpt: sub.excerpt || ''
			};
		});

		return {
			id: topResults[index].id || `${url}-${index}`,
			url,
			title,
			section: rawSection,
			tags: rawTags,
			excerpt: d.excerpt || '',
			subResults
		};
	});

	return {
		results: formatted,
		total: response.unfilteredResultCount ?? response.results.length,
		availableFilters: response.filters ?? {}
	};
}
