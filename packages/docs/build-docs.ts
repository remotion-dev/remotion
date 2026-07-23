import {spawn} from 'child_process';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const lowMemoryBuild =
	isVercel || process.env.REMOTION_DOCS_LOW_MEMORY_BUILD === '1';
const heartbeatIntervalMs = process.env.REMOTION_DOCS_BUILD_HEARTBEAT_MS
	? parseInt(process.env.REMOTION_DOCS_BUILD_HEARTBEAT_MS, 10)
	: isVercel
		? 60_000
		: 0;

const formatDuration = (ms: number) => {
	const seconds = ms / 1000;
	if (seconds < 60) {
		return `${seconds.toFixed(1)}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60)
		.toString()
		.padStart(2, '0');
	return `${minutes}m ${remainingSeconds}s`;
};

const appendNodeOption = (value: string) => {
	const current = process.env.NODE_OPTIONS ?? '';
	if (current.includes('--max-old-space-size=')) {
		return current;
	}

	return [current, value].filter(Boolean).join(' ');
};

const nodeOldSpaceSize = process.env.REMOTION_DOCS_NODE_OLD_SPACE_MB
	? parseInt(process.env.REMOTION_DOCS_NODE_OLD_SPACE_MB, 10)
	: lowMemoryBuild
		? 3072
		: 4096;

const run = (
	label: string,
	command: string,
	args: string[],
	env: Record<string, string | undefined> = {},
) =>
	new Promise<void>((resolve, reject) => {
		const start = performance.now();
		console.log(`[docs build] Starting ${label}...`);
		const child = spawn(command, args, {
			env: {...process.env, ...env},
			shell: false,
			stdio: 'inherit',
		});
		const heartbeat =
			heartbeatIntervalMs > 0 && Number.isFinite(heartbeatIntervalMs)
				? setInterval(() => {
						console.log(
							`[docs build] Still running ${label} after ${formatDuration(
								performance.now() - start,
							)}...`,
						);
					}, heartbeatIntervalMs)
				: null;
		heartbeat?.unref();

		const clearHeartbeat = () => {
			if (heartbeat) {
				clearInterval(heartbeat);
			}
		};

		child.on('close', (code, signal) => {
			clearHeartbeat();
			if (code === 0) {
				console.log(
					`[docs build] Finished ${label} in ${formatDuration(
						performance.now() - start,
					)}.`,
				);
				resolve();
			} else {
				reject(
					new Error(
						`${label} (${command} ${args.join(' ')}) exited with code ${code}, signal ${signal}`,
					),
				);
			}
		});

		child.on('error', (err) => {
			clearHeartbeat();
			reject(err);
		});
	});

const docusaurusEnv = {
	DOCUSAURUS_IGNORE_SSG_WARNINGS: 'true',
	DOCUSAURUS_NO_PERSISTENT_CACHE: lowMemoryBuild ? 'true' : undefined,
	DOCUSAURUS_PERF_LOGGER:
		process.env.DOCUSAURUS_PERF_LOGGER ?? (isVercel ? 'true' : undefined),
	NODE_OPTIONS: appendNodeOption(`--max-old-space-size=${nodeOldSpaceSize}`),
	...(lowMemoryBuild
		? {
				DOCUSAURUS_SSG_WORKER_THREAD_COUNT:
					process.env.DOCUSAURUS_SSG_WORKER_THREAD_COUNT ?? '1',
				DOCUSAURUS_SSG_WORKER_THREAD_RECYCLER_MAX_MEMORY:
					process.env.DOCUSAURUS_SSG_WORKER_THREAD_RECYCLER_MAX_MEMORY ??
					String(512 * 1024 * 1024),
				DOCUSAURUS_SSG_WORKER_THREAD_TASK_SIZE:
					process.env.DOCUSAURUS_SSG_WORKER_THREAD_TASK_SIZE ?? '1',
				DOCUSAURUS_SSR_CONCURRENCY:
					process.env.DOCUSAURUS_SSR_CONCURRENCY ?? '2',
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
const docusaurusBuild = lowMemoryBuild
	? {
			command: 'node',
			args: ['build-docusaurus-low-memory.cjs'],
		}
	: {
			command: 'bunx',
			args: ['docusaurus', 'build'],
		};

await run('copy raw docs', 'bun', ['copy-raw-docs.ts']);
await run('fetch prompt submissions', 'bun', ['fetch-prompt-submissions.ts']);
await run('prewarm twoslash', 'bun', ['prewarm-twoslash.ts'], twoslashEnv);
await run(
	'Docusaurus build',
	docusaurusBuild.command,
	docusaurusBuild.args,
	docusaurusEnv,
);
await run('copy convert assets', 'bun', ['copy-convert.ts']);
await run('count generated pages', 'bun', ['count-pages.ts']);
