import {createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import type {LiteEvent} from 'react-scan/lite';
import {summarizeReactScanEvents, type StoredReactScanEvent} from './summarize';

type ClientMetadata = {
	devicePixelRatio: number;
	height: number;
	href: string;
	userAgent: string;
	width: number;
};

type IngestPayload = {
	client?: ClientMetadata;
	events: LiteEvent[];
	sequence: number;
	sessionId: string;
};

const repositoryRoot = path.resolve(import.meta.dir, '../../..');
const clientEntryPoint = path.join(import.meta.dir, 'client.ts');

const getArgument = (name: string) => {
	const index = process.argv.indexOf(name);
	return index === -1 ? null : (process.argv[index + 1] ?? null);
};

const outputRoot = path.resolve(
	getArgument('--output-root') ??
		path.join(repositoryRoot, 'out', 'react-scan'),
);

const getGitValue = (args: string[]) => {
	const result = Bun.spawnSync(['git', ...args], {
		cwd: repositoryRoot,
		stderr: 'ignore',
	});

	return result.exitCode === 0 ? result.stdout.toString().trim() : null;
};

const getPackageVersion = async (packageJsonPath: string) => {
	const packageJson = (await Bun.file(packageJsonPath).json()) as {
		version: string;
	};
	return packageJson.version;
};

const slugify = (value: string) => {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	return slug || 'capture';
};

const readStoredEvents = async (filePath: string) => {
	const contents = await Bun.file(filePath).text();
	if (!contents.trim()) {
		return [];
	}

	return contents
		.trim()
		.split('\n')
		.map((line) => JSON.parse(line) as StoredReactScanEvent);
};

const startCapture = async () => {
	if (process.argv.includes('--help')) {
		console.log(
			'bun run react-scan:capture -- --label <name> [--no-studio] [--output-root <path>]',
		);
		return;
	}

	const label = getArgument('--label') ?? 'capture';
	const noStudio = process.argv.includes('--no-studio');
	if (!noStudio) {
		console.log('Building the React Scan-enabled Studio entry...');
		const build = Bun.spawn(
			[
				'bunx',
				'turbo',
				'run',
				'make',
				'--filter=@remotion/studio-shared',
				'--filter=@remotion/bundler',
			],
			{
				cwd: repositoryRoot,
				stderr: 'inherit',
				stdout: 'inherit',
			},
		);
		if ((await build.exited) !== 0) {
			throw new Error('Could not build the Studio bundler for React Scan');
		}
	}

	const sessionId = crypto.randomUUID();
	const startedAt = new Date();
	const timestamp = startedAt
		.toISOString()
		.replaceAll(':', '-')
		.replace('Z', '');
	const captureDirectory = path.join(
		outputRoot,
		`${timestamp}-${slugify(label)}-${sessionId.slice(0, 8)}`,
	);
	const eventsPath = path.join(captureDirectory, 'events.ndjson');
	const metadataPath = path.join(captureDirectory, 'metadata.json');
	const summaryPath = path.join(captureDirectory, 'summary.json');

	await mkdir(captureDirectory, {recursive: true});
	const eventStream = createWriteStream(eventsPath, {flags: 'a'});
	const storedEvents: StoredReactScanEvent[] = [];
	let clientMetadata: ClientMetadata | null = null;
	let finalized = false;
	let resolveWithoutStudio: (() => void) | null = null;

	const initialMetadata = {
		branch: getGitValue(['branch', '--show-current']),
		captureDirectory: path.relative(repositoryRoot, captureDirectory),
		dirty: Boolean(getGitValue(['status', '--porcelain'])),
		gitSha: getGitValue(['rev-parse', 'HEAD']),
		label,
		schemaVersion: 1,
		sessionId,
		startedAt: startedAt.toISOString(),
		versions: {
			bun: Bun.version,
			react: await getPackageVersion(
				path.join(
					repositoryRoot,
					'packages',
					'example',
					'node_modules',
					'react',
					'package.json',
				),
			),
			reactScan: await getPackageVersion(
				path.join(repositoryRoot, 'node_modules', 'react-scan', 'package.json'),
			),
			remotion: await getPackageVersion(
				path.join(repositoryRoot, 'packages', 'core', 'package.json'),
			),
		},
	};
	await Bun.write(
		metadataPath,
		`${JSON.stringify(initialMetadata, null, 2)}\n`,
	);

	const corsHeaders = {
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Origin': '*',
	};

	const server = Bun.serve({
		fetch: async (request) => {
			if (request.method === 'OPTIONS') {
				return new Response(null, {headers: corsHeaders, status: 204});
			}

			const expectedPath = `/ingest/${sessionId}`;
			if (
				request.method !== 'POST' ||
				new URL(request.url).pathname !== expectedPath
			) {
				return new Response('Not found', {status: 404});
			}

			const contentLength = Number(request.headers.get('content-length') ?? 0);
			if (contentLength > 10 * 1024 * 1024) {
				return new Response('Payload too large', {
					headers: corsHeaders,
					status: 413,
				});
			}

			let payload: IngestPayload;
			try {
				payload = (await request.json()) as IngestPayload;
			} catch {
				return new Response('Invalid JSON', {
					headers: corsHeaders,
					status: 400,
				});
			}

			if (
				payload.sessionId !== sessionId ||
				!Number.isInteger(payload.sequence) ||
				!Array.isArray(payload.events)
			) {
				return new Response('Invalid capture payload', {
					headers: corsHeaders,
					status: 400,
				});
			}

			clientMetadata ??= payload.client ?? null;
			const receivedAt = new Date().toISOString();
			for (
				let eventIndex = 0;
				eventIndex < payload.events.length;
				eventIndex++
			) {
				const storedEvent: StoredReactScanEvent = {
					event: payload.events[eventIndex],
					eventIndex,
					receivedAt,
					sequence: payload.sequence,
					sessionId,
				};
				storedEvents.push(storedEvent);
				eventStream.write(`${JSON.stringify(storedEvent)}\n`);
			}

			return Response.json(
				{accepted: payload.events.length},
				{headers: corsHeaders},
			);
		},
		hostname: '127.0.0.1',
		port: 0,
	});

	const endpoint = `http://127.0.0.1:${server.port}/ingest/${sessionId}`;
	console.log(`React Scan capture: ${label}`);
	console.log(`Output: ${path.relative(repositoryRoot, captureDirectory)}`);
	console.log(`Endpoint: ${endpoint}`);
	console.log('Press Ctrl+C to stop and write summary.json.');

	const studio = noStudio
		? null
		: Bun.spawn(['bun', 'run', 'dev', '--', '--force-new'], {
				cwd: path.join(repositoryRoot, 'packages', 'example'),
				env: {
					...process.env,
					REMOTION_REACT_SCAN_ENDPOINT: endpoint,
					REMOTION_REACT_SCAN_ENTRY_POINT: clientEntryPoint,
					REMOTION_REACT_SCAN_SESSION_ID: sessionId,
				},
				stderr: 'inherit',
				stdin: 'inherit',
				stdout: 'inherit',
			});

	const finalize = async () => {
		if (finalized) {
			return;
		}
		finalized = true;

		await Bun.sleep(250);
		await server.stop(true);
		studio?.kill();
		await new Promise<void>((resolve, reject) => {
			eventStream.once('error', reject);
			eventStream.end(resolve);
		});

		const events =
			storedEvents.length > 0
				? storedEvents
				: await readStoredEvents(eventsPath);
		const endedAt = new Date();
		const summary = summarizeReactScanEvents(events);
		await Bun.write(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
		await Bun.write(
			metadataPath,
			`${JSON.stringify(
				{
					...initialMetadata,
					client: clientMetadata,
					endedAt: endedAt.toISOString(),
					eventCount: events.length,
				},
				null,
				2,
			)}\n`,
		);
		await Bun.write(
			path.join(outputRoot, 'latest.json'),
			`${JSON.stringify(
				{
					captureDirectory: path.relative(repositoryRoot, captureDirectory),
					label,
					sessionId,
				},
				null,
				2,
			)}\n`,
		);

		console.log(`Saved ${events.length} events to ${eventsPath}`);
		console.log(`Summary: ${summaryPath}`);
		resolveWithoutStudio?.();
	};

	process.on('SIGINT', () => {
		void finalize();
	});
	process.on('SIGTERM', () => {
		void finalize();
	});

	if (studio) {
		await studio.exited;
		await finalize();
	} else {
		await new Promise<void>((resolve) => {
			resolveWithoutStudio = resolve;
		});
	}
};

if (import.meta.main) {
	await startCapture();
}
