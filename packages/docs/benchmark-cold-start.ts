import {rm} from 'node:fs/promises';
import path from 'node:path';

const docsRoot = __dirname;
const readinessUrl = 'http://127.0.0.1:3000/docs/';
const defaultTimeoutMs = 10 * 60 * 1000;

const printUsage = () => {
	console.log(`Benchmark a cold start of the docs development server.

Usage:
  bun benchmark-cold-start.ts [--runs=<count>] [--timeout=<seconds>]

The benchmark removes Docusaurus's generated files and package-local caches,
then runs the same \`bun run start\` command used for docs development. Installed
dependencies, Turbo's cache, and package build output are preserved to match a
newly prepared worktree.
`);
};

const parsePositiveInteger = ({name, value}: {name: string; value: string}) => {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`${name} must be a positive integer, got ${value}`);
	}

	return parsed;
};

const getOptions = () => {
	let runs = 1;
	let timeoutMs = defaultTimeoutMs;

	for (const argument of process.argv.slice(2)) {
		if (argument === '--help' || argument === '-h') {
			printUsage();
			process.exit(0);
		}

		if (argument.startsWith('--runs=')) {
			runs = parsePositiveInteger({
				name: '--runs',
				value: argument.slice('--runs='.length),
			});
			continue;
		}

		if (argument.startsWith('--timeout=')) {
			timeoutMs =
				parsePositiveInteger({
					name: '--timeout',
					value: argument.slice('--timeout='.length),
				}) * 1000;
			continue;
		}

		throw new Error(`Unknown argument: ${argument}`);
	}

	return {runs, timeoutMs};
};

const isDocsServerRunning = async () => {
	try {
		await fetch(readinessUrl, {signal: AbortSignal.timeout(1000)});
		return true;
	} catch {
		return false;
	}
};

const forwardOutput = async ({
	stream,
	output,
	onText,
}: {
	stream: ReadableStream<Uint8Array>;
	output: NodeJS.WriteStream;
	onText: (text: string) => void;
}) => {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	while (true) {
		const {done, value} = await reader.read();
		if (done) {
			onText(decoder.decode());
			return;
		}

		onText(decoder.decode(value, {stream: true}));
		output.write(value);
	}
};

const killProcessGroup = ({
	pid,
	signal,
}: {
	pid: number;
	signal: NodeJS.Signals;
}) => {
	try {
		if (process.platform !== 'win32') {
			process.kill(-pid, signal);
			return;
		}
	} catch {
		// Fall back to the direct process if the process group has exited.
	}

	try {
		process.kill(pid, signal);
	} catch {
		// The process already exited.
	}
};

const waitForServerToStop = async () => {
	const deadline = performance.now() + 5000;
	while (performance.now() < deadline) {
		if (!(await isDocsServerRunning())) {
			return;
		}

		await Bun.sleep(100);
	}

	throw new Error(`Docs server was still responding after shutdown`);
};

const stopServer = async (server: ReturnType<typeof Bun.spawn>) => {
	killProcessGroup({pid: server.pid, signal: 'SIGTERM'});

	const exitedGracefully = await Promise.race([
		server.exited.then(() => true),
		Bun.sleep(2000).then(() => false),
	]);

	if (!exitedGracefully) {
		killProcessGroup({pid: server.pid, signal: 'SIGKILL'});
		await server.exited;
	}
};

const resetColdCaches = async () => {
	await Promise.all([
		rm(path.join(docsRoot, '.docusaurus'), {force: true, recursive: true}),
		rm(path.join(docsRoot, 'node_modules', '.cache'), {
			force: true,
			recursive: true,
		}),
	]);
};

