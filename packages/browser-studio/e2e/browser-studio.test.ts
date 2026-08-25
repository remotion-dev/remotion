import {fileURLToPath} from 'node:url';
import {
	expect,
	test,
	type FrameLocator,
	type Locator,
	type Page,
} from '@playwright/test';
import {
	createElementPayload,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';
import {strFromU8, unzipSync} from 'fflate';

const localImagePath = fileURLToPath(
	new URL('../../codex-plugin/assets/logo.png', import.meta.url),
);
const localVideoPath = fileURLToPath(
	new URL('../../example/public/framer.webm', import.meta.url),
);

const dropLocalFile = async ({
	filePath,
	page,
	target,
}: {
	filePath: string;
	page: Page;
	target: Locator;
}) => {
	const box = await target.boundingBox();
	if (box === null) {
		throw new Error('Browser Studio drop target has no bounding box');
	}

	const client = await page.context().newCDPSession(page);
	const dragData = {
		dragOperationsMask: 1,
		files: [filePath],
		items: [],
	};
	const coordinates = {x: box.x + box.width / 2, y: box.y + box.height / 2};
	await client.send('Input.dispatchDragEvent', {
		...coordinates,
		data: dragData,
		type: 'dragEnter',
	});
	await client.send('Input.dispatchDragEvent', {
		...coordinates,
		data: dragData,
		type: 'dragOver',
	});
	await client.send('Input.dispatchDragEvent', {
		...coordinates,
		data: dragData,
		type: 'drop',
	});
};

const waitForBrowserStudioOperations = async (studio: FrameLocator) => {
	await expect
		.poll(() =>
			studio.locator('body').evaluate(() =>
				Boolean(
					(
						window as typeof window & {
							remotion_browserStudio?: unknown;
						}
					).remotion_browserStudio,
				),
			),
		)
		.toBe(true);
};

test('runs Browser Studio in Safari', async ({page}) => {
	await page.goto('/');

	expect(await page.evaluate(() => window.crossOriginIsolated)).toBe(true);
	await expect(
		page.frameLocator('iframe').getByTitle('/project').getByText('MyComp'),
	).toBeVisible();
});

test('loads Browser Studio, opens external links, and can add, delete, and duplicate', async ({
	page,
}) => {
	const pageErrors: Error[] = [];
	const remoteRemotionRequests: string[] = [];
	const studioApiRequests: string[] = [];
	const vendorBundleRequests: string[] = [];
	const workspacePackageRequests: string[] = [];
	let vendorBundleStartedBeforeIframe = false;
	let rejectPageError: (error: Error) => void = () => undefined;
	let markVendorBundleRequestStarted: () => void = () => undefined;
	let releaseVendorBundleRequest: () => void = () => undefined;
	const pageError = new Promise<never>((_resolve, reject) => {
		rejectPageError = reject;
	});
	const vendorBundleRequestStarted = new Promise<void>((resolve) => {
		markVendorBundleRequestStarted = resolve;
	});
	const waitBeforeServingVendorBundle = new Promise<void>((resolve) => {
		releaseVendorBundleRequest = resolve;
	});
	const client = await page.context().newCDPSession(page);
	await client.send('Network.enable');
	await client.send('Network.emulateNetworkConditions', {
		downloadThroughput: 10 * 1024 * 1024,
		latency: 0,
		offline: false,
		uploadThroughput: 10 * 1024 * 1024,
	});
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (requestUrl.searchParams.has('browserStudioVendor')) {
			vendorBundleRequests.push(request.url());
			vendorBundleStartedBeforeIframe = page.frames().length === 1;
		}

		if (
			requestUrl.pathname.startsWith('/api/') &&
			requestUrl.origin === new URL(page.url()).origin
		) {
			studioApiRequests.push(requestUrl.pathname);
		}

		if (
			requestUrl.pathname.startsWith('/__remotion_browser_studio_workspace__/')
		) {
			workspacePackageRequests.push(requestUrl.pathname);
		}

		if (
			requestUrl.hostname === 'esm.sh' &&
			(decodeURIComponent(requestUrl.pathname).includes('/@remotion/') ||
				/^\/remotion(?:@|\/|$)/.test(requestUrl.pathname))
		) {
			remoteRemotionRequests.push(request.url());
		}
	});
	page.on('pageerror', (error) => {
		pageErrors.push(error);
		rejectPageError(error);
	});
	await page.context().route('https://remotion.dev/**', async (route) => {
		await route.fulfill({body: 'About Remotion', contentType: 'text/html'});
	});
	await page.context().route(/\.mjs\?browserStudioVendor$/, async (route) => {
		markVendorBundleRequestStarted();
		await waitBeforeServingVendorBundle;
		await route.continue();
	});

	await Promise.race([
		(async () => {
			await page.goto('/', {waitUntil: 'commit'});
			await vendorBundleRequestStarted;
			const loadingProgress = page.getByRole('progressbar', {
				name: 'Loading Studio',
			});
			await expect(loadingProgress).toBeVisible({timeout: 5000});
			releaseVendorBundleRequest();
			await expect
				.poll(
					async () => {
						const value = Number(
							await loadingProgress.getAttribute('aria-valuenow'),
						);
						return value > 0 && value < 95;
					},
					{timeout: 10_000},
				)
				.toBe(true);
			const studio = page.frameLocator('iframe');
			await expect(
				studio.getByTitle('/project').getByText('MyComp'),
			).toBeVisible();
			await expect(
				studio.locator('.remotion-studio-composition-container'),
			).toBeVisible();
			await studio.locator('button:has(svg[viewBox="0 0 415 426"])').click();
			const popupPromise = page.waitForEvent('popup');
			await studio.getByText('About Remotion', {exact: true}).click();
			const popup = await popupPromise;
			await popup.waitForLoadState('domcontentloaded');
			expect(popup.url()).toBe('https://remotion.dev/');
			await popup.close();
			await studio.getByRole('button', {name: 'File', exact: true}).click();
			const fileMenu = studio
				.locator('[data-remotion-menu-tree-id]')
				.filter({hasText: 'New composition...'});
			await expect(fileMenu).toBeVisible();
			await expect(
				fileMenu.getByText('New folder...', {exact: true}),
			).toBeVisible();
			await expect(fileMenu.getByRole('separator')).toHaveCount(0, {
				timeout: 1000,
			});
			await expect(
				studio.getByRole('button', {
					name: 'Open in File Manager',
					exact: true,
				}),
			).toHaveCount(0);
			await page.keyboard.press('Escape');

			await studio.getByRole('button', {name: /Search/}).click();
			const quickSwitcher = studio.getByRole('dialog');
			const quickSwitcherInput = quickSwitcher.getByRole('textbox');
			await quickSwitcherInput.fill('> Settings');
			await expect(
				quickSwitcher.getByText('Settings...', {exact: true}),
			).toBeVisible();
			await quickSwitcher.getByText('Settings...', {exact: true}).click();
			const settings = studio.getByRole('dialog');
			await expect(
				settings.getByRole('button', {name: 'Shortcuts', exact: true}),
			).toBeVisible();
			await expect(
				settings.getByRole('button', {name: 'Packages', exact: true}),
			).toBeVisible();
			for (const hiddenTab of [
				'Defaults',
				'Studio',
				'Skills',
				'Apps',
				'License',
			]) {
				await expect(
					settings.getByRole('button', {name: hiddenTab, exact: true}),
				).toHaveCount(0);
			}

			await expect(
				settings.getByText('Keyboard shortcuts', {exact: true}),
			).toHaveCount(0);
			await expect(
				settings.getByRole('list', {name: 'Playback', exact: true}),
			).toBeVisible();
			await expect(
				settings.getByText('Changes save to', {exact: true}),
			).toHaveCount(0);
			await studio.locator('body').press('Escape');

			await studio.getByRole('button', {name: /Search/}).click();
			const secondQuickSwitcher = studio.getByRole('dialog');
			const secondQuickSwitcherInput = secondQuickSwitcher.getByRole('textbox');
			await secondQuickSwitcherInput.fill('> Restart Studio Server');
			await expect(
				secondQuickSwitcher.getByText('Restart Studio Server', {exact: true}),
			).toHaveCount(0);
			await secondQuickSwitcherInput.press('Escape');

			await studio.locator('[data-compname="MyComp"]').click();
			await studio.getByRole('button', {name: 'Render on web'}).click();
			await expect(
				studio.getByText('Input Props', {exact: true}),
			).toBeVisible();
			await expect(
				studio.getByRole('button', {name: 'License', exact: true}),
			).toHaveCount(0);
			await studio.getByText('Still', {exact: true}).click();
			const downloadPromise = page.waitForEvent('download');
			await studio.getByRole('button', {name: 'Render still'}).click();
			const download = await downloadPromise;
			expect(download.suggestedFilename()).toBe('MyComp.png');
			await expect(
				studio.getByRole('button', {name: 'Download', exact: true}),
			).toBeVisible();
			await expect(
				studio.getByRole('button', {name: 'Remove', exact: true}),
			).toHaveCount(0);
			const inspector = studio.getByRole('button', {name: 'Inspector'});
			await expect(inspector).toBeVisible();
			await inspector.click();
			await studio.getByRole('button', {name: 'Add Solid'}).click();
			const solid = studio.getByText('<Solid>', {exact: true});
			await expect(solid).toBeVisible();
			await expect(studio.locator('svg[viewBox="0 0 24 16"]')).toBeVisible();
			await solid.click();
			await expect(
				studio.getByRole('button', {name: 'Copy context for agents'}).first(),
			).toBeAttached();
			await expect(
				studio.getByRole('button', {name: 'Open in another app'}),
			).toHaveCount(0, {timeout: 1000});
			await page.keyboard.press('Delete');
			await expect(solid).toHaveCount(0);
			await expect
				.poll(() =>
					page.evaluate(() => {
						const browserWindow = window as typeof window & {
							__browserStudioProject: {files: Record<string, string>};
						};
						return browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						];
					}),
				)
				.not.toContain('<Solid');

			const composition = studio.locator('[data-compname="MyComp"]');
			await composition.click({button: 'right'});
			await studio.getByText('Duplicate...', {exact: true}).click();
			await expect(studio.getByText('Duplicate MyComp')).toBeVisible();
			await expect(studio.getByPlaceholder('Composition ID')).toHaveValue(
				'MyComp1',
			);
			await expect(studio.getByText(/addition/)).toBeVisible();
			await studio.getByRole('button', {name: /^Add to /}).click();
			await expect(
				studio.getByTitle('/project').getByText('MyComp1'),
			).toBeVisible();
			await expect
				.poll(() =>
					page.evaluate(() => {
						const browserWindow = window as typeof window & {
							__browserStudioProject: {files: Record<string, string>};
						};
						return browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						];
					}),
				)
				.toContain('id="MyComp1"');
		})(),
		pageError,
	]);

	expect(pageErrors).toEqual([]);
	expect(workspacePackageRequests).not.toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/core/dist/esm/index.mjs',
	);
	expect(workspacePackageRequests).not.toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/studio/dist/esm/previewEntry.mjs',
	);
	expect(workspacePackageRequests).toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/transitions/dist/esm/fade.mjs',
	);
	expect(vendorBundleRequests).toHaveLength(1);
	expect(vendorBundleStartedBeforeIframe).toBe(true);
	expect(remoteRemotionRequests).toEqual([]);
	expect(studioApiRequests).toEqual([]);
});

