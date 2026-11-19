import {appendFileSync} from 'node:fs';
import {parseCLI} from 'vitest/node';

const journal = process.env.REMOTION_PROJECT_TEST_JOURNAL;
if (!journal) throw new Error('Missing browser-project test journal');

// The launcher runs in another Bun process; every Vitest child stays virtual.
Object.defineProperty(Bun, 'spawn', {
	value: (command: string[]) => {
		if (command[0] !== 'bunx' || command[1] !== 'vitest')
			throw new Error('Unexpected child process in launcher test');
		const parsed = parseCLI(command.slice(1)).options;
		appendFileSync(
			journal,
			`${JSON.stringify({
				command,
				parsed: {
					project: parsed.project ?? null,
					reporter: parsed.reporter ?? null,
				},
			})}\n`,
		);
		const project = command[command.indexOf('--project') + 1];
		if (project === process.env.REMOTION_PROJECT_TEST_SPAWN_FAILURE)
			throw new Error('Test process could not spawn');
		return {
			exited: Promise.resolve(
				project === process.env.REMOTION_PROJECT_TEST_FAILURE ? 7 : 0,
			),
		};
	},
});
