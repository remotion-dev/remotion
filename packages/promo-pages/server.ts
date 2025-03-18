import {serve} from 'bun';
import homepage from './index.html';

const server = serve({
	routes: {
		'/': homepage,
	},
	development: true,
	async fetch(req) {
		try {
			const url = new URL(req.url);
			const file = Bun.file(`./public${url.pathname}`);
			const exists = await file.exists();
			if (!exists) {
				return new Response('Not Found', {status: 404});
			}
			return new Response(file);
		} catch (e) {
			return new Response('Server Error', {status: 500});
		}
	},
});

console.log(`Listening on ${server.url}`);
