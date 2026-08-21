import {expect, test} from '@playwright/test';
import {
	createElementPayload,
	StudioProtocolInternals,
} from '@remotion/studio-protocol';

test('loads Browser Studio and can add, delete, and duplicate', async ({
	page,
}) => {
	const pageErrors: Error[] = [];
	const remoteRemotionRequests: string[] = [];
	const studioApiRequests: string[] = [];
	const workspacePackageRequests: string[] = [];
	let rejectPageError: (error: Error) => void = () => undefined;
	const pageError = new Promise<never>((_resolve, reject) => {
		rejectPageError = reject;
	});
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
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

	await Promise.race([
		(async () => {
			await page.goto('/');
			const studio = page.frameLocator('iframe');
			await expect(
				studio.getByTitle('/project').getByText('MyComp'),
			).toBeVisible();
			await expect(
				studio.locator('.remotion-studio-composition-container'),
			).toBeVisible();
			await studio.getByRole('button', {name: 'File', exact: true}).click();
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
			).toHaveCount(0);
			await quickSwitcherInput.fill('> Restart Studio Server');
			await expect(
				quickSwitcher.getByText('Restart Studio Server', {exact: true}),
			).toHaveCount(0);
			await quickSwitcherInput.press('Escape');

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
	expect(workspacePackageRequests).toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/core/dist/esm/index.mjs',
	);
	expect(workspacePackageRequests).toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/studio/dist/esm/previewEntry.mjs',
	);
	expect(workspacePackageRequests).toContain(
		'/__remotion_browser_studio_workspace__/commits/e2e/packages/transitions/dist/esm/fade.mjs',
	);
	expect(remoteRemotionRequests).toEqual([]);
	expect(studioApiRequests).toEqual([]);
});

test('loads Browser Studio from one immutable release artifact set', async ({
	page,
}) => {
	const releasePackageRequests: string[] = [];
	const remoteRemotionRequests: string[] = [];
	page.on('request', (request) => {
		const requestUrl = new URL(request.url());
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
	expect(releasePackageRequests).toContain(
		`/__remotion_browser_studio_release__/${await page.evaluate(() => (window as typeof window & {__browserStudioRemotionVersion: string}).__browserStudioRemotionVersion)}/packages/studio/dist/esm/previewEntry.mjs`,
	);
	expect(remoteRemotionRequests).toEqual([]);
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
	await studio.locator('body').evaluate(() => {
		(
			window as typeof window & {
				__browserStudioInstallPreservedIframe?: boolean;
			}
		).__browserStudioInstallPreservedIframe = true;
	});

	await studio.getByRole('button', {name: 'Tools', exact: true}).click();
	await studio.getByText('Install package...', {exact: true}).click();
	await expect(
		studio.getByText('Install packages', {exact: true}),
	).toBeVisible();
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