test('loads Browser Studio from one immutable release artifact set', async ({
	page,
}) => {
	const releasePackageRequests: string[] = [];
	const remoteRemotionRequests: string[] = [];
	const vendorBundleRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (requestUrl.searchParams.has('browserStudioVendor')) {
			vendorBundleRequests.push(request.url());
		}

		if (
			requestUrl.pathname.startsWith('/__remotion_browser_studio_release__/')
		) {
			releasePackageRequests.push(requestUrl.pathname);
		}

		if (
			requestUrl.hostname === 'esm.sh' &&
			(decodeURIComponent(requestUrl.pathname).includes('/@remotion/') ||
				/^\/remotion(?:@|\/|$)/.test(requestUrl.pathname))
		) {
			remoteRemotionRequests.push(request.url());
		}
	});

	await page.goto('/?source=release');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await studio.locator('[data-compname="MyComp"]').click();
	await expect(
		studio.locator('.remotion-studio-composition-container'),
	).toBeVisible();
	expect(releasePackageRequests).toEqual([
		`/__remotion_browser_studio_release__/${await page.evaluate(() => (window as typeof window & {__browserStudioRemotionVersion: string}).__browserStudioRemotionVersion)}/packages/transitions/dist/esm/fade.mjs`,
	]);
	expect(vendorBundleRequests).toHaveLength(1);
	expect(remoteRemotionRequests).toEqual([]);
});

