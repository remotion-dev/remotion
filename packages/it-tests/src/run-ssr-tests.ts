import {readdirSync} from 'node:fs';
import path from 'node:path';

const packageRoot = path.join(import.meta.dir, '..');
const requestedFiles = Bun.argv.slice(2);
const testFiles = requestedFiles.length
	? requestedFiles
	: ['ssr', 'bundle', 'webcodecs'].flatMap((directory) =>
			readdirSync(path.join(import.meta.dir, directory))
				.filter((file) => file.endsWith('.test.ts'))
				.sort()
				.map((file) => `./src/${directory}/${file}`),
		);

for (const testFile of testFiles) {
	for (let attempt = 1; attempt <= 2; attempt++) {
		const subprocess = Bun.spawn(
			[process.execPath, 'test', testFile, '--timeout', '40000'],
			{
				cwd: packageRoot,
				detached: process.platform !== 'win32',
				env: process.env,
				stdin: 'ignore',
				stdout: 'inherit',
				stderr: 'inherit',
			},
		);
		let timedOut = false;
		let forceKillTimeout: ReturnType<typeof setTimeout> | null = null;
		const killSubprocess = (signal: 'SIGKILL' | 'SIGTERM') => {
			try {
				if (process.platform !== 'win32') {
					process.kill(-subprocess.pid, signal);
					return;
				}
			} catch {
				// Fall back to killing the direct child if its process group is gone.
			}

			subprocess.kill(signal);
		};
		const timeout = setTimeout(() => {
			timedOut = true;
			killSubprocess('SIGTERM');
			forceKillTimeout = setTimeout(() => {
				killSubprocess('SIGKILL');
			}, 2_000);
		}, 90_000);
		const exitCode = await subprocess.exited;
		clearTimeout(timeout);
		if (forceKillTimeout !== null) {
			clearTimeout(forceKillTimeout);
		}

		if (timedOut && attempt === 1) {
			console.error(`${testFile} timed out. Retrying in a clean process.`);
			continue;
		}

		if (timedOut) {
			throw new Error(`${testFile} timed out twice.`);
		}

		if (exitCode !== 0) {
			process.exit(exitCode);
		}

		break;
	}
}
