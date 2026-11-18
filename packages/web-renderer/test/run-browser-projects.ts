import {parseCLI} from 'vitest/node';

const browsers = ['chromium', 'firefox', 'webkit'];
let optionsEnded = false;
const args = process.argv.slice(2).map((argument) => {
	if (argument === '--') optionsEnded = true;
	if (optionsEnded) return argument;
	// Keep short and long filters in one array when Vitest parses mixed aliases.
	if (argument === '-p') return '--project';
	if (argument.startsWith('-p=')) return `--project=${argument.slice(3)}`;
	if (argument.startsWith('-p')) return `--project=${argument.slice(2)}`;
	return argument;
});
const {options} = parseCLI(['vitest', ...args]);
const patterns = options.project ?? [];
const wildcard = (pattern: string) =>
	new RegExp(
		`^${pattern
			.split('*')
			.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.join('.*')}$`,
		'i',
	);
const included = patterns
	.filter((pattern) => !pattern.startsWith('!'))
	.map(wildcard);
const excluded = patterns
	.filter((pattern) => pattern.startsWith('!'))
	.map((pattern) => wildcard(pattern.slice(1)));
const selected = browsers.filter(
	(browser) =>
		!excluded.some((pattern) => pattern.test(browser)) &&
		(included.length === 0 ||
			included.some((pattern) => pattern.test(browser))),
);
if (selected.length === 0) {
	// eslint-disable-next-line no-console
	console.error('No browser projects match the requested project filters');
	process.exitCode = 1;
}

// Share the worker budget within one browser, instead of across three browser
// processes competing for the same graphics resources on a CI runner.
for (const browser of selected) {
	try {
		const child = Bun.spawn(
			[
				'bunx',
				'vitest',
				'src/test',
				'--browser',
				'--run',
				'--project',
				browser,
				// Vitest combines positive filters. Exclude the other instances so
				// forwarded filters can never expand this child to another browser.
				...browsers
					.filter((other) => other !== browser)
					.flatMap((other) => ['--project', `!${other}`]),
				...args,
			],
			{stdin: 'inherit', stdout: 'inherit', stderr: 'inherit'},
		);
		if ((await child.exited) !== 0) process.exitCode = 1;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`Could not run ${browser} browser tests`, error);
		process.exitCode = 1;
	}
}