test('stores, reclaims, ranges, and downloads imported OPFS files', async ({
	page,
}) => {
	const rawFiles: Record<string, string> = {
		'package.json': JSON.stringify({
			dependencies: {
				react: '^19.0.0',
				'react-dom': '^19.0.0',
				remotion: '^4.0.0',
			},
		}),
		'public/pixel.svg':
			'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="red"/></svg>',
		'src/index.ts':
			"import {registerRoot} from 'remotion'; import {Root} from './Root'; registerRoot(Root);",
		'src/Root.tsx': `import {AbsoluteFill, Composition, Img, staticFile} from 'remotion';

const OpfsComposition = () => <AbsoluteFill><Img src={staticFile('pixel.svg')} /></AbsoluteFill>;

export const Root = () => <Composition id="OpfsComp" component={OpfsComposition} durationInFrames={30} fps={30} width={64} height={64} />;
`,
	};
	const encoder = new TextEncoder();
	const tree = Object.entries(rawFiles).map(([path, contents]) => ({
		path,
		size: encoder.encode(contents).byteLength,
		type: 'blob',
	}));
	const treeSha = 'ddc7ec42c2c9c06e84c9d5d2606e7ffc1394d900';

	await page
		.context()
		.route(
			'https://api.github.com/repos/remotion-dev/opfs-fixture/git/trees/HEAD?recursive=1',
			(route) =>
				route.fulfill({
					contentType: 'application/json',
					body: JSON.stringify({sha: treeSha, tree, truncated: false}),
				}),
		);
	await page
		.context()
		.route(
			`https://raw.githubusercontent.com/remotion-dev/opfs-fixture/${treeSha}/**`,
			(route) => {
				const marker = `/${treeSha}/`;
				const url = route.request().url();
				const path = decodeURIComponent(
					url.slice(url.indexOf(marker) + marker.length),
				);
				const contents = rawFiles[path];
				return contents === undefined
					? route.fulfill({status: 404})
					: route.fulfill({body: contents});
			},
		);

	await page.goto('/?github=1');
	const studio = page.frameLocator('iframe');
	await expect(
		studio.getByTitle('/project').getByText('OpfsComp'),
	).toBeVisible();
	await studio.locator('[data-compname="OpfsComp"]').click();
	await expect(
		studio.locator('.remotion-studio-composition-container img'),
	).toBeVisible();

	const projectStorage = await page.evaluate(() => {
		const project = (
			window as typeof window & {
				__browserStudioProject: {
					publicFileStorage?: {type: string};
					publicFiles?: Record<string, {sizeInBytes?: number; type?: string}>;
				};
			}
		).__browserStudioProject;
		return {
			file: project.publicFiles?.['pixel.svg'],
			storage: project.publicFileStorage,
		};
	});
	expect(projectStorage).toEqual({
		file: {
			key: expect.any(String),
			lastModified: expect.any(Number),
			sizeInBytes: encoder.encode(rawFiles['public/pixel.svg']).byteLength,
			type: 'stored',
		},
		storage: {
			directoryName: expect.any(String),
			type: 'opfs',
		},
	});

	const studioFrame = page.frames().find((frame) => frame !== page.mainFrame());
	if (!studioFrame) {
		throw new Error('Could not find the Browser Studio frame');
	}

	const rangeResult = await studioFrame.evaluate(async () => {
		const src = window.remotion_staticFiles.find(
			(file) => file.name === 'pixel.svg',
		)?.src;
		if (!src) {
			throw new Error('Could not find pixel.svg');
		}

		const response = await fetch(src, {headers: {Range: 'bytes=0-3'}});
		return {body: await response.text(), status: response.status};
	});
	expect(rangeResult).toEqual({body: '<svg', status: 206});

	await studioFrame.evaluate(async () => {
		await window.remotion_browserStudio.writeStaticFile({
			contents: new TextEncoder().encode('temporary').buffer,
			filePath: 'temporary.txt',
		});
	});
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					(
						window.__browserStudioProject.publicFiles?.['temporary.txt'] as
							| {key?: string}
							| undefined
					)?.key,
			),
		)
		.toEqual(expect.any(String));
	const temporaryKey = await page.evaluate(
		() =>
			(
				window.__browserStudioProject.publicFiles?.['temporary.txt'] as
					| {key: string}
					| undefined
			)?.key,
	);
	await studioFrame.evaluate(async () => {
		await window.remotion_browserStudio.undo();
		await window.remotion_browserStudio.redo();
	});
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					(
						window.__browserStudioProject.publicFiles?.['temporary.txt'] as
							| {key?: string}
							| undefined
					)?.key,
			),
		)
		.toBe(temporaryKey);
	await studioFrame.evaluate(async () => {
		await window.remotion_browserStudio.undo();
		await window.remotion_browserStudio.writeStaticFile({
			contents: new TextEncoder().encode('kept').buffer,
			filePath: 'kept.txt',
		});
	});
	const retainedKeys = await page.evaluate(() => {
		const publicFiles = window.__browserStudioProject.publicFiles as
			| Record<string, {key?: string}>
			| undefined;
		return [publicFiles?.['kept.txt']?.key, publicFiles?.['pixel.svg']?.key];
	});
	expect(retainedKeys).not.toContain(undefined);
	await expect
		.poll(
			() =>
				page.evaluate(async () => {
					const storage = window.__browserStudioProject.publicFileStorage;
					if (!storage) {
						throw new Error('Expected Browser Studio project storage');
					}

					const root = await navigator.storage.getDirectory();
					const browserStudioDirectory = await root.getDirectoryHandle(
						'remotion-browser-studio',
					);
					const projectsDirectory =
						await browserStudioDirectory.getDirectoryHandle('projects');
					const projectDirectory = await projectsDirectory.getDirectoryHandle(
						storage.directoryName,
					);
					const keys: string[] = [];
					for await (const key of (
						projectDirectory as FileSystemDirectoryHandle & {
							keys: () => AsyncIterableIterator<string>;
						}
					).keys()) {
						keys.push(key);
					}

					return keys.sort();
				}),
			{timeout: 10_000},
		)
		.toEqual(retainedKeys.toSorted());
	expect(retainedKeys).not.toContain(temporaryKey);

	const archiveBytes = await studioFrame.evaluate(async () => {
		const {data} = await window.remotion_browserStudio.downloadProject();
		return Array.from(data);
	});
	const archive = unzipSync(new Uint8Array(archiveBytes));
	expect(strFromU8(archive['public/pixel.svg'])).toBe(
		rawFiles['public/pixel.svg'],
	);
	expect(strFromU8(archive['public/kept.txt'])).toBe('kept');
	expect(archive['public/temporary.txt']).toBeUndefined();
	const secondPage = await page.context().newPage();
	await secondPage.goto('/?github=1');
	await expect(
		secondPage
			.frameLocator('iframe')
			.getByTitle('/project')
			.getByText('OpfsComp'),
	).toBeVisible();
	expect(
		await studioFrame.evaluate(async () => {
			const src = window.remotion_staticFiles.find(
				(file) => file.name === 'pixel.svg',
			)?.src;
			if (!src) {
				throw new Error('Could not find pixel.svg');
			}

			return (await fetch(src)).status;
		}),
	).toBe(200);
	await secondPage.close();

	const previousDirectoryName = projectStorage.storage?.directoryName;
	await page.reload();
	await expect(
		studio.getByTitle('/project').getByText('OpfsComp'),
	).toBeVisible();
	const reloadedStorage = await page.evaluate(
		() => window.__browserStudioProject.publicFileStorage,
	);
	expect(reloadedStorage?.directoryName).not.toBe(previousDirectoryName);
	const remainingProjectDirectories = await page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const browserStudioDirectory = await root.getDirectoryHandle(
			'remotion-browser-studio',
		);
		const projectsDirectory =
			await browserStudioDirectory.getDirectoryHandle('projects');
		const directories: string[] = [];
		for await (const name of (
			projectsDirectory as FileSystemDirectoryHandle & {
				keys: () => AsyncIterableIterator<string>;
			}
		).keys()) {
			directories.push(name);
		}

		return directories;
	});
	expect(remainingProjectDirectories).toContain(reloadedStorage?.directoryName);
	expect(remainingProjectDirectories).not.toContain(previousDirectoryName);
});

