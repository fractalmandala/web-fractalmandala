import { ImageResponse } from '@ethercorps/sveltekit-og';
import { GoogleFont, resolveFonts } from '@ethercorps/sveltekit-og/fonts';

let cachedFonts: Awaited<ReturnType<typeof resolveFonts>> | null = null;

async function getFonts() {
	if (!cachedFonts) {
		const fontList = [
			new GoogleFont('Inter', { weight: 400 }),
			new GoogleFont('Inter', { weight: 700 })
		];
		cachedFonts = await resolveFonts(fontList);
	}
	return cachedFonts;
}

export interface DocsOgProps {
	title: string;
	description?: string;
	section?: string;
	badge?: string;
	tags?: string[];
	path?: string;
	siteTitle?: string;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export function generateDocsOgHtml(props: DocsOgProps): string {
	const title = escapeHtml(props.title || 'Fractal Mandala');
	const description = escapeHtml(props.description || '');
	const section = escapeHtml(props.section || 'Docs');
	const badge = escapeHtml(props.badge || props.section || 'Archive');
	const path = escapeHtml(props.path || '/docs');
	const siteTitle = escapeHtml(props.siteTitle || 'FRACTAL MANDALA');

	const titleLength = (props.title || '').length;
	const titleFontSize = titleLength > 80 ? '38px' : titleLength > 45 ? '48px' : '58px';
	const titleLineHeight = titleLength > 80 ? '1.2' : titleLength > 45 ? '1.18' : '1.15';

	const tags = (props.tags || []).slice(0, 3);
	const tagsHtml =
		tags.length > 0
			? tags
					.map(
						(t) =>
							`<div style="display: flex; padding: 4px 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #94a3b8;">#${escapeHtml(String(t).replaceAll('-', ' '))}</div>`
					)
					.join('')
			: `<div style="display: flex; padding: 4px 12px; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); font-size: 13px; color: #fbbf24;">Fractal Mandala Corpus</div>`;

	const pathFormatted = path.replace(/^\//, '').replaceAll('/', ' / ');

	return `
<div style="display: flex; flex-direction: column; justify-content: space-between; width: 1200px; height: 630px; background-color: #090a0f; color: #f8fafc; font-family: 'Inter', sans-serif; box-sizing: border-box; padding: 56px; position: relative;">
	<!-- Ambient Background Glow -->
	<div style="display: flex; position: absolute; top: -100px; right: -100px; width: 450px; height: 450px; border-radius: 9999px; background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(9, 10, 15, 0) 70%);"></div>
	<div style="display: flex; position: absolute; bottom: -80px; left: -80px; width: 400px; height: 400px; border-radius: 9999px; background: radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(9, 10, 15, 0) 70%);"></div>

	<!-- Outer Geometric Borders -->
	<div style="display: flex; position: absolute; top: 24px; left: 24px; right: 24px; bottom: 24px; border: 1px solid rgba(245, 158, 11, 0.22); border-radius: 16px;"></div>
	<div style="display: flex; position: absolute; top: 28px; left: 28px; right: 28px; bottom: 28px; border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 12px;"></div>

	<!-- Top Header: Brand & Section Badge -->
	<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%;">
		<div style="display: flex; flex-direction: row; align-items: center;">
			<div style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); margin-right: 16px; color: #fbbf24; font-size: 24px; font-weight: 700;">
				ॐ
			</div>
			<div style="display: flex; flex-direction: column;">
				<span style="font-size: 18px; font-weight: 800; letter-spacing: 0.14em; color: #f59e0b;">
					${siteTitle}
				</span>
				<span style="font-size: 12px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">
					Knowledge &amp; Civilization Archive
				</span>
			</div>
		</div>

		<div style="display: flex; align-items: center; padding: 8px 18px; border-radius: 9999px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35);">
			<span style="font-size: 15px; font-weight: 700; color: #fbbf24; letter-spacing: 0.06em; text-transform: uppercase;">
				${badge}
			</span>
		</div>
	</div>

	<!-- Main Body: Kicker, Title, Excerpt -->
	<div style="display: flex; flex-direction: column; justify-content: center; width: 100%; margin-top: 16px; margin-bottom: 16px;">
		<div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 14px; font-size: 16px; font-weight: 600; color: #d97706; letter-spacing: 0.06em; text-transform: uppercase;">
			<span>${pathFormatted}</span>
		</div>

		<h1 style="display: flex; margin: 0; font-size: ${titleFontSize}; line-height: ${titleLineHeight}; font-weight: 800; color: #ffffff; letter-spacing: -0.03em; max-height: 220px; overflow: hidden;">
			${title}
		</h1>

		${
			description
				? `<p style="display: flex; margin: 16px 0 0 0; font-size: 22px; line-height: 1.42; color: #94a3b8; font-weight: 400; max-height: 90px; overflow: hidden;">${description}</p>`
				: ''
		}
	</div>

	<!-- Bottom Footer: URL & Metadata -->
	<div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;">
		<div style="display: flex; flex-direction: row; align-items: center; gap: 16px;">
			<span style="font-size: 17px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.02em;">
				fractalmandala.in
			</span>
			<span style="color: #475569; margin: 0 8px;">•</span>
			<span style="font-size: 15px; color: #64748b;">
				Open Research &amp; Philology
			</span>
		</div>

		<div style="display: flex; flex-direction: row; gap: 8px;">
			${tagsHtml}
		</div>
	</div>
</div>
`;
}

export async function renderDocsOgImage(props: DocsOgProps) {
	const fonts = await getFonts();
	const htmlContent = generateDocsOgHtml(props);

	return new ImageResponse(
		htmlContent,
		{
			width: 1200,
			height: 630,
			fonts,
			headers: {
				'Cache-Control': 'public, immutable, max-age=31536000'
			}
		}
	);
}