const runBenchmark = async ({
	run,
	timeoutMs,
}: {
	run: number;
	timeoutMs: number;
}) => {
	console.log(`\nCold docs startup run ${run}`);
	console.log('Removing .docusaurus and packages/docs/node_modules/.cache...');
	await resetColdCaches();

	const startedAt = performance.now();
	const server = Bun.spawn(['bun', 'run', 'start'], {
		cwd: docsRoot,
		detached: process.platform !== 'win32',
		env: {
			...process.env,
			// Avoid opening another browser tab on every benchmark iteration.
			DOCUSAURUS_BROWSER:
				process.platform === 'win32'
					? process.env.DOCUSAURUS_BROWSER
					: '/usr/bin/true',
			NO_COLOR: '1',
		},
		stderr: 'pipe',
		stdout: 'pipe',
	});
	let recentOutput = '';
	let docusaurusStartedAt: number | null = null;
	let compilationSucceeded = false;
	let compilationFailed = false;
	const onText = (text: string) => {
		recentOutput = (recentOutput + text).slice(-500);
		if (
			docusaurusStartedAt === null &&
			recentOutput.includes('[INFO] Starting the development server...')
		) {
			docusaurusStartedAt = performance.now();
		}

		if (recentOutput.includes('compiled successfully')) {
			compilationSucceeded = true;
		}

		if (/compiled with \d+ errors?/.test(recentOutput)) {
			compilationFailed = true;
		}
	};
	const stdout = forwardOutput({
		stream: server.stdout,
		output: process.stdout,
		onText,
	});
	const stderr = forwardOutput({
		stream: server.stderr,
		output: process.stderr,
		onText,
	});

	try {
		while (performance.now() - startedAt < timeoutMs) {
			if (compilationFailed) {
				throw new Error('Docs client compilation failed');
			}

			if (server.exitCode !== null) {
				throw new Error(
					`Docs server exited with code ${server.exitCode} before becoming ready`,
				);
			}

			try {
				const response = await fetch(readinessUrl, {
					signal: AbortSignal.timeout(1000),
				});
				if (response.ok && compilationSucceeded) {
					const readyAt = performance.now();
					const durationMs = readyAt - startedAt;
					const preDocusaurusMs =
						docusaurusStartedAt === null
							? null
							: docusaurusStartedAt - startedAt;
					const docusaurusCompileMs =
						docusaurusStartedAt === null ? null : readyAt - docusaurusStartedAt;
					console.log(`\nCOLD_START_MS=${durationMs.toFixed(0)}`);
					if (preDocusaurusMs !== null && docusaurusCompileMs !== null) {
						console.log(`PRE_DOCUSAURUS_MS=${preDocusaurusMs.toFixed(0)}`);
						console.log(
							`DOCUSAURUS_COMPILE_MS=${docusaurusCompileMs.toFixed(0)}`,
						);
					}

					return {durationMs, docusaurusCompileMs, preDocusaurusMs};
				}
			} catch {
				// The server is not listening or is still compiling.
			}

			await Bun.sleep(250);
		}

		throw new Error(`Docs server did not become ready within ${timeoutMs}ms`);
	} finally {
		await stopServer(server);
		await Promise.all([stdout, stderr]);
		await waitForServerToStop();
	}
};

const median = (values: number[]) => {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[middle - 1] + sorted[middle]) / 2
		: sorted[middle];
};

const main = async () => {
	const options = getOptions();
	if (await isDocsServerRunning()) {
		throw new Error(`A server is already responding at ${readinessUrl}`);
	}

	const results = [];
	for (let run = 1; run <= options.runs; run++) {
		results.push(await runBenchmark({run, timeoutMs: options.timeoutMs}));
	}

	if (results.length > 1) {
		const durations = results.map((result) => result.durationMs);
		const docusaurusDurations = results.flatMap((result) =>
			result.docusaurusCompileMs === null ? [] : [result.docusaurusCompileMs],
		);
		console.log(`\nCold startup results (${durations.length} runs)`);
		console.log(`Min: ${(Math.min(...durations) / 1000).toFixed(3)}s`);
		console.log(`Median: ${(median(durations) / 1000).toFixed(3)}s`);
		console.log(`Max: ${(Math.max(...durations) / 1000).toFixed(3)}s`);
		console.log(`COLD_START_MEDIAN_MS=${median(durations).toFixed(0)}`);
		if (docusaurusDurations.length === results.length) {
			console.log(
				`DOCUSAURUS_COMPILE_MEDIAN_MS=${median(docusaurusDurations).toFixed(0)}`,
			);
		}
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
