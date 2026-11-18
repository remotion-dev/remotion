// Share the worker budget within one browser, instead of across three browser
// processes competing for the same graphics resources on a CI runner.
for (const browser of ['chromium', 'firefox', 'webkit']) {
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
				...process.argv.slice(2),
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