test('drops a local image onto the canvas and imports it into the virtual project', async ({
	page,
}) => {
	const studioApiRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (
			requestUrl.pathname.startsWith('/api/') &&
			requestUrl.origin === new URL(page.url()).origin
		) {
			studioApiRequests.push(requestUrl.pathname);
		}
	});

	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await waitForBrowserStudioOperations(studio);
	await studio.locator('[data-compname="MyComp"]').click();
	const canvas = studio.locator('.remotion-studio-composition-container');
	await expect(canvas).toBeVisible();
	await dropLocalFile({
		filePath: localImagePath,
		page,
		target: canvas,
	});
	await expect(studio.getByText('<CanvasImage>', {exact: true})).toBeVisible();

	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {
						files: Record<string, string>;
						publicFiles?: Record<
							string,
							Uint8Array | string | {sizeInBytes: number; type: 'stored'}
						>;
					};
				};
				const contents =
					browserWindow.__browserStudioProject.publicFiles?.['logo.png'];
				return {
					composition:
						browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						],
					publicFileSize:
						typeof contents === 'string'
							? new TextEncoder().encode(contents).byteLength
							: contents instanceof Uint8Array
								? contents.byteLength
								: contents?.sizeInBytes,
				};
			}),
		)
		.toMatchObject({
			composition: expect.stringContaining('logo.png'),
			publicFileSize: expect.any(Number),
		});

	await dropLocalFile({
		filePath: localVideoPath,
		page,
		target: canvas,
	});
	await expect(studio.getByText('framer.webm', {exact: true})).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() =>
				window.__browserStudioProject.files[
					'/project/src/Composition.tsx'
				].includes("staticFile('framer.webm')"),
			),
		)
		.toBe(true);
	expect(studioApiRequests).toEqual([]);
});

