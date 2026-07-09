import {rewrite} from '@vercel/functions';

export const config = {
	matcher: ['/pricing', '/docs/:path*', '/elements/:path*'],
};

function parseAcceptHeader(acceptHeader: string): string[] {
	return acceptHeader
		.split(',')
		.map((type) => {
			const [mediaType, ...params] = type.trim().split(';');
			const qMatch = params.find((p) => p.trim().startsWith('q='));
			const quality = qMatch ? parseFloat(qMatch.split('=')[1]) : 1.0;
			return {mediaType: mediaType.trim(), quality};
		})
		.sort((a, b) => b.quality - a.quality)
		.map((item) => item.mediaType);
}

function prefersMarkdown(
	acceptHeader: string | null,
	userAgent: string | null,
): boolean {
	if (userAgent) {
		const llmAgents = ['Claude-User', 'opencode'];
		for (const agent of llmAgents) {
			if (userAgent.includes(agent)) {
				return true;
			}
		}
	}

	if (!acceptHeader) {
		return false;
	}

	const acceptedTypes = parseAcceptHeader(acceptHeader);

	const markdownTypes = ['text/markdown', 'text/x-markdown', 'text/plain'];

	for (const type of acceptedTypes) {
		if (markdownTypes.includes(type)) {
			return true;
		}

		if (type === 'text/html' || type.startsWith('text/html;')) {
			return false;
		}

		if (type === '*/*') {
			return false;
		}
	}

	return false;
}

export default function middleware(request: Request) {
	const url = new URL(request.url);
	const pathname = url.pathname;

	if (pathname === '/pricing') {
		return Response.redirect(new URL('/docs/license/pricing', request.url), 308);
	}

	if (pathname === '/docs/pricing') {
		return Response.redirect(new URL('/docs/license/pricing', request.url), 308);
	}

	if (pathname === '/docs/license-pricing-compliance/faq') {
		return Response.redirect(new URL('/docs/license/faq', request.url), 308);
	}

	if (pathname === '/docs/license/license-faq') {
		return Response.redirect(new URL('/docs/license/faq', request.url), 308);
	}

	if (!pathname.startsWith('/docs/') && !pathname.startsWith('/elements/')) {
		return;
	}

	// Case 1: .md extension - rewrite to raw markdown
	// Example: /docs/preview.md → /_raw/docs/preview.md
	// Example: /elements/overlays/lower-third.md → /_raw/elements/overlays/lower-third.md
	if (pathname.endsWith('.md')) {
		const targetPath = pathname.replace(/^\/(docs|elements)\//, '/_raw/$1/');
		return rewrite(new URL(targetPath, request.url));
	}

	// Case 2: Accept header or user agent prefers markdown - rewrite to raw markdown
	// Example: /docs/preview + Accept: text/markdown → /_raw/docs/preview.md
	// Example: /elements/overlays/lower-third + User-Agent: Claude → /_raw/elements/overlays/lower-third.md
	const acceptHeader = request.headers.get('accept');
	const userAgent = request.headers.get('user-agent');
	if (prefersMarkdown(acceptHeader, userAgent)) {
		const cleanPathname = pathname.replace(/\/$/, '');
		const targetPath = `/_raw${cleanPathname}.md`;
		return rewrite(new URL(targetPath, request.url));
	}
}
