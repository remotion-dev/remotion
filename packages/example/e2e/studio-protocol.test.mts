import type {ChildProcess} from 'node:child_process';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import {createServer} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {expect, test} from '@playwright/test';
import {remotionBin} from './constants.mts';

const waitForUrl = async (url: string, process: ChildProcess) => {
	const startedAt = Date.now();
	while (Date.now() - startedAt < 60_000) {
		if (process.exitCode !== null) {
			throw new Error(`Temporary Studio exited with code ${process.exitCode}`);
		}

		try {
			const response = await fetch(url);
			if (response.ok) {
				return;
			}
		} catch {
			// Wait for Studio to start listening.
		}

		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	throw new Error('Temporary Studio did not become ready');
};

const waitForFile = async (file: string) => {
	const startedAt = Date.now();
	while (Date.now() - startedAt < 20_000) {
		if (fs.existsSync(file)) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error(`Expected ${file} to be created`);
};

test('installs an Element from a website into a clean Studio project', async ({
	browser,
}) => {
	test.setTimeout(120_000);
	const dirname = path.dirname(fileURLToPath(import.meta.url));
	const packagesDirectory = path.resolve(dirname, '..', '..');
	const repositoryRoot = path.resolve(packagesDirectory, '..');
	const temporaryProject = fs.mkdtempSync(
		path.join(os.tmpdir(), 'remotion-studio-protocol-'),
	);
	fs.cpSync(path.join(packagesDirectory, 'template-blank'), temporaryProject, {
		recursive: true,
	});
	fs.writeFileSync(
		path.join(temporaryProject, 'src', 'Composition.tsx'),
		`import {AbsoluteFill, Composition} from 'remotion';

export const MyComposition = () => {
	return (
		<Composition
			id="MyComp"
			component={MyComponent}
			durationInFrames={60}
			fps={30}
			width={1280}
			height={720}
		/>
	);
};

export const MyComponent = () => {
	return <AbsoluteFill></AbsoluteFill>;
};
`,
	);
	fs.rmSync(path.join(temporaryProject, 'node_modules'), {
		force: true,
		recursive: true,
	});
	fs.symlinkSync(
		path.join(repositoryRoot, 'node_modules'),
		path.join(temporaryProject, 'node_modules'),
		'dir',
	);

	const studioPort = 3009;
	const studioUrl = `http://localhost:${studioPort}`;
	const studioProcess = spawn(
		remotionBin,
		[
			'studio',
			path.join(temporaryProject, 'src', 'index.ts'),
			'--port',
			String(studioPort),
			'--log=error',
		],
		{
			cwd: temporaryProject,
			env: {...process.env, BROWSER: 'none'},
			stdio: 'pipe',
		},
	);
	let studioLogs = '';
	studioProcess.stdout?.on('data', (data: Buffer) => {
		studioLogs += data.toString();
	});
	studioProcess.stderr?.on('data', (data: Buffer) => {
		studioLogs += data.toString();
	});

	const protocolBundle = fs.readFileSync(
		path.join(packagesDirectory, 'studio-protocol', 'dist', 'esm', 'index.mjs'),
		'utf8',
	);
	const senderServer = createServer((request, response) => {
		if (request.url === '/protocol.js') {
			response.writeHead(200, {'Content-Type': 'text/javascript'});
			response.end(protocolBundle);
			return;
		}

		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end(`<!doctype html>
			<button id="install">Install in Studio</button>
			<button id="license">Configure license in Studio</button>
			<p id="status"></p>
			<script type="module">
				import {createElementPayload, installInStudio, StudioProtocolInternals} from '/protocol.js';
				const payload = createElementPayload({
					displayName: 'Protocol Element',
					slug: 'protocol-element',
					sourceCode: 'export const ProtocolElement = () => <div>Installed through protocol</div>;',
					dependencies: [],
					dimensions: {width: 640, height: 120},
					durationInFrames: 30,
				});
				document.querySelector('#install').onclick = async () => {
					document.querySelector('#status').textContent = '';
					const result = await installInStudio({payload});
					document.querySelector('#status').textContent = JSON.stringify(result);
				};
				document.querySelector('#license').onclick = async () => {
					document.querySelector('#status').textContent = '';
					const result = await StudioProtocolInternals.setLicenseKeyInStudio({
						licenseKey: 'rm_pub_${'a'.repeat(48)}',
					});
					document.querySelector('#status').textContent = JSON.stringify(result);
				};
			</script>`);
	});
	await new Promise<void>((resolve) =>
		senderServer.listen(0, '127.0.0.1', resolve),
	);
	const address = senderServer.address();
	if (address === null || typeof address === 'string') {
		throw new Error('Expected sender server address');
	}

	const senderUrl = `http://127.0.0.1:${address.port}`;
	const elementsLibraryRequests: string[] = [];
	const context = await browser.newContext();
	await context.route('https://www.remotion.dev/elements', async (route) => {
		elementsLibraryRequests.push(route.request().url());
		await route.fulfill({
			status: 302,
			headers: {Location: senderUrl},
		});
	});
	try {
		await waitForUrl(studioUrl, studioProcess);
		const studioPage = await context.newPage();
		await studioPage.goto(studioUrl);
		await expect(studioPage.getByText('MyComp').first()).toBeVisible();
		await studioPage.bringToFront();
		await studioPage.mouse.click(500, 300);
		await expect
			.poll(
				() =>
					fetch(`${studioUrl}/api/studio-protocol`, {
						headers: {Origin: 'http://localhost:4000'},
					}).then((response) => response.json()),
				{
					message: 'Studio should expose MyComp as an installable target',
					timeout: 30_000,
				},
			)
			.toMatchObject({
				protocol: 'remotion-studio-protocol',
				capabilities: [
					{
						type: 'install-element',
						target: {compositionId: 'MyComp'},
					},
					{type: 'set-license-key'},
				],
			});

		await studioPage.locator('[data-sidebar-toggle="right"]').click();
		const browseElements = studioPage.getByRole('button', {
			name: 'Browse Elements...',
		});
		await expect(browseElements).toBeVisible();
		const senderPagePromise = context.waitForEvent('page', {timeout: 10_000});
		await browseElements.click();
		const senderPage = await senderPagePromise;
		await senderPage.waitForLoadState('domcontentloaded');
		expect(elementsLibraryRequests).toEqual([
			'https://www.remotion.dev/elements',
		]);
		await expect(senderPage).toHaveURL(senderUrl);
		await senderPage.getByRole('button', {name: 'Install in Studio'}).click();
		await senderPage.waitForFunction(
			() => document.querySelector('#status')?.textContent !== '',
		);
		const senderStatus = await senderPage.locator('#status').textContent();
		expect(senderStatus).toContain('awaiting-confirmation');
		expect(senderStatus).toContain('remotion-studio-protocol-');

		await studioPage.bringToFront();
		const dialog = studioPage.getByRole('dialog');
		await expect(dialog.getByText('Install Element')).toBeVisible();
		await expect(dialog.getByText(/Protocol Element.*MyComp/)).toBeVisible();
		await dialog.getByRole('button', {name: /Install/}).click();

		const elementFile = path.join(
			temporaryProject,
			'src',
			'protocol-element.element.tsx',
		);
		await waitForFile(elementFile);
		expect(fs.readFileSync(elementFile, 'utf8')).toContain(
			'export const ProtocolElement',
		);
		const compositionSource = fs.readFileSync(
			path.join(temporaryProject, 'src', 'Composition.tsx'),
			'utf8',
		);
		expect(compositionSource).toContain('ProtocolElement');
		expect(compositionSource).toContain('protocol-element.element');

		await studioPage.bringToFront();
		await studioPage.mouse.click(500, 300);
		await senderPage.bringToFront();
		await senderPage
			.getByRole('button', {name: 'Configure license in Studio'})
			.click();
		await senderPage.waitForFunction(
			() => document.querySelector('#status')?.textContent !== '',
		);
		expect(await senderPage.locator('#status').textContent()).toContain(
			'awaiting-confirmation',
		);

		await studioPage.bringToFront();
		const licenseDialog = studioPage.getByRole('dialog');
		await expect(
			licenseDialog.getByText('Settings', {exact: true}),
		).toBeVisible();
		await expect(
			licenseDialog.getByRole('textbox', {name: 'Public license key'}),
		).toHaveValue(`rm_pub_${'a'.repeat(48)}`);
	} catch (error) {
		throw new Error(`${String(error)}\nTemporary Studio logs:\n${studioLogs}`);
	} finally {
		await Promise.race([
			context.close().catch(() => undefined),
			new Promise((resolve) => setTimeout(resolve, 1000)),
		]);
		senderServer.closeAllConnections();
		await new Promise<void>((resolve) => senderServer.close(() => resolve()));
		if (studioProcess.exitCode === null) {
			studioProcess.kill('SIGTERM');
		}
		await new Promise<void>((resolve) => {
			studioProcess.once('exit', () => resolve());
			setTimeout(resolve, 5000);
		});
		fs.rmSync(temporaryProject, {force: true, recursive: true});
	}
});