test('drops a local file into the virtual Assets folder', async ({page}) => {
	const studioApiRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (
			requestUrl.pathname.startsWith('/api/') &&
			requestUrl.origin === new URL(page.url()).origin
		) {
			studioApiRequests.push(requestUrl.pathname);
		}
	});

	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await waitForBrowserStudioOperations(studio);
	await studio.getByRole('button', {name: 'Assets', exact: true}).click();
	const assetSelector = studio.locator('[data-asset-selector]');
	await expect(assetSelector).toBeVisible();
	await dropLocalFile({
		filePath: localImagePath,
		page,
		target: assetSelector,
	});

	await expect(studio.getByText('logo.png', {exact: true})).toBeVisible();
	await assetSelector.getByText('logo.png', {exact: true}).click();
	await expect(studio.locator('img[src^="blob:"]')).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {
						files: Record<string, string>;
						publicFiles?: Record<
							string,
							Uint8Array | string | {sizeInBytes: number; type: 'stored'}
						>;
					};
				};
				const contents =
					browserWindow.__browserStudioProject.publicFiles?.['logo.png'];
				return {
					composition:
						browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						],
					publicFileSize:
						typeof contents === 'string'
							? new TextEncoder().encode(contents).byteLength
							: contents instanceof Uint8Array
								? contents.byteLength
								: contents?.sizeInBytes,
				};
			}),
		)
		.toMatchObject({
			composition: expect.not.stringContaining('logo.png'),
			publicFileSize: expect.any(Number),
		});
	expect(studioApiRequests).toEqual([]);
});

