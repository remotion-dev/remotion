import {spawn} from 'child_process';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const lowMemoryBuild =
	isVercel || process.env.REMOTION_DOCS_LOW_MEMORY_BUILD === '1';

const appendNodeOption = (value: string) => {
	const current = process.env.NODE_OPTIONS ?? '';
	if (current.includes('--max-old-space-size=')) {
		return current;
	}

	return [current, value].filter(Boolean).join(' ');
};

const run = (
	command: string,
	args: string[],
	env: Record<string, string | undefined> = {},
) =>
	new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {
			env: {...process.env, ...env},
			shell: false,
			stdio: 'inherit',
		});

		child.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
			}
		});

		child.on('error', reject);
	});

const docusaurusEnv = {
	DOCUSAURUS_IGNORE_SSG_WARNINGS: 'true',
	NODE_OPTIONS: appendNodeOption('--max-old-space-size=4096'),
	...(lowMemoryBuild
		? {
				DOCUSAURUS_SSG_WORKER_THREAD_COUNT:
					process.env.DOCUSAURUS_SSG_WORKER_THREAD_COUNT ?? '2',
				DOCUSAURUS_SSG_WORKER_THREAD_TASK_SIZE:
					process.env.DOCUSAURUS_SSG_WORKER_THREAD_TASK_SIZE ?? '5',
				DOCUSAURUS_SSR_CONCURRENCY:
					process.env.DOCUSAURUS_SSR_CONCURRENCY ?? '8',
			}
		: null),
};

const twoslashEnv = lowMemoryBuild
	? {
			TWOSLASH_WORKER_COUNT: process.env.TWOSLASH_WORKER_COUNT ?? '2',
			TWOSLASH_RECYCLE_LIMIT_BYTES:
				process.env.TWOSLASH_RECYCLE_LIMIT_BYTES ?? String(1024 * 1024 * 1024),
		}
	: {};

await run('bun', ['copy-raw-docs.ts']);
await run('bun', ['fetch-prompt-submissions.ts']);
await run('bun', ['prewarm-twoslash.ts'], twoslashEnv);
await run('docusaurus', ['build'], docusaurusEnv);
await run('bun', ['copy-convert.ts']);
await run('bun', ['count-pages.ts']);
