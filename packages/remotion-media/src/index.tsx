import {serve} from 'bun';
import index from './index.html';

serve({
	routes: {
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
