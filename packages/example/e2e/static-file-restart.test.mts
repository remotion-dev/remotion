import type {ChildProcess} from 'node:child_process';
import {spawn} from 'node:child_process';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {createServer} from 'node:net';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {exampleDir, remotionBin} from './constants.mts';

test('static assets survive Studio restarts and serve replacement files', async ({
	page,
}) => {
	test.setTimeout(120_000);
	const images = await page.evaluate(() => {
		const canvas = document.createElement('canvas');
		canvas.width = 16;
		canvas.height = 16;
		const context = canvas.getContext('2d');
		if (!context) throw new Error('No canvas context');
		return ['red', 'blue'].map((color) => {
			context.fillStyle = color;
			context.fillRect(0, 0, 16, 16);
			return canvas.toDataURL('image/png').split(',')[1];
		});
	});
	const fixture = await mkdtemp(path.join(exampleDir, '.static-file-restart-'));
	const publicDir = path.join(fixture, 'public');
	const assetName = 'restart #? %.png';
	const entryPoint = path.join(fixture, 'entry.tsx');
	let studio: ChildProcess | null = null;
	let exited: Promise<number | null> | null = null;
	let logs = '';

	const start = async () => {
		logs = '';
		const child = spawn(
			remotionBin,
			[
				'studio',
				entryPoint,
				'--public-dir',
				publicDir,
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
	const image = page.getByRole('img', {name: 'Restart asset'});
	const readPixel = () =>
		image.evaluate((element) => {
			const img = element as HTMLImageElement;
			if (!img.complete || !img.naturalWidth) return null;
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext('2d');
			if (!context) throw new Error('No canvas context');
			context.drawImage(img, 0, 0, 1, 1);
			return Array.from(context.getImageData(0, 0, 1, 1).data);
		});
	const portServer = createServer();
	await new Promise<void>((resolve) =>
		portServer.listen(0, '127.0.0.1', resolve),
	);
	const address = portServer.address();
	if (!address || typeof address === 'string') throw new Error('No test port');
	const {port} = address;
	await new Promise<void>((resolve) => portServer.close(() => resolve()));

	try {
		await mkdir(publicDir);
		await writeFile(
			path.join(publicDir, assetName),
			Buffer.from(images[0], 'base64'),
		);
		await writeFile(
			entryPoint,
			`import React from 'react';
import {Composition, Img, registerRoot, staticFile} from 'remotion';
const Asset = () => <Img alt="Restart asset" src={staticFile(${JSON.stringify(assetName)})} width={16} height={16} />;
const Root = () => <Composition id="asset-restart" component={Asset} width={16} height={16} fps={30} durationInFrames={30} />;
registerRoot(Root);
`,
		);
		await start();
		await page.goto(`http://localhost:${port}/asset-restart`);
		await expect.poll(readPixel).toEqual([255, 0, 0, 255]);
		const oldUrl = await image.evaluate(
			(element) => (element as HTMLImageElement).src,
		);

		await stop();
		const replacement = Buffer.from(images[1], 'base64');
		await writeFile(path.join(publicDir, assetName), replacement);
		await start();

		// An already-open Studio can still request its original asset URL.
		const oldResponse = await page.request.get(oldUrl);
		expect(oldResponse.status()).toBe(200);
		expect(await oldResponse.body()).toEqual(replacement);

		await page.reload();
		await expect.poll(readPixel).toEqual([0, 0, 255, 255]);
		const newUrl = await image.evaluate(
			(element) => (element as HTMLImageElement).src,
		);
		expect(newUrl.endsWith('.png')).toBe(true);
		expect(newUrl).toBe(oldUrl);
	} finally {
		await stop();
		await rm(fixture, {recursive: true, force: true});
	}
});
