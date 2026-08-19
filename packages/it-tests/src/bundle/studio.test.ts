import {expect, test} from 'bun:test';
import {execSync, spawn} from 'child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'fs';
import {createServer} from 'http';
import {tmpdir} from 'os';
import path from 'path';

test('Should be able to start the studio without zod installed', () => {
	const res = execSync('bunx remotion studio --test-for-server-open', {
		cwd: path.join(process.cwd(), '..', 'example-without-zod'),
	}).toString('utf-8');

	// Should not print warnings or errors
	expect(res.length).toBeLessThan(200);

	expect(res).toContain('Yes, the server started.');
});

test('Should be able to start the studio', () => {
	const res = execSync('bunx remotion studio --test-for-server-open', {
		cwd: path.join(process.cwd(), '..', 'example'),
	}).toString('utf-8');
	// Should not print warnings or errors
	expect(res.length).toBeLessThan(200);
	expect(res).toContain('Yes, the server started.');
});

test(
	'Should not build if the studio is already running',
	async () => {
		const exampleDirectory = path.join(process.cwd(), '..', 'example');
		const temporaryDirectory = mkdtempSync(
			path.join(tmpdir(), 'remotion-studio-already-running-'),
		);
		const configFile = path.join(temporaryDirectory, 'remotion.config.js');
		writeFileSync(
			configFile,
			`const {Config} = require('@remotion/cli/config');
Config.overrideWebpackConfig((config) => {
	console.log('Bundler override ran');
	return config;
});
`,
		);
		const existingStudio = createServer((request, response) => {
			if (request.url === '/__remotion_config') {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(
					JSON.stringify({
						isRemotion: true,
						cwd: exampleDirectory,
						version: null,
					}),
				);
				return;
			}

			response.writeHead(404);
			response.end();
		});

		await new Promise<void>((resolve) => {
			existingStudio.listen(0, resolve);
		});

		try {
			const address = existingStudio.address();
			if (!address || typeof address === 'string') {
				throw new Error('Could not determine the existing Studio port');
			}

			const studioProcess = spawn(
				'bunx',
				[
					'remotion',
					'studio',
					'--port',
					String(address.port),
					'--no-open',
					'--config',
					configFile,
				],
				{
					cwd: exampleDirectory,
					env: {...process.env, BROWSER: 'none'},
					stdio: 'pipe',
				},
			);

			let output = '';
			studioProcess.stdout.on('data', (data: Buffer) => {
				output += data.toString();
			});
			studioProcess.stderr.on('data', (data: Buffer) => {
				output += data.toString();
			});

			const exitCode = await new Promise<number | null>((resolve, reject) => {
				studioProcess.on('error', reject);
				studioProcess.on('close', resolve);
			});

			expect(exitCode).toBe(0);
			expect(output).toContain(`Already running on port ${address.port}.`);
			expect(output).not.toContain('Bundler override ran');
			expect(output).not.toContain('Built in');
		} finally {
			await new Promise<void>((resolve, reject) => {
				existingStudio.close((error) => {
					if (error) {
						reject(error);
						return;
					}

					resolve();
				});
			});
			rmSync(temporaryDirectory, {recursive: true});
		}
	},
	{timeout: 20_000},
);
