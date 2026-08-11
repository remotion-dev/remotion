import {serve} from 'bun';
import variants from '../variants.json';
import index from './index.html';
import {makeLlmsText} from './llms';

const llmsText = makeLlmsText(variants);
const varyHeader = 'Accept, User-Agent';

const parseAcceptHeader = (acceptHeader: string): string[] => {
	return acceptHeader
		.split(',')
		.map((type) => {
			const [mediaType, ...params] = type.trim().split(';');
			const qMatch = params.find((param) => param.trim().startsWith('q='));
			const quality = qMatch ? Number.parseFloat(qMatch.split('=')[1]) : 1;
			return {mediaType: mediaType.trim(), quality};
		})
		.sort((a, b) => b.quality - a.quality)
		.map(({mediaType}) => mediaType);
};

const prefersMarkdown = (request: Request): boolean => {
	const userAgent = request.headers.get('user-agent');
	if (
		userAgent &&
		['Claude-User', 'opencode'].some((agent) => userAgent.includes(agent))
	) {
		return true;
	}

	const acceptHeader = request.headers.get('accept');
	if (!acceptHeader) {
		return false;
	}

	for (const type of parseAcceptHeader(acceptHeader)) {
		if (['text/markdown', 'text/x-markdown', 'text/plain'].includes(type)) {
			return true;
		}

		if (type === 'text/html' || type === '*/*') {
			return false;
		}
	}

	return false;
};

const makeMarkdownResponse = (contentType: string) => {
	return new Response(llmsText, {
		headers: {
			'Content-Type': `${contentType}; charset=utf-8`,
			Vary: varyHeader,
		},
	});
};

serve({
	routes: {
		'/': async (request, server) => {
			if (prefersMarkdown(request)) {
				return makeMarkdownResponse('text/markdown');
			}

			const response = await fetch(new URL('/index.html', server.url));
			response.headers.set('Vary', varyHeader);
			return response;
		},
		'/llms.txt': makeMarkdownResponse('text/plain'),
		// Serve index.html for all unmatched routes.
		'/*': index,
	},
	development: process.env.NODE_ENV !== 'production' && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});
