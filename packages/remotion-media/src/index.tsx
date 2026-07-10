import {serve} from 'bun';
import variants from '../variants.json';
import {makeAgentsMarkdown} from './agents';
import index from './index.html';

const agentsMarkdown = makeAgentsMarkdown(variants);

serve({
	routes: {
		'/AGENTS.md': new Response(agentsMarkdown, {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
			},
		}),
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