test('installs packages without a server API and preserves undo, redo, and HMR', async ({
	page,
}) => {
	const studioApiRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (
			requestUrl.pathname.startsWith('/api/') &&
			requestUrl.origin === new URL(page.url()).origin
		) {
			studioApiRequests.push(requestUrl.pathname);
		}
	});

	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await waitForBrowserStudioOperations(studio);
	await studio.locator('body').evaluate(() => {
		(
			window as typeof window & {
				__browserStudioInstallPreservedIframe?: boolean;
			}
		).__browserStudioInstallPreservedIframe = true;
	});

	await studio.getByRole('button', {name: 'Tools', exact: true}).click();
	await studio.getByText('Install package...', {exact: true}).click();
	await expect(studio.getByText('Settings', {exact: true})).toBeVisible();
	await expect(studio.getByText('Packages', {exact: true})).toBeVisible();
	await studio.locator('input[name="@remotion/google-fonts"]').click();
	await studio.getByRole('button', {name: /^Install/}).click();
	await expect(
		studio.getByText('Installed package successfully.'),
	).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
					__browserStudioRemotionVersion: string;
				};
				const packageJson = JSON.parse(
					browserWindow.__browserStudioProject.files['/project/package.json'],
				) as {dependencies: Record<string, string>};
				return packageJson.dependencies['@remotion/google-fonts'];
			}),
		)
		.toBe(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							__browserStudioRemotionVersion: string;
						}
					).__browserStudioRemotionVersion,
			),
		);
	expect(
		await studio.locator('body').evaluate(
			() =>
				(
					window as typeof window & {
						__browserStudioInstallPreservedIframe?: boolean;
					}
				).__browserStudioInstallPreservedIframe,
		),
	).toBe(true);

	await studio.getByRole('button', {name: /^Done/}).click();
	await page.keyboard.press('ControlOrMeta+Z');
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
				};
				const packageJson = JSON.parse(
					browserWindow.__browserStudioProject.files['/project/package.json'],
				) as {dependencies: Record<string, string>};
				return packageJson.dependencies['@remotion/google-fonts'];
			}),
		)
		.toBeUndefined();
	await page.keyboard.press('ControlOrMeta+Shift+Z');
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
				};
				const packageJson = JSON.parse(
					browserWindow.__browserStudioProject.files['/project/package.json'],
				) as {dependencies: Record<string, string>};
				return packageJson.dependencies['@remotion/google-fonts'];
			}),
		)
		.toBeDefined();
	expect(studioApiRequests).toEqual([]);
});

test('fetches each HTTP module once when the vendor bundle is overridden', async ({
	page,
}) => {
	const workspacePackageRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
		if (
			requestUrl.pathname.startsWith('/__remotion_browser_studio_workspace__/')
		) {
			workspacePackageRequests.push(requestUrl.pathname);
		}
	});

	await page.goto('/?source=fallback');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await expect(
		studio.locator('.remotion-studio-composition-container'),
	).toBeVisible();

	expect(
		workspacePackageRequests.filter(
			(request) =>
				request ===
				'/__remotion_browser_studio_workspace__/commits/e2e/packages/core/dist/esm/index.mjs',
		),
	).toHaveLength(1);
	expect(
		workspacePackageRequests.filter(
			(request) =>
				request ===
				'/__remotion_browser_studio_workspace__/commits/e2e/packages/core/dist/esm/no-react.mjs',
		),
	).toHaveLength(1);
	expect(workspacePackageRequests).toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/studio/dist/esm/previewEntry.mjs',
	);
});

