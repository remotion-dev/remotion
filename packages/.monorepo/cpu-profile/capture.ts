import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {createInterface} from 'node:readline/promises';

const repositoryRoot = path.resolve(import.meta.dir, '../../..');
const exampleRoot = path.join(repositoryRoot, 'packages', 'example');
const requireFromExample = createRequire(
	path.join(exampleRoot, 'package.json'),
);
const {chromium} = requireFromExample('@playwright/test');

const getArgument = (name: string) => {
	const index = process.argv.indexOf(name);
	return index === -1 ? null : (process.argv[index + 1] ?? null);
};

const captureCpuProfile = async () => {
	if (process.argv.includes('--help')) {
		console.log(
			'bun run studio:cpu-profile -- --label <name> [--sampling-interval <microseconds>]',
		);
		return;
	}

	if (!process.stdin.isTTY) {
		throw new Error('CPU profile capture requires an interactive terminal');
	}

	const label = getArgument('--label') ?? 'capture';
	const samplingInterval = Number(getArgument('--sampling-interval') ?? 500);
	if (!Number.isInteger(samplingInterval) || samplingInterval < 100) {
		throw new Error(
			`--sampling-interval must be an integer of at least 100 microseconds, got ${samplingInterval}`,
		);
	}

	const slug =
		label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'capture';
	const startedAt = new Date();
	const timestamp = startedAt
		.toISOString()
		.replaceAll(':', '-')
		.replace('Z', '');
	const outputDirectory = path.join(repositoryRoot, 'out', 'cpu-profiles');
	const profilePath = path.join(
		outputDirectory,
		`${timestamp}-${slug}.cpuprofile`,
	);
	const metadataPath = path.join(
		outputDirectory,
		`${timestamp}-${slug}.metadata.json`,
	);

	const portReservation = Bun.serve({
		fetch: () => new Response('Reserved'),
		hostname: '127.0.0.1',
		port: 0,
	});
	const port = portReservation.port;
	await portReservation.stop(true);

	console.log(`Starting Studio on http://localhost:${port}...`);
	const studio = Bun.spawn(
		[
			path.join(exampleRoot, 'node_modules', '.bin', 'remotion'),
			'studio',
			'--props',
			'src/my-props.json',
			'--force-new',
			'--no-open',
			`--port=${port}`,
		],
		{
			cwd: exampleRoot,
			env: {...process.env, BROWSER: 'none'},
			stderr: 'inherit',
			stdout: 'inherit',
		},
	);

	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	let browser: {close: () => Promise<void>} | null = null;
	let interrupted = false;
	const interrupt = () => {
		interrupted = true;
		readline.close();
		void browser?.close();
		studio.kill();
	};
	process.once('SIGINT', interrupt);
	process.once('SIGTERM', interrupt);

	try {
		const deadline = Date.now() + 120_000;
		while (Date.now() < deadline) {
			if (studio.exitCode !== null) {
				throw new Error(
					`Studio exited before becoming ready with code ${studio.exitCode}`,
				);
			}

			try {
				const response = await fetch(`http://127.0.0.1:${port}`);
				if (response.ok) {
					break;
				}
			} catch {}
			await Bun.sleep(250);
		}

		if (Date.now() >= deadline) {
			throw new Error('Studio did not become ready within 120 seconds');
		}

		const launchedBrowser = await chromium.launch({
			channel: 'chrome',
			headless: false,
		});
		browser = launchedBrowser;
		const context = await launchedBrowser.newContext();
		const page = await context.newPage();
		await page.goto(`http://localhost:${port}`, {
			timeout: 120_000,
			waitUntil: 'domcontentloaded',
		});

		console.log(
			'\nChrome is ready. Navigate to the interaction you want to test.',
		);
		await readline.question('Press Enter to START CPU profiling... ');
		if (interrupted) {
			return;
		}

		const client = await context.newCDPSession(page);
		await client.send('Profiler.enable');
		await client.send('Profiler.setSamplingInterval', {
			interval: samplingInterval,
		});
		await client.send('Profiler.start');

		console.log('\nRecording. Perform the interaction in Chrome.');
		await readline.question(
			'Return here and press Enter to STOP profiling... ',
		);
		if (interrupted) {
			return;
		}

		const {profile} = await client.send('Profiler.stop');
		await client.send('Profiler.disable');
		await mkdir(outputDirectory, {recursive: true});
		await Bun.write(profilePath, JSON.stringify(profile));
		await Bun.write(
			metadataPath,
			`${JSON.stringify(
				{
					branch: Bun.spawnSync(['git', 'branch', '--show-current'], {
						cwd: repositoryRoot,
					})
						.stdout.toString()
						.trim(),
					dirty: Boolean(
						Bun.spawnSync(['git', 'status', '--porcelain'], {
							cwd: repositoryRoot,
						})
							.stdout.toString()
							.trim(),
					),
					endedAt: new Date().toISOString(),
					gitSha: Bun.spawnSync(['git', 'rev-parse', 'HEAD'], {
						cwd: repositoryRoot,
					})
						.stdout.toString()
						.trim(),
					href: page.url(),
					label,
					profilePath: path.relative(repositoryRoot, profilePath),
					samplingIntervalMicroseconds: samplingInterval,
					startedAt: startedAt.toISOString(),
					userAgent: await page.evaluate(() => navigator.userAgent),
				},
				null,
				2,
			)}\n`,
		);
		await Bun.write(
			path.join(outputDirectory, 'latest.json'),
			`${JSON.stringify(
				{
					label,
					metadataPath: path.relative(repositoryRoot, metadataPath),
					profilePath: path.relative(repositoryRoot, profilePath),
				},
				null,
				2,
			)}\n`,
		);

		console.log(`\nCPU profile: ${profilePath}`);
		console.log(`Metadata: ${metadataPath}`);
		console.log(`Agent handoff: Analyze ${profilePath} and ${metadataPath}`);
	} finally {
		process.removeListener('SIGINT', interrupt);
		process.removeListener('SIGTERM', interrupt);
		readline.close();
		await browser?.close();
		studio.kill();
		await studio.exited;
	}
};

await captureCpuProfile();
