import type {ChildProcess} from 'node:child_process';
import {spawn} from 'node:child_process';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {createServer as createHttpServer} from 'node:http';
import {createServer} from 'node:net';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {exampleDir, remotionBin} from './constants.mts';

test('Studio reconnects after the server answered /events with an error while restarting', async ({
	page,
}) => {
	test.setTimeout(180_000);
	const fixture = await mkdtemp(path.join(exampleDir, '.server-reconnect-'));
	const entryPoint = path.join(fixture, 'entry.tsx');
	let studio: ChildProcess | null = null;
	let exited: Promise<number | null> | null = null;
	let logs = '';

	const portServer = createServer();
	await new Promise<void>((resolve) =>
		portServer.listen(0, '127.0.0.1', resolve),
	);
	const address = portServer.address();
	if (!address || typeof address === 'string') throw new Error('No test port');
	const {port} = address;
	await new Promise<void>((resolve) => portServer.close(() => resolve()));

	const start = async () => {
		logs = '';
		const child = spawn(
			remotionBin,
			[
				'studio',
				entryPoint,
				'--no-open',
				'--force-new',
				'--port',
				String(port),
			],
			{cwd: exampleDir, stdio: 'pipe'},
		);
		studio = child;
		child.stdout?.on('data', (data: Buffer) => {
			logs += data.toString();
		});
		child.stderr?.on('data', (data: Buffer) => {
			logs += data.toString();
		});
		exited = new Promise((resolve) => child.once('exit', resolve));
		await expect.poll(() => logs, {timeout: 60_000}).toContain('Built in');
	};

	const stop = async () => {
		if (studio?.exitCode === null) studio.kill('SIGTERM');
		await exited;
		studio = null;
	};

	const disconnected = page.getByRole('alert').filter({
		hasText: 'The studio server has disconnected.',
	});

	try {
		await writeFile(
			entryPoint,
			`import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
const Comp = () => <AbsoluteFill style={{backgroundColor: 'white'}} />;
const Root = () => <Composition id="reconnect" component={Comp} width={16} height={16} fps={30} durationInFrames={30} />;
registerRoot(Root);
`,
		);
		await start();
		await page.goto(`http://localhost:${port}/reconnect`);
		await expect(page.getByText('reconnect').first()).toBeVisible();

		await stop();
		await expect(disconnected).toBeVisible({timeout: 15_000});

		let errorResponses = 0;
		const proxy = createHttpServer((request, response) => {
			if (request.url?.startsWith('/events')) {
				errorResponses++;
			}

			response.writeHead(502);
			response.end('Bad Gateway');
		});
		await new Promise<void>((resolve) => proxy.listen(port, resolve));
		try {
			await expect
				.poll(() => errorResponses, {timeout: 20_000})
				.toBeGreaterThan(0);
		} finally {
			proxy.closeAllConnections();
			await new Promise<void>((resolve) => proxy.close(() => resolve()));
		}

		await start();
		await expect(disconnected).toBeHidden({timeout: 20_000});
	} finally {
		await stop();
		await rm(fixture, {recursive: true, force: true});
	}
});