test('drops and imports an Element payload with the deployment Remotion version', async ({
	page,
}) => {
	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await studio.locator('[data-compname="MyComp"]').click();
	const canvas = studio.locator('.remotion-studio-composition-container');
	await expect(canvas).toBeVisible();
	const box = await canvas.boundingBox();
	if (box === null) {
		throw new Error('Browser Studio canvas has no bounding box');
	}

	const dataTransfer = await canvas.evaluateHandle(() => new DataTransfer());
	await dataTransfer.evaluate((transfer) => {
		const payload = JSON.stringify({
			type: 'remotion-element',
			version: 1,
			element: {
				dependencies: [{name: '@remotion/shapes', version: null}],
				dimensions: {width: 320, height: 180},
				displayName: 'Browser Element',
				durationInFrames: 60,
				installationMode: 'wrapped',
				slug: 'browser-element',
				sourceCode: `import {Rect} from '@remotion/shapes';

export const BrowserElement = () => <Rect width={320} height={180} fill="red" />;
`,
			},
		});
		transfer.effectAllowed = 'copy';
		transfer.setData(
			'application/vnd.remotion.drag+json;v=1;type=element;width=320;height=180;duration=60',
			payload,
		);
		transfer.setData('text/plain', payload);
	});
	const coordinates = {
		clientX: box.x + box.width / 2,
		clientY: box.y + box.height / 2,
		dataTransfer,
	};
	await canvas.dispatchEvent('dragover', coordinates);
	await canvas.dispatchEvent('drop', coordinates);

	await expect(
		studio.getByText('Install Element', {exact: true}),
	).toBeVisible();
	await expect(
		studio.getByText('Unverified drag-and-drop payload'),
	).toBeVisible();
	await expect(
		studio.getByText(
			'Dependencies are resolved in the browser; package lifecycle scripts do not run.',
		),
	).toHaveCount(0);
	await studio.getByRole('button', {name: /^Install/}).click();

	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
					__browserStudioRemotionVersion: string;
				};
				const packageJson = JSON.parse(
					browserWindow.__browserStudioProject.files['/project/package.json'],
				) as {dependencies: Record<string, string>};
				return {
					composition:
						browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						],
					element:
						browserWindow.__browserStudioProject.files[
							'/project/src/browser-element.element.tsx'
						],
					installedVersion: packageJson.dependencies['@remotion/shapes'],
					remotionVersion: browserWindow.__browserStudioRemotionVersion,
				};
			}),
		)
		.toMatchObject({
			composition: expect.stringContaining('<BrowserElement />'),
			element: expect.stringContaining('export const BrowserElement'),
			installedVersion: expect.any(String),
		});
	const versions = await page.evaluate(() => {
		const browserWindow = window as typeof window & {
			__browserStudioProject: {files: Record<string, string>};
			__browserStudioRemotionVersion: string;
		};
		const packageJson = JSON.parse(
			browserWindow.__browserStudioProject.files['/project/package.json'],
		) as {dependencies: Record<string, string>};
		return {
			installed: packageJson.dependencies['@remotion/shapes'],
			remotion: browserWindow.__browserStudioRemotionVersion,
		};
	});
	expect(versions.installed).toBe(versions.remotion);
	await expect(studio.getByText('Browser Element')).toBeVisible();
});

test('confirms and imports an Element payload from the URL fragment', async ({
	page,
}) => {
	const payload = createElementPayload({
		dependencies: [{name: '@remotion/shapes', version: null}],
		dimensions: {height: 180, width: 320},
		displayName: 'Linked Element',
		durationInFrames: 60,
		installationMode: 'wrapped',
		slug: 'linked-element',
		sourceCode: `import {Rect} from '@remotion/shapes';

export const LinkedElement = () => <Rect width={320} height={180} fill="red" />;`,
	});
	const url = StudioProtocolInternals.makeBrowserStudioUrl({
		endpoint: 'http://127.0.0.1:62338/',
		payload,
	});

	await page.goto(url);
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();

	await expect(
		studio.getByText('Install Element', {exact: true}),
	).toBeVisible();
	await expect(
		studio.getByText('Unverified Browser Studio link'),
	).toBeVisible();
	await expect(studio.getByText('Linked Element')).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
				};
				return browserWindow.__browserStudioProject.files[
					'/project/src/linked-element.element.tsx'
				];
			}),
		)
		.toBeUndefined();

	await studio.locator('body').evaluate(() => {
		(
			window as typeof window & {
				__browserStudioInstallPreservedIframe?: boolean;
			}
		).__browserStudioInstallPreservedIframe = true;
	});
	await studio.getByRole('button', {name: /^Install/}).click();
	await expect
		.poll(() =>
			page.evaluate(() => {
				const browserWindow = window as typeof window & {
					__browserStudioProject: {files: Record<string, string>};
				};
				return {
					composition:
						browserWindow.__browserStudioProject.files[
							'/project/src/Composition.tsx'
						],
					element:
						browserWindow.__browserStudioProject.files[
							'/project/src/linked-element.element.tsx'
						],
				};
			}),
		)
		.toEqual({
			composition: expect.stringContaining('<LinkedElement />'),
			element: expect.stringContaining("import {Rect} from '@remotion/shapes'"),
		});
	expect(
		await studio.locator('body').evaluate(
			() =>
				(
					window as typeof window & {
						__browserStudioInstallPreservedIframe?: boolean;
					}
				).__browserStudioInstallPreservedIframe,
		),
	).toBe(true);
});

