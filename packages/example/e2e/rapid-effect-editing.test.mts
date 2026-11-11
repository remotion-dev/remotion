import fs from 'node:fs';
import {expect, test, type Locator} from '@playwright/test';
import {REACT_REFRESH_FINISHED_EVENT} from '@remotion/studio-shared';
import {STUDIO_URL, effectKeyframeE2eFile} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.use({
	storageState: {
		cookies: [],
		origins: [
			{
				origin: STUDIO_URL,
				localStorage: [
					{name: 'remotion.sidebarRightCollapsing.v2', value: 'expanded'},
				],
			},
		],
	},
});

test('chains effect edits before persistence and HMR without losing the latest intent', async ({
	page,
}) => {
	test.setTimeout(120_000);
	await startStudio();
	const original = fs.readFileSync(effectKeyframeE2eFile, 'utf8');
	let releasePersistence: () => void = () => undefined;
	let releaseHmr: () => void = () => undefined;
	let releaseFailure: () => void = () => undefined;
	let releaseResponse: () => void = () => undefined;
	const persistenceGate = new Promise<void>((resolve) => {
		releasePersistence = resolve;
	});
	const hmrGate = new Promise<void>((resolve) => {
		releaseHmr = resolve;
	});
	let firstDuplicate = true;

	try {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		const effects = page.getByRole('region', {name: 'Effects', exact: true});
		await expect(async () => {
			await page
				.getByRole('group', {name: 'Effect scale precision', exact: true})
				.first()
				.click();
			await expect(
				effects
					.getByRole('button', {name: 'Factor', exact: true})
					.filter({hasText: /^0\.75$/}),
			).toBeVisible({timeout: 1_000});
		}).toPass({timeout: 30_000});

		const scaleEffects = effects.getByRole('group', {
			name: 'scale()',
			exact: true,
		});
		const brightnessEffects = effects.getByRole('group', {
			name: 'brightness()',
			exact: true,
		});
		await expect(scaleEffects).toHaveCount(1);
		const canvas = page.getByLabel('Effect scale precision canvas', {
			exact: true,
		});
		const opaqueWidth = () =>
			canvas.evaluate((element: HTMLCanvasElement) => {
				const context = element.getContext('2d');
				if (!context) throw new Error('Effect canvas has no 2D context');
				const pixels = context.getImageData(
					0,
					element.height / 2,
					element.width,
					1,
				).data;
				return pixels.filter((alpha, index) => index % 4 === 3 && alpha >= 128)
					.length;
			});
		await expect.poll(opaqueWidth).toBe(960);
		await page.evaluate((refreshEvent) => {
			const state = window as typeof window & {
				__rapidEffects: {
					refreshes: number;
					missingSource: boolean;
					checkingSettledEffects: boolean;
					incorrectSettledEffects: boolean;
					actions: {name: string; at: number}[];
					paints: {at: number; scaleCount: number; opaqueWidth: number}[];
				};
			};
			state.__rapidEffects = {
				refreshes: 0,
				missingSource: false,
				checkingSettledEffects: false,
				incorrectSettledEffects: false,
				actions: [],
				paints: [],
			};
			document.addEventListener(
				'pointerdown',
				(event) => {
					const button =
						event.target instanceof Element
							? event.target.closest('button, [role="button"]')
							: null;
					if (button?.textContent?.trim().startsWith('Duplicate')) {
						state.__rapidEffects.actions.push({
							name: 'Duplicate effect',
							at: performance.now(),
						});
					}
				},
				true,
			);
			document.addEventListener(
				'keydown',
				(event) => {
					const name =
						event.key.toLowerCase() === 'd' && (event.metaKey || event.ctrlKey)
							? 'Duplicate selected effect'
							: event.key === 'Backspace'
								? 'Delete selected effect'
								: null;
					if (name)
						state.__rapidEffects.actions.push({name, at: performance.now()});
				},
				true,
			);
			document.addEventListener(
				'input',
				(event) => {
					if (
						event.target instanceof HTMLInputElement &&
						event.target.value === '0.5'
					) {
						state.__rapidEffects.actions.push({
							name: 'Edit effect value',
							at: performance.now(),
						});
					}
				},
				true,
			);
			const sampleCanvas = () => {
				const section = document.querySelector('section[aria-label="Effects"]');
				if (
					state.__rapidEffects.checkingSettledEffects &&
					![
						...(section?.querySelectorAll('button, [role="button"]') ?? []),
					].some((button) => button.textContent?.trim() === '0.25')
				)
					state.__rapidEffects.incorrectSettledEffects = true;
				const output = document.querySelector<HTMLCanvasElement>(
					'canvas[aria-label="Effect scale precision canvas"]',
				);
				const context = output?.getContext('2d');
				if (output && context) {
					const pixels = context.getImageData(
						0,
						output.height / 2,
						output.width,
						1,
					).data;
					const opaqueWidth = pixels.filter(
						(alpha, index) => index % 4 === 3 && alpha >= 128,
					).length;
					const scaleCount = document.querySelectorAll(
						'section[aria-label="Effects"] [role="group"][aria-label="scale()"]',
					).length;
					const previous = state.__rapidEffects.paints.at(-1);
					if (
						previous?.opaqueWidth !== opaqueWidth ||
						previous.scaleCount !== scaleCount
					) {
						state.__rapidEffects.paints.push({
							at: performance.now(),
							scaleCount,
							opaqueWidth,
						});
					}
				}
				requestAnimationFrame(sampleCanvas);
			};
			requestAnimationFrame(sampleCanvas);
			window.addEventListener(refreshEvent, () => {
				requestAnimationFrame(() => {
					state.__rapidEffects.refreshes++;
				});
			});
			new MutationObserver((mutations) => {
				for (const mutation of mutations) {
					const nodes =
						mutation.type === 'characterData'
							? [mutation.target]
							: [...mutation.addedNodes];
					if (
						nodes.some((node) =>
							node.textContent?.includes('not found in code'),
						)
					)
						state.__rapidEffects.missingSource = true;
				}
			}).observe(document.body, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		}, REACT_REFRESH_FINISHED_EVENT);

		await page.route('**/api/duplicate-effect', async (route) => {
			if (firstDuplicate) {
				firstDuplicate = false;
				await persistenceGate;
			}

			await route.continue();
		});
		await page.route('**/*.hot-update.json', async (route) => {
			await hmrGate;
			await route.continue();
		});
		const firstRequest = page.waitForRequest('**/api/duplicate-effect');
		await scaleEffects.first().click({button: 'right'});
		await page
			.getByRole('button', {name: 'Duplicate', exact: true})
			.last()
			.click();
		await firstRequest;
		await expect(scaleEffects).toHaveCount(2, {timeout: 1_000});
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(720);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.75$/}),
		).toHaveCount(2);
		await effects
			.getByRole('button', {name: 'Factor', exact: true})
			.filter({hasText: /^0\.75$/})
			.last()
			.click();
		const factorInput = effects.getByRole('textbox', {
			name: 'Factor',
			exact: true,
		});
		await factorInput.fill('0.5');
		await factorInput.press('Enter');
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.5$/}),
		).toHaveCount(1);
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(480);
		await page.keyboard.press('ControlOrMeta+d');
		await expect(scaleEffects).toHaveCount(3, {timeout: 1_000});
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.5$/}),
		).toHaveCount(2);
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(240);
		const indicator = page.locator('[data-remotion-effect-drop-indicator]');
		const checkReorderGaps = async (
			headers: Locator,
			beforeFirst: Locator | null,
		) => {
			const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
			const hoverEffect = async (index: number, edge: 'top' | 'bottom') => {
				const bounds = await headers.nth(index).evaluate((header) => {
					const rect =
						header.parentElement!.parentElement!.getBoundingClientRect();
					return {x: rect.x, top: rect.top, bottom: rect.bottom};
				});
				await headers.nth(index).dispatchEvent('dragover', {
					dataTransfer,
					clientX: bounds.x + 10,
					clientY: edge === 'top' ? bounds.top + 1 : bounds.bottom - 1,
				});
				return bounds;
			};
			await headers.first().dispatchEvent('dragstart', {dataTransfer});
			await hoverEffect(1, 'bottom');
			await expect(indicator).toHaveCount(1);
			const afterSecondEffect = await indicator.boundingBox();
			await headers.nth(1).dispatchEvent('dragleave', {
				dataTransfer,
				relatedTarget: await headers.nth(2).elementHandle(),
			});
			await expect(indicator).toHaveCount(1);
			await hoverEffect(2, 'top');
			await expect(indicator).toHaveCount(1);
			expect(await indicator.boundingBox()).toEqual(afterSecondEffect);
			await hoverEffect(0, 'top');
			await expect(indicator).toHaveCount(0);
			const lastEffect = await hoverEffect(2, 'bottom');
			await expect(indicator).toHaveCount(1);
			const lastGap = await indicator.boundingBox();
			expect(lastGap!.y + lastGap!.height).toBe(lastEffect.bottom);
			await headers.first().dispatchEvent('dragend', {dataTransfer});
			await expect(indicator).toHaveCount(0);
			await headers.last().dispatchEvent('dragstart', {dataTransfer});
			let headingGap: Awaited<ReturnType<Locator['boundingBox']>> = null;
			if (beforeFirst) {
				await beforeFirst.dispatchEvent('dragover', {dataTransfer});
				await expect(indicator).toHaveCount(1);
				headingGap = await indicator.boundingBox();
			}
			const firstEffect = await hoverEffect(0, 'top');
			await expect(indicator).toHaveCount(1);
			const firstGap = await indicator.boundingBox();
			expect(firstGap!.y).toBe(firstEffect.top);
			if (headingGap) expect(firstGap).toEqual(headingGap);
			await headers.first().dispatchEvent('dragleave', {dataTransfer});
			await expect(indicator).toHaveCount(0);
			await headers.last().dispatchEvent('dragend', {dataTransfer});
			await dataTransfer.dispose();
			if (beforeFirst) {
				const sourceBounds = (await headers.last().boundingBox())!;
				const firstBounds = (await headers.first().boundingBox())!;
				const headingBounds = (await beforeFirst.boundingBox())!;
				const positions: number[] = [];
				for (
					let y = headingBounds.y + headingBounds.height - 1;
					y <= firstBounds.y + 1;
					y++
				) {
					positions.push(y);
				}

				await page.mouse.move(sourceBounds.x + 60, sourceBounds.y + 10);
				await page.mouse.down();
				try {
					await page.mouse.move(sourceBounds.x + 60, sourceBounds.y - 10, {
						steps: 3,
					});
					for (const x of [
						firstBounds.x + 2,
						firstBounds.x + 60,
						firstBounds.x + firstBounds.width - 2,
					]) {
						for (const y of positions) {
							await page.mouse.move(x, y);
							await page.mouse.move(x, y);
							await page.evaluate(() => new Promise(requestAnimationFrame));
							expect(await indicator.count(), `Top gap at ${x}, ${y}`).toBe(1);
						}
						positions.reverse();
					}
				} finally {
					await page.keyboard.press('Escape');
					await page.mouse.up();
				}
				await expect(indicator).toHaveCount(0);
			}
		};
		await checkReorderGaps(
			effects.locator('[draggable="true"]'),
			effects.getByRole('button', {name: 'Collapse Effects', exact: true}),
		);
		const timelineEffects = page
			.locator('[draggable="true"]:not(section[aria-label="Effects"] *)')
			.filter({has: page.getByRole('group', {name: 'scale()', exact: true})});
		await expect(timelineEffects).toHaveCount(3);
		await checkReorderGaps(timelineEffects, null);
		await scaleEffects.last().click();
		await page.keyboard.press('Backspace');
		await expect(scaleEffects).toHaveCount(2, {timeout: 1_000});
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(480);
		await page.getByRole('button', {name: 'Add effect', exact: true}).click();
		await page.getByPlaceholder('Search effects...').fill('brightness');
		await page
			.getByRole('button', {name: 'Add brightness() effect', exact: true})
			.click();
		await expect(brightnessEffects).toHaveCount(1, {timeout: 1_000});
		await expect(scaleEffects).toHaveCount(2);
		expect(fs.readFileSync(effectKeyframeE2eFile, 'utf8')).toBe(original);

		await page.keyboard.press('ControlOrMeta+z');
		await expect(brightnessEffects).toHaveCount(0, {timeout: 1_000});
		await page.keyboard.press('ControlOrMeta+Shift+z');
		await expect(brightnessEffects).toHaveCount(1, {timeout: 1_000});
		const beforeHmr = await scaleEffects.first().boundingBox();
		expect(beforeHmr).not.toBeNull();

		await expect(
			effects
				.getByRole('button', {name: 'Amount', exact: true})
				.filter({hasText: /^0\.25$/}),
		).toHaveCount(1);
		await page.evaluate(() => {
			(
				window as typeof window & {
					__rapidEffects: {checkingSettledEffects: boolean};
				}
			).__rapidEffects.checkingSettledEffects = true;
		});
		releasePersistence();
		await expect
			.poll(() => {
				const contents = fs.readFileSync(effectKeyframeE2eFile, 'utf8');
				const image = contents
					.split('name="Effect scale precision"')[1]
					.split('/>')[0];
				return {
					scale: image.match(/scale\(/g)?.length ?? 0,
					brightness: image.match(/brightness\(/g)?.length ?? 0,
					scaleValues: [...image.matchAll(/scale:\s*([0-9.]+)/g)].map((match) =>
						Number(match[1]),
					),
				};
			})
			.toEqual({scale: 2, brightness: 1, scaleValues: [0.75, 0.5]});
		await expect(scaleEffects).toHaveCount(2);
		await expect(brightnessEffects).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.75$/}),
		).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.5$/}),
		).toHaveCount(1);

		expect(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							__rapidEffects: {refreshes: number};
						}
					).__rapidEffects.refreshes,
			),
		).toBe(0);
		releaseHmr();
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						(
							window as typeof window & {
								__rapidEffects: {refreshes: number};
							}
						).__rapidEffects.refreshes,
				),
			)
			.toBeGreaterThan(0);
		await expect(scaleEffects).toHaveCount(2);
		await expect(brightnessEffects).toHaveCount(1);
		const afterHmr = await scaleEffects.first().boundingBox();
		expect(afterHmr).not.toBeNull();
		expect(Math.abs(afterHmr!.y - beforeHmr!.y)).toBeLessThanOrEqual(1);
		expect(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							__rapidEffects: {missingSource: boolean};
						}
					).__rapidEffects.missingSource,
			),
		).toBe(false);

		await expect.poll(opaqueWidth).toBe(480);
		expect(
			await page.evaluate(
				() =>
					(
						window as typeof window & {
							__rapidEffects: {incorrectSettledEffects: boolean};
						}
					).__rapidEffects.incorrectSettledEffects,
			),
		).toBe(false);
		const latencyPath = test.info().outputPath('rapid-effect-latency.json');
		fs.mkdirSync(test.info().outputDir, {recursive: true});
		fs.writeFileSync(
			latencyPath,
			JSON.stringify(
				await page.evaluate(() => {
					const {actions, paints} = (
						window as typeof window & {
							__rapidEffects: {
								actions: {name: string; at: number}[];
								paints: {at: number; scaleCount: number; opaqueWidth: number}[];
							};
						}
					).__rapidEffects;
					return {
						actions,
						paints,
						timings: actions.map((action) => {
							const expected =
								action.name === 'Duplicate effect'
									? {scaleCount: 2, opaqueWidth: 720}
									: action.name === 'Duplicate selected effect'
										? {scaleCount: 3, opaqueWidth: 240}
										: {scaleCount: 2, opaqueWidth: 480};
							const inspector =
								action.name === 'Edit effect value'
									? null
									: paints.find(
											(paint) =>
												paint.at >= action.at &&
												paint.scaleCount === expected.scaleCount,
										);
							const canvas = paints.find(
								(paint) =>
									paint.at >= action.at &&
									paint.opaqueWidth === expected.opaqueWidth,
							);
							return {
								...action,
								inspectorMs: inspector ? inspector.at - action.at : null,
								canvasMs: canvas ? canvas.at - action.at : null,
							};
						}),
					};
				}),
				null,
				2,
			),
		);
		await test.info().attach('rapid-effect-latency.json', {
			path: latencyPath,
			contentType: 'application/json',
		});
		await page.reload();
		await page
			.getByRole('group', {name: 'Effect scale precision', exact: true})
			.first()
			.click();
		await expect(scaleEffects).toHaveCount(2);
		await expect(brightnessEffects).toHaveCount(1);

		const failureGate = new Promise<void>((resolve) => {
			releaseFailure = resolve;
		});
		let failNextDuplicate = true;
		await page.route('**/api/duplicate-effect', async (route) => {
			if (!failNextDuplicate) {
				await route.continue();
				return;
			}

			failNextDuplicate = false;
			await failureGate;
			await route.fulfill({
				json: {success: false, error: 'Injected effect persistence failure'},
			});
		});
		const failedDuplicate = page.waitForRequest('**/api/duplicate-effect');
		await brightnessEffects.click({button: 'right'});
		await page
			.getByRole('button', {name: 'Duplicate', exact: true})
			.last()
			.click();
		await failedDuplicate;
		await expect(brightnessEffects).toHaveCount(2, {timeout: 1_000});
		await page.keyboard.press('ControlOrMeta+d');
		await expect(brightnessEffects).toHaveCount(3, {timeout: 1_000});
		await page.getByRole('button', {name: 'Add effect', exact: true}).click();
		await page.getByPlaceholder('Search effects...').fill('duotone');
		await page
			.getByRole('button', {name: 'Add duotone() effect', exact: true})
			.click();
		const duotoneEffects = effects.getByRole('group', {
			name: 'duotone()',
			exact: true,
		});
		await expect(duotoneEffects).toHaveCount(1, {timeout: 1_000});
		releaseFailure();
		await expect(brightnessEffects).toHaveCount(1);
		await expect(duotoneEffects).toHaveCount(1);
		await expect
			.poll(() => {
				const image = fs
					.readFileSync(effectKeyframeE2eFile, 'utf8')
					.split('name="Effect scale precision"')[1]
					.split('/>')[0];
				return {
					brightness: image.match(/brightness\(/g)?.length ?? 0,
					duotone: image.match(/duotone\(/g)?.length ?? 0,
				};
			})
			.toEqual({brightness: 1, duotone: 1});
		await brightnessEffects.click({button: 'right'});
		await page
			.getByRole('button', {name: 'Duplicate', exact: true})
			.last()
			.click();
		await expect(brightnessEffects).toHaveCount(2, {timeout: 1_000});
		await expect
			.poll(() => {
				const image = fs
					.readFileSync(effectKeyframeE2eFile, 'utf8')
					.split('name="Effect scale precision"')[1]
					.split('/>')[0];
				return image.match(/brightness\(/g)?.length ?? 0;
			})
			.toBe(2);
		await page.reload();
		await page
			.getByRole('group', {name: 'Effect scale precision', exact: true})
			.first()
			.click();
		await expect(scaleEffects).toHaveCount(2);
		await expect(brightnessEffects).toHaveCount(2);
		await expect(duotoneEffects).toHaveCount(1);

		await page.evaluate((refreshEvent) => {
			const studioWindow = window as typeof window & {
				__unackedRefreshes: number;
			};
			studioWindow.__unackedRefreshes = 0;
			window.addEventListener(refreshEvent, () => {
				studioWindow.__unackedRefreshes++;
			});
		}, REACT_REFRESH_FINISHED_EVENT);
		const responseGate = new Promise<void>((resolve) => {
			releaseResponse = resolve;
		});
		await page.route('**/api/delete-effect', async (route) => {
			const response = await route.fetch();
			await responseGate;
			await route.fulfill({response});
		});
		await scaleEffects.first().click();
		await page.keyboard.press('Backspace');
		await expect(scaleEffects).toHaveCount(1, {timeout: 1_000});
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(640);
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						(window as typeof window & {__unackedRefreshes: number})
							.__unackedRefreshes,
				),
			)
			.toBeGreaterThan(0);
		await expect(scaleEffects).toHaveCount(1);
		await expect.poll(opaqueWidth).toBe(640);
		await effects
			.getByRole('button', {name: 'Factor', exact: true})
			.filter({hasText: /^0\.5$/})
			.click();
		await factorInput.fill('0.6');
		await factorInput.press('Enter');
		await expect.poll(opaqueWidth, {timeout: 1_000}).toBe(768);
		const unacknowledgedSource = fs
			.readFileSync(effectKeyframeE2eFile, 'utf8')
			.split('name="Effect scale precision"')[1]
			.split('/>')[0];
		expect(unacknowledgedSource.match(/scale\(/g)).toHaveLength(1);
		expect(unacknowledgedSource).toContain('scale: 0.5');
		releaseResponse();
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf8'))
			.toContain('scale: 0.6');
		await expect(
			page.getByRole('button', {name: 'Undo', exact: true}),
		).toBeEnabled();
		const beforeExternalEdit = fs.readFileSync(effectKeyframeE2eFile, 'utf8');
		expect(beforeExternalEdit.match(/scale: 0\.6\b/g)).toHaveLength(1);
		fs.writeFileSync(
			effectKeyframeE2eFile,
			beforeExternalEdit.replace('scale: 0.6', 'scale: 0.65'),
		);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.65$/}),
		).toHaveCount(1);
		await expect.poll(opaqueWidth).toBe(832);
		await expect(
			page.getByRole('button', {name: 'Undo', exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', {name: 'Redo', exact: true}),
		).toHaveCount(0);
		await expect(
			page.getByText('not found in code', {exact: false}),
		).toHaveCount(0);
		await page.reload();
		await page
			.getByRole('group', {name: 'Effect scale precision', exact: true})
			.first()
			.click();
		await expect(scaleEffects).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.65$/}),
		).toHaveCount(1);
		await expect.poll(opaqueWidth).toBe(832);
	} catch (error) {
		await test.info().attach('failure-before-cleanup.png', {
			body: await page.screenshot(),
			contentType: 'image/png',
		});
		await test.info().attach('failure-paint-timings.json', {
			body: JSON.stringify(
				await page.evaluate(() => ({
					activeElement: {
						tagName: document.activeElement?.tagName,
						role: document.activeElement?.getAttribute('role'),
						label: document.activeElement?.getAttribute('aria-label'),
					},
					timings: (window as typeof window & {__rapidEffects: unknown})
						.__rapidEffects,
				})),
				null,
				2,
			),
			contentType: 'application/json',
		});
		throw error;
	} finally {
		releasePersistence();
		releaseHmr();
		releaseFailure();
		releaseResponse();
		await page.unrouteAll({behavior: 'wait'});
		await stopStudio();
	}
});

