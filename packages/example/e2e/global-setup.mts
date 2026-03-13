import {spawn} from 'child_process';
import fs from 'fs';
import {
	EXPANDED_SIDEBAR_STATE,
	LOGS_FILE,
	ORIGINAL_CONTENT_FILE,
	PID_FILE,
	STUDIO_PORT,
	STUDIO_URL,
	exampleDir,
	remotionBin,
	rootFile,
} from './constants.mts';

async function waitForServer(
	url: string,
	timeoutMs: number = 30_000,
): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.ok) {
				return;
			}
		} catch {
			// Server not ready yet
		}

		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

export default async function globalSetup(): Promise<void> {
	fs.writeFileSync(ORIGINAL_CONTENT_FILE, fs.readFileSync(rootFile, 'utf-8'));
	fs.writeFileSync(LOGS_FILE, '');
	fs.writeFileSync(
		EXPANDED_SIDEBAR_STATE,
		JSON.stringify({
			cookies: [],
			origins: [
				{
					origin: STUDIO_URL,
					localStorage: [
						{
							name: 'remotion.sidebarRightCollapsing',
							value: 'expanded',
						},
					],
				},
			],
		}),
	);

	const studioProcess = spawn(
		remotionBin,
		['studio', '--port', String(STUDIO_PORT), '--props', 'src/my-props.json'],
		{
			cwd: exampleDir,
			stdio: 'pipe',
			env: {
				...process.env,
				BROWSER: 'none',
			},
		},
	);

	if (studioProcess.pid !== undefined) {
		fs.writeFileSync(PID_FILE, String(studioProcess.pid));
	}

	studioProcess.stderr?.on('data', (data: Buffer) => {
		const msg = data.toString();
		if (!msg.includes('ExperimentalWarning')) {
			process.stderr.write(`[studio stderr] ${msg.trim()}\n`);
		}
	});

	studioProcess.stdout?.on('data', (data: Buffer) => {
		const msg = data.toString();
		fs.appendFileSync(LOGS_FILE, JSON.stringify(msg) + '\n');
		process.stdout.write(`[studio stdout] ${msg.trim()}\n`);
	});

	await waitForServer(STUDIO_URL);
}
