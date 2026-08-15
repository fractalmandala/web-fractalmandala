import type { PageLoad } from './$types';
import type { Component } from 'svelte';
import { getDoc } from '$lib/docs/content';

export const load: PageLoad = async ({ data, params }) => {
	const slug = params.slug ?? '';
	if (data && data.kind === 'document') {
		const doc = getDoc(slug);
		if (doc) {
			const mod = (await doc.loader()) as { default?: Component } | Component;
			const component = (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod) as Component;
			return {
				...data,
				component
			};
		}
	}
	return data;
};