test('reports inline SVG imports as unsupported without changing the project', async ({
	page,
}) => {
	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await studio.locator('[data-compname="MyComp"]').click();
	const canvas = studio.locator('.remotion-studio-composition-container');
	await expect(canvas).toBeVisible();
	const compositionBefore = await page.evaluate(() => {
		const browserWindow = window as typeof window & {
			__browserStudioProject: {files: Record<string, string>};
		};
		return browserWindow.__browserStudioProject.files[
			'/project/src/Composition.tsx'
		];
	});

	const dataTransfer = await canvas.evaluateHandle(() => {
		const transfer = new DataTransfer();
		transfer.items.add(
			new File(
				['<svg viewBox="0 0 10 10"><circle r="4" /></svg>'],
				'shape.svg',
				{
					type: 'image/svg+xml',
				},
			),
		);
		return transfer;
	});
	await canvas.dispatchEvent('dragover', {dataTransfer});
	await canvas.dispatchEvent('drop', {dataTransfer});
	await studio.getByRole('button', {name: /Import as inline/}).click();

	await expect(
		studio.getByText(
			'Importing SVG markup is not supported in Browser Studio',
			{exact: true},
		),
	).toBeVisible();
	const compositionAfter = await page.evaluate(() => {
		const browserWindow = window as typeof window & {
			__browserStudioProject: {files: Record<string, string>};
		};
		return browserWindow.__browserStudioProject.files[
			'/project/src/Composition.tsx'
		];
	});
	expect(compositionAfter).toBe(compositionBefore);
});

test('clears hover backgrounds even if pointer leave events are lost', async ({
	page,
}) => {
	await page.goto('/');
	const studio = page.frameLocator('iframe');
	await expect(studio.getByTitle('/project').getByText('MyComp')).toBeVisible();
	await studio.locator('[data-compname="MyComp"]').click();
	await studio.locator('[data-sidebar-toggle="right"]').click();

	const addSolid = studio.getByRole('button', {name: 'Add Solid'});
	await expect(addSolid).toBeVisible();

	const getBackgroundColor = (locator: ReturnType<typeof studio.locator>) =>
		locator.evaluate(
			(element) => window.getComputedStyle(element).backgroundColor,
		);

	await addSolid.hover();
	await expect
		.poll(() => getBackgroundColor(addSolid))
		.toBe('rgba(255, 255, 255, 0.06)');

	// Browsers can fail to deliver pointer leave events when the pointer
	// exits the Studio <iframe>. Simulate this by suppressing them before
	// they reach the app: https://github.com/remotion-dev/remotion/issues/9886
	await studio.locator('body').evaluate((body) => {
		const win = body.ownerDocument.defaultView as Window;
		for (const type of [
			'pointerout',
			'pointerleave',
			'mouseout',
			'mouseleave',
		]) {
			win.addEventListener(type, (e) => e.stopImmediatePropagation(), {
				capture: true,
			});
		}
	});

	const neutralArea = studio.locator('.remotion-studio-composition-container');

	await neutralArea.hover();
	await expect
		.poll(() => getBackgroundColor(addSolid))
		.toBe('rgba(0, 0, 0, 0)');

	// Menubar items must reset as well
	const fileMenu = studio.getByRole('button', {name: 'File', exact: true});
	await fileMenu.hover();
	await expect
		.poll(() => getBackgroundColor(fileMenu))
		.toBe('rgba(255, 255, 255, 0.06)');

	await neutralArea.hover();
	await expect
		.poll(() => getBackgroundColor(fileMenu))
		.toBe('rgba(0, 0, 0, 0)');
});
