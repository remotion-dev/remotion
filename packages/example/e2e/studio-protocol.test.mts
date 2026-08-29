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
	test.setTimeout(180_000);
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
import {CloseupFolder} from './closeups/Closeup';

export const MyComposition = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComponent}
				durationInFrames={60}
				fps={30}
				width={1280}
				height={720}
			/>
			<CloseupFolder />
		</>
	);
};

export const MyComponent = () => {
	return <AbsoluteFill></AbsoluteFill>;
};
`,
	);
	const closeupDirectory = path.join(
		temporaryProject,
		'src',
		'closeups',
	);
	fs.mkdirSync(closeupDirectory);
	fs.writeFileSync(
		path.join(closeupDirectory, 'Closeup.tsx'),
		`import {AbsoluteFill, Composition, Folder} from 'remotion';

export const CloseupFolder = () => {
	return (
		<Folder name="Closeup">
			<Composition
				id="CloseupPlaceholder"
				component={CloseupPlaceholder}
				durationInFrames={60}
				fps={30}
				width={1280}
				height={720}
			/>
		</Folder>
	);
};

const CloseupPlaceholder = () => {
	return <AbsoluteFill />;
};
`,
	);
	const externalLibraryUrl = 'https://external-elements.example.com/library';
	const reloadedExternalLibraryUrl =
		'https://second-elements.example.com/components';
	const protocolLibraryUrl = 'https://protocol-catalog.example.com/library';
	const configFile = path.join(temporaryProject, 'remotion.config.ts');
	fs.appendFileSync(
		configFile,
		`\nConfig.addElementLibrary({url: '${externalLibraryUrl}', displayName: 'External Elements'});\n`,
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
			<button id="add-library">Add catalog to Studio</button>
			<button id="license">Configure license in Studio</button>
			<p id="environment"></p>
			<p id="status"></p>
			<script type="module">
				import {addElementLibraryToStudio, createElementPayload, installInStudio, isInsideStudio, StudioProtocolInternals} from '/protocol.js';
				document.querySelector('#environment').textContent = isInsideStudio() ? 'Inside Remotion Studio' : 'Outside Remotion Studio';
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
				document.querySelector('#add-library').onclick = async () => {
					document.querySelector('#status').textContent = '';
					const result = await addElementLibraryToStudio({
						url: '${protocolLibraryUrl}',
						displayName: 'Protocol Catalog',
					});
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
	const officialLibraryRequests: string[] = [];
	const externalLibraryRequests: string[] = [];
	const context = await browser.newContext();
	await context.route(
		'https://www.remotion.dev/elements?remotion-studio=true',
		async (route) => {
			officialLibraryRequests.push(route.request().url());
			await route.fulfill({
				status: 302,
				headers: {Location: senderUrl},
			});
		},
	);
	await context.route(
		`${externalLibraryUrl}?remotion-studio=true`,
		async (route) => {
			externalLibraryRequests.push(route.request().url());
			await route.fulfill({
				status: 302,
				headers: {Location: senderUrl},
			});
		},
	);
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
					{type: 'add-element-library'},
				],
			});

		const decoyStudioPage = await context.newPage();
		await decoyStudioPage.goto(studioUrl);
		await expect(decoyStudioPage.getByText('MyComp').first()).toBeVisible();
		await decoyStudioPage.bringToFront();
		await decoyStudioPage.mouse.click(500, 300);

		await studioPage.bringToFront();
		await studioPage.keyboard.press('g');
		const currentFrameInput = studioPage.locator('input:focus');
		await expect(currentFrameInput).toBeVisible();
		await currentFrameInput.fill('45');
		await currentFrameInput.press('Enter');
		await expect(
			studioPage.getByRole('button', {name: '45', exact: true}),
		).toBeVisible();

		await studioPage.locator('[data-sidebar-toggle="right"]').click();
		const browseElements = studioPage.getByRole('button', {
			name: 'Browse Elements',
		});
		await expect(browseElements).toBeVisible();
		await browseElements.click();
		const officialLibraryItem = studioPage.getByRole('button', {
			name: 'Remotion Elements',
			exact: true,
		});
		const externalLibraryLabel = 'External Elements';
		const externalLibraryItem = studioPage.getByRole('button', {
			name: externalLibraryLabel,
			exact: true,
		});
		await expect(officialLibraryItem).toBeVisible();
		await expect(externalLibraryItem).toBeVisible();
		await officialLibraryItem.click();

		const officialElementsIframe = studioPage.locator(
			'iframe[title="Remotion Elements library"]',
		);
		await expect(officialElementsIframe).toBeVisible();
		expect(officialLibraryRequests).toEqual([
			'https://www.remotion.dev/elements?remotion-studio=true',
		]);
		expect(context.pages()).toHaveLength(2);
		await studioPage.keyboard.press('Escape');
		await expect(officialElementsIframe).toHaveCount(0);

		fs.appendFileSync(
			configFile,
			`Config.addElementLibrary({url: '${reloadedExternalLibraryUrl}'});\n`,
		);
		await browseElements.click();
		await expect(
			studioPage.getByRole('button', {
				name: 'second-elements.example.com/components',
				exact: true,
			}),
		).toBeVisible({timeout: 30_000});
		await externalLibraryItem.click();
		const elementsIframe = studioPage.locator(
			`iframe[title="${externalLibraryLabel} library"]`,
		);
		await expect(elementsIframe).toBeVisible();
		await expect(elementsIframe).toHaveAttribute(
			'allow',
			'local-network-access; loopback-network',
		);
		await expect(elementsIframe).toHaveAttribute('credentialless', '');
		expect(externalLibraryRequests).toEqual([
			`${externalLibraryUrl}?remotion-studio=true`,
		]);
		expect(context.pages()).toHaveLength(2);
		const elementsFrame = studioPage.frameLocator(
			`iframe[title="${externalLibraryLabel} library"]`,
		);
		await expect(
			elementsFrame.getByText('Inside Remotion Studio', {exact: true}),
		).toBeVisible();
		const installInStudio = elementsFrame.getByRole('button', {
			name: 'Install in Studio',
		});
		await expect(installInStudio).toBeVisible();
		await installInStudio.click();

		const dialog = studioPage.getByRole('dialog');
		await expect(dialog.getByText('Install Element')).toBeVisible();
		await expect(dialog.getByText(/Protocol Element.*MyComp/)).toBeVisible();
		await expect(dialog.getByText(senderUrl, {exact: true})).toBeVisible();
		await expect(decoyStudioPage.getByText('Install Element')).toHaveCount(0);
		await expect(elementsIframe).toHaveCount(0);
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
		expect(compositionSource).toMatch(
			/<Sequence\b(?=[^>]*\bfrom=\{45\})(?=[^>]*\bdurationInFrames=\{30\})[^>]*>\s*<ProtocolElement\s*\/>\s*<\/Sequence>/,
		);

		await studioPage.bringToFront();
		await studioPage.mouse.click(500, 300);
		const senderPage = await context.newPage();
		await senderPage.goto(senderUrl);
		await senderPage.getByRole('button', {name: 'Install in Studio'}).click();
		await studioPage.bringToFront();
		const newCompositionDialog = studioPage.getByRole('dialog');
		await expect(
			newCompositionDialog.getByText('Install Element'),
		).toBeVisible();
		await newCompositionDialog
			.getByRole('button', {name: 'New composition'})
			.click();
		await expect(
			newCompositionDialog.getByPlaceholder('Composition ID'),
		).toHaveValue('ProtocolElementComposition');
		const widthControl = newCompositionDialog.getByRole('button', {
			name: 'Width',
		});
		const heightControl = newCompositionDialog.getByRole('button', {
			name: 'Height',
		});
		const durationControl = newCompositionDialog.getByRole('button', {
			name: 'Duration in frames',
		});
		await expect(widthControl).toHaveText('640px');
		await expect(heightControl).toHaveText('120px');
		await expect(durationControl).toHaveText('30');
		await newCompositionDialog
			.getByPlaceholder('Composition ID')
			.fill('ProtocolElementScene');
		await newCompositionDialog.getByTitle('Folder').click();
		await studioPage
			.getByRole('button', {name: 'Closeup', exact: true})
			.last()
			.click();
		await widthControl.click();
		const widthInput = newCompositionDialog.getByRole('textbox', {
			name: 'Width',
		});
		await widthInput.fill('800');
		await widthInput.press('Enter');
		await heightControl.click();
		const heightInput = newCompositionDialog.getByRole('textbox', {
			name: 'Height',
		});
		await heightInput.fill('450');
		await heightInput.press('Enter');
		await durationControl.click();
		const durationInput = newCompositionDialog.getByRole('textbox', {
			name: 'Duration in frames',
		});
		await durationInput.fill('90');
		await durationInput.press('Enter');
		const installIntoNewComposition = newCompositionDialog.getByRole('button', {
			name: /Install/,
		});
		await expect(installIntoNewComposition).toBeEnabled();
		await installIntoNewComposition.click();

		const newCompositionFile = path.join(
			closeupDirectory,
			'ProtocolElementScene.tsx',
		);
		await waitForFile(newCompositionFile);
		await expect
			.poll(() => fs.readFileSync(newCompositionFile, 'utf8'))
			.toContain('ProtocolElement');
		expect(
			fs.readFileSync(
				path.join(closeupDirectory, 'protocol-element.element.tsx'),
				'utf8',
			),
		).toContain('export const ProtocolElement');
		const sourceWithNewComposition = fs.readFileSync(
			path.join(closeupDirectory, 'Closeup.tsx'),
			'utf8',
		);
		expect(sourceWithNewComposition).toContain('id="ProtocolElementScene"');
		expect(sourceWithNewComposition).toContain('durationInFrames={90}');
		expect(sourceWithNewComposition).toContain('width={800}');
		expect(sourceWithNewComposition).toContain('height={450}');
		const folderStart = sourceWithNewComposition.indexOf(
			'<Folder name="Closeup">',
		);
		const folderEnd = sourceWithNewComposition.indexOf(
			'</Folder>',
			folderStart,
		);
		const newCompositionPosition = sourceWithNewComposition.indexOf(
			'id="ProtocolElementScene"',
		);
		expect(newCompositionPosition).toBeGreaterThan(folderStart);
		expect(newCompositionPosition).toBeLessThan(folderEnd);
		expect(
			fs.readFileSync(
				path.join(temporaryProject, 'src', 'Composition.tsx'),
				'utf8',
			),
		).not.toContain('id="ProtocolElementScene"');
		await expect(studioPage).toHaveURL(/ProtocolElementScene/, {
			timeout: 30_000,
		});

		await studioPage.bringToFront();
		await studioPage.mouse.click(500, 300);
		await expect
			.poll(() =>
				fetch(`${studioUrl}/api/studio-protocol`, {
					headers: {Origin: 'http://localhost:4000'},
				})
					.then((response) => response.json())
					.then(
						(response) =>
							response.capabilities.find(
								(capability: {type: string}) =>
									capability.type === 'install-element',
							)?.target?.compositionId ?? null,
					),
			)
			.toBe('ProtocolElementScene');
		await senderPage.bringToFront();
		await expect(
			senderPage.getByText('Outside Remotion Studio', {exact: true}),
		).toBeVisible();
		await senderPage.locator('#status').evaluate((element) => {
			element.textContent = '';
		});
		const configBeforeCatalogConfirmation = fs.readFileSync(configFile, 'utf8');
		await senderPage
			.getByRole('button', {name: 'Add catalog to Studio'})
			.click();
		await senderPage.waitForFunction(
			() => document.querySelector('#status')?.textContent !== '',
		);
		expect(await senderPage.locator('#status').textContent()).toContain(
			'awaiting-confirmation',
		);

		await studioPage.bringToFront();
		const addCatalogDialog = studioPage.getByRole('dialog');
		await expect(
			addCatalogDialog.getByText('Add Element catalog', {exact: true}),
		).toBeVisible();
		await expect(
			addCatalogDialog.getByText(senderUrl, {exact: true}),
		).toBeVisible();
		await expect(
			addCatalogDialog.getByText(protocolLibraryUrl, {exact: true}),
		).toBeVisible();
		const catalogDetails = addCatalogDialog.getByLabel('Catalog details');
		await expect(
			catalogDetails.getByText('Display name', {exact: true}),
		).toBeVisible();
		await expect(
			catalogDetails.getByText('Protocol Catalog', {exact: true}),
		).toBeVisible();
		await expect(decoyStudioPage.getByText('Add Element catalog')).toHaveCount(
			0,
		);
		expect(fs.readFileSync(configFile, 'utf8')).toBe(
			configBeforeCatalogConfirmation,
		);
		await addCatalogDialog.getByRole('button', {name: /^Add catalog/}).click();
		await expect
			.poll(() => fs.readFileSync(configFile, 'utf8'), {timeout: 30_000})
			.toContain(protocolLibraryUrl);

		await browseElements.click();
		await expect(
			studioPage.getByRole('button', {
				name: 'Protocol Catalog',
				exact: true,
			}),
		).toBeVisible({timeout: 30_000});
		await studioPage.keyboard.press('Escape');

		await studioPage.bringToFront();
		await studioPage.mouse.click(500, 300);
		await senderPage.bringToFront();
		await senderPage
			.getByRole('button', {name: 'Add catalog to Studio'})
			.click();
		await senderPage.waitForFunction(
			() => document.querySelector('#status')?.textContent !== '',
		);
		await studioPage.bringToFront();
		await studioPage
			.getByRole('dialog')
			.getByRole('button', {name: /^Add catalog/})
			.click();
		await expect
			.poll(
				() =>
					fs.readFileSync(configFile, 'utf8').split(protocolLibraryUrl).length -
					1,
				{timeout: 30_000},
			)
			.toBe(1);

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
