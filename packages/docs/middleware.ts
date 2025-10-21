import {rewrite} from '@vercel/functions';

export const config = {
	matcher: '/docs/:path*',
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

function prefersMarkdown(acceptHeader: string | null): boolean {
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

	if (!pathname.startsWith('/docs/')) {
		return;
	}

	// Case 1: .md extension - rewrite to raw markdown
	// Example: /docs/preview.md → /_raw/docs/preview.md
	if (pathname.endsWith('.md')) {
		const targetPath = pathname.replace(/^\/docs\//, '/_raw/docs/');
		return rewrite(new URL(targetPath, request.url));
	}

	// Case 2: Accept header prefers markdown - rewrite to raw markdown
	// Example: /docs/preview + Accept: text/markdown → /_raw/docs/preview.md
	const acceptHeader = request.headers.get('accept');
	if (prefersMarkdown(acceptHeader)) {
		const targetPath = `/_raw${pathname}.md`;
		return rewrite(new URL(targetPath, request.url));
	}
}
