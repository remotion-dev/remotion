import {$} from 'bun';
import {test} from 'bun:test';
import path from 'path';

test(
	'The Next.js testbed should compile without',
	async () => {
		await $`bun run build-site`.cwd(
			path.join(__dirname, '..', '..', '..', 'player-example'),
		);
	},
	{
		timeout: 60000,
	},
);
