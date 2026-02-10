import {serve} from 'bun';
import homepage from './homepage.html';
import promptsShow from './prompts-show.html';
import promptsSubmit from './prompts-submit.html';
import prompts from './prompts.html';
import team from './team.html';

const server = serve({
	routes: {
		'/': homepage,
		'/about': team,
		'/prompts': prompts,
		'/prompts/show': promptsShow,
		'/prompts/submit': promptsSubmit,
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
