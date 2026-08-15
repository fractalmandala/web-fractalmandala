import type { Component } from 'svelte';
import * as v from 'valibot';
import { content, markdownGlob } from 'acrolls/content';
import { defineDocsConfig } from 'acrolls/docs/content';

type DocsArticle = Component;

/**
 * Frontmatter contract for this corpus.
 *
 * Every field is optional on purpose. This is a migration-mode corpus of 307 documents
 * written over several years, so the schema's job here is to *describe and report*, not to
 * gate. A document whose frontmatter does not match is kept and surfaces an
 * ACROLLS_SCHEMA_INVALID diagnostic; it is not dropped. Switching
 * `convention.mode` to 'authored' below would flip that to fail-fast.
 *
 * `title` in particular stays optional: the content source already derives a readable title
 * from the filename when frontmatter has none, and a few older files use a capitalised
 * `Title:` key that would otherwise reject them.
 */
const frontmatter = v.object({
	title: v.optional(v.string()),
	description: v.optional(v.string()),
	date: v.optional(v.union([v.string(), v.date()])),
	tags: v.optional(v.array(v.string())),
	group: v.optional(v.string()),
	supergroup: v.optional(v.string()),
	order: v.optional(v.number()),
	hidden: v.optional(v.boolean()),
	draft: v.optional(v.boolean())
});

export const docs = content({
	loader: markdownGlob<DocsArticle>({
		// Both globs use the identical pattern. `body` stays lazy so 307 article
		// components are not pulled into the eager module graph; `modules` is eager and
		// carries frontmatter plus Acrolls' compile-time document facts.
		body: import.meta.glob('../../docs/**/*.md', { import: 'default' }) as Record<
			string,
			() => Promise<DocsArticle>
		>,
		modules: import.meta.glob('../../docs/**/*.md', { eager: true }),
		root: '../../docs'
	}),
	schema: frontmatter,
	// Publication boundary, not a confidentiality boundary: a filtered document has no
	// route and 404s, but with a glob loader its compiled body can still be present in
	// build output. Secret content belongs outside src/docs entirely.
	filter: (entry) => !entry.data.draft,
	config: defineDocsConfig({
		title: 'Docs',
		baseHref: '/docs',
		subtitle: 'writings, civilization, history , thinkers, ideas',
		folders: {
			writings: { title: 'Writings', order: 1 },
			civilization: { title: 'Civilization', order: 2 },
			'comparative-civilization': { title: 'Comparative Civilization', order: 3 },
			history: { title: 'History', order: 4 },
			'karmic-streams': { title: 'Karmic Streams', order: 5 },
			'sri-aurobindo': { title: 'Sri Aurobindo', order: 6 },
			'ram-swarup-sita-ram-goel': { title: 'Ram Swarup & Sita Ram Goel', order: 7 }
		}
	})
}).sourceSync();
