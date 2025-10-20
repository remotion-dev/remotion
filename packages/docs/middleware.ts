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

export default async function middleware(request: Request) {
	const url = new URL(request.url);
	const pathname = url.pathname;

	if (!pathname.startsWith('/docs/')) {
		return;
	}

	let targetPath: string | null = null;

	if (pathname.endsWith('.md')) {
		targetPath = pathname.replace(/^\/docs\//, '/_raw/docs/');
	} else {
		const acceptHeader = request.headers.get('accept');
		if (prefersMarkdown(acceptHeader)) {
			targetPath = `/_raw${pathname}.md`;
		}
	}

	if (targetPath) {
		const rewriteUrl = new URL(targetPath, request.url);
		const response = await fetch(rewriteUrl.toString(), {
			headers: request.headers,
			method: request.method,
		});

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});
	}
}
