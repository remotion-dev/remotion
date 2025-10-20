import {NextRequest, NextResponse} from 'next/server';

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

export function middleware(request: NextRequest) {
	const {pathname} = request.nextUrl;

	if (!pathname.startsWith('/docs/')) {
		return NextResponse.next();
	}

	if (pathname.endsWith('.md')) {
		return NextResponse.next();
	}

	const acceptHeader = request.headers.get('accept');

	if (prefersMarkdown(acceptHeader)) {
		const markdownPath = `/_raw${pathname}.md`;

		const url = request.nextUrl.clone();
		url.pathname = markdownPath;

		const response = NextResponse.rewrite(url);
		response.headers.set('Content-Type', 'text/plain; charset=utf-8');
		response.headers.set('X-Content-Negotiation', 'markdown');

		return response;
	}

	return NextResponse.next();
}