test('external source edits supersede queued effects and late save responses', async ({
	page,
}) => {
	test.setTimeout(120_000);
	await startStudio();
	const original = fs.readFileSync(effectKeyframeE2eFile, 'utf8');
	let releaseRequest = () => {};
	let releaseResponse = () => {};
	const requestGate = new Promise<void>((resolve) => {
		releaseRequest = resolve;
	});
	const responseGate = new Promise<void>((resolve) => {
		releaseResponse = resolve;
	});
	try {
		await page.goto(`${STUDIO_URL}/effect-keyframe-e2e`);
		const effects = page.getByRole('region', {name: 'Effects', exact: true});
		const scales = effects.getByRole('group', {name: 'scale()', exact: true});
		await expect(async () => {
			await page
				.getByRole('group', {name: 'Effect scale precision', exact: true})
				.first()
				.click();
			await expect(
				effects
					.getByRole('button', {name: 'Factor', exact: true})
					.filter({hasText: /^0\.75$/}),
			).toBeVisible({timeout: 1000});
		}).toPass({timeout: 30_000});
		const canvas = page.getByLabel('Effect scale precision canvas', {
			exact: true,
		});
		const opaqueWidth = () =>
			canvas.evaluate((element: HTMLCanvasElement) => {
				const context = element.getContext('2d')!;
				return context
					.getImageData(0, element.height / 2, element.width, 1)
					.data.filter((alpha, index) => index % 4 === 3 && alpha >= 128)
					.length;
			});
		await expect.poll(opaqueWidth).toBe(960);
		let propertyRequests = 0;
		page.on('request', (request) => {
			if (request.url().endsWith('/api/save-effect-props')) propertyRequests++;
		});
		await page.route('**/api/duplicate-effect', async (route) => {
			await requestGate;
			await route.continue();
		});
		const sent = page.waitForRequest('**/api/duplicate-effect');
		await scales.first().click({button: 'right'});
		await page
			.getByRole('button', {name: 'Duplicate', exact: true})
			.last()
			.click();
		await sent;
		await expect(scales).toHaveCount(2);
		await effects
			.getByRole('button', {name: 'Factor', exact: true})
			.filter({hasText: /^0\.75$/})
			.last()
			.click();
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.fill('0.5');
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.press('Enter');
		await expect.poll(opaqueWidth).toBe(480);
		const external = original.replace('scale: 0.75', 'scale: 0.6');
		fs.writeFileSync(effectKeyframeE2eFile, external);
		await expect(scales).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.6$/}),
		).toBeVisible();
		await expect.poll(opaqueWidth).toBe(768);
		const rejected = page.waitForResponse('**/api/duplicate-effect');
		releaseRequest();
		expect((await (await rejected).json()).success).toBe(false);
		await expect(scales).toHaveCount(1);
		expect(fs.readFileSync(effectKeyframeE2eFile, 'utf8')).toBe(external);
		expect(propertyRequests).toBe(0);
		await page.unroute('**/api/duplicate-effect');

		let persisted = () => {};
		const persistedGate = new Promise<void>((resolve) => {
			persisted = resolve;
		});
		await page.route('**/api/duplicate-effect', async (route) => {
			const response = await route.fetch();
			persisted();
			await responseGate;
			await route.fulfill({response});
		});
		await scales.first().click({button: 'right'});
		await page
			.getByRole('button', {name: 'Duplicate', exact: true})
			.last()
			.click();
		await persistedGate;
		await expect(scales).toHaveCount(2);
		await effects
			.getByRole('button', {name: 'Factor', exact: true})
			.filter({hasText: /^0\.6$/})
			.last()
			.click();
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.fill('0.8');
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.press('Enter');
		await expect.poll(opaqueWidth).toBeCloseTo(614, -1);
		const newest = original.replace('scale: 0.75', 'scale: 0.4');
		fs.writeFileSync(effectKeyframeE2eFile, newest);
		await expect(scales).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.4$/}),
		).toBeVisible();
		await expect.poll(opaqueWidth).toBe(512);
		const lateResponse = page.waitForResponse('**/api/duplicate-effect');
		releaseResponse();
		await lateResponse;
		await page.unroute('**/api/duplicate-effect');
		await expect(scales).toHaveCount(1);
		await expect.poll(opaqueWidth).toBe(512);
		expect(fs.readFileSync(effectKeyframeE2eFile, 'utf8')).toBe(newest);
		expect(propertyRequests).toBe(0);

		await effects
			.getByRole('button', {name: 'Factor', exact: true})
			.filter({hasText: /^0\.4$/})
			.click();
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.fill('0.7');
		await effects
			.getByRole('textbox', {name: 'Factor', exact: true})
			.press('Enter');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf8'))
			.toContain('scale: 0.7');
		await expect.poll(opaqueWidth).toBe(896);
		await page.keyboard.press('ControlOrMeta+z');
		await expect
			.poll(() => fs.readFileSync(effectKeyframeE2eFile, 'utf8'))
			.toBe(newest);
		await expect.poll(opaqueWidth).toBe(512);
		await page.reload();
		await page
			.getByRole('group', {name: 'Effect scale precision', exact: true})
			.first()
			.click();
		await expect(scales).toHaveCount(1);
		await expect(
			effects
				.getByRole('button', {name: 'Factor', exact: true})
				.filter({hasText: /^0\.4$/}),
		).toBeVisible();
	} finally {
		releaseRequest();
		releaseResponse();
		await page.unrouteAll({behavior: 'wait'});
		await stopStudio();
	}
});
