import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitOG } from '@ethercorps/sveltekit-og/plugin';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				//
				// Markdown is also exempt. mdsvex generates its layout wrapper as
				// `<Layout {...$$props} {...metadata}>`, and `$$props` is a legacy API that
				// runes mode rejects outright. Compiled .md/.svx output is a generated
				// legacy-mode artifact like any library file, so it opts out the same way.
				runes: ({ filename }) => {
					if (/\.(md|svx)$/.test(filename)) return undefined;
					return filename.split(/[/\\]/).includes('node_modules') ? undefined : true;
				}
			},
			adapter: adapter(),
			// Replaces the bare mdsvex() call. Acrolls owns the Markdown *compile* pipeline:
			// GFM, frontmatter, heading slugs/anchors, table wrapping, Shiki code frames, and
			// the source-safety normalization that keeps a malformed document from taking
			// down the build. Do not stack a second mdsvex preprocessor alongside this one.
			//
			// Deliberately the base preprocessor, not the SvelteKit one: the SvelteKit
			// variant defaults `layout` to Acrolls' PublicationLayout, which wraps every
			// document in <article class="acrolls"> and renders a Banner from frontmatter.
			// We own the shell, nav, TOC, and body here, so no layout is applied and each
			// .md compiles to bare content we place ourselves.
			preprocess: [
				createAcrollsMdsvexPreprocessor({
					// This corpus predates the Acrolls contract, so it is migration, not authored:
					// frontmatter is optional and a few documents will not compile. The default
					// policy is fail-fast, which takes the whole build down for one bad file.
					// 'error-page' isolates it as a routable diagnostic page instead.
					// `acrolls validate src/docs --mode migration` lists the current offenders.
					docs: { mode: 'migration' },
					onInvalidDocument: 'error-page'
				})
			],
			prerender: {
				handleHttpError: ({ path, referrer, message }) => {
					// Ignore 404s on legacy markdown relative links/images during prerender
					console.warn(`[Prerender Notice] ${message} (${path} linked from ${referrer})`);
				}
			},
			extensions: ['.svelte', '.svx', '.md']
		}),
		sveltekitOG()
	]
});
