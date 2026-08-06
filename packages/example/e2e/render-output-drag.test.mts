import fs from 'node:fs';
import path from 'node:path';
import {expect, test} from '@playwright/test';
import {apiCall} from './api-call.mts';
import {STUDIO_URL, exampleDir} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test.describe('render output dragging', () => {
	test.beforeEach(async () => {
		await startStudio();
	});

	test.afterEach(async () => {
		await stopStudio();
	});

	test('offers a completed render as a downloadable file drag', async ({
		page,
	}) => {
		const id = 'render-output-drag-e2e';
		const outName = 'out/render-output-drag-e2e.mp4';
		const absoluteOutput = path.join(exampleDir, outName);
		const contents = Buffer.from('render-output-drag-e2e');
		fs.mkdirSync(path.dirname(absoluteOutput), {recursive: true});
		fs.writeFileSync(absoluteOutput, contents);
		const registeredIds: string[] = [];

		try {
			await page.setViewportSize({width: 1920, height: 1080});
			await page.addInitScript(() => {
				const originalMatchMedia = window.matchMedia.bind(window);
				window.matchMedia = (query) => {
					const result = originalMatchMedia(query);
					if (query === '(any-pointer: fine)') {
						return new Proxy(result, {
							get: (target, property) => {
								if (property === 'matches') {
									return true;
								}

								const value = Reflect.get(target, property);
								return typeof value === 'function' ? value.bind(target) : value;
							},
						});
					}

					return result;
				};
			});
			await page.goto(STUDIO_URL);
			await expect(page.getByRole('button', {name: 'Schema'})).toBeVisible();
			await page.evaluate(() => {
				window.localStorage.setItem(
					'remotion.sidebarRightCollapsing',
					'expanded',
				);
				window.localStorage.setItem('remotion.sidebarPanel', 'renders');
			});
			await page.reload();
			await expect(page.getByText('Renders', {exact: true})).toBeVisible();
			const result = await apiCall('/api/register-client-render', {
				id,
				type: 'client-video',
				compositionId: 'RenderOutputDrag',
				outName,
				startedAt: Date.now(),
				deletedOutputLocation: false,
				metadata: {
					width: 1920,
					height: 1080,
					sizeInBytes: contents.length,
				},
			});
			expect(result).toEqual({success: true});
			registeredIds.push(id);

			const output = page.getByText(outName, {exact: true});
			const renderItem = page.locator(`[data-render-queue-item="${id}"]`);
			const actionButtons = renderItem.locator('button.__remotion-hoverable');
			expect(
				await page.evaluate(() => ({
					dataTransfer: typeof DataTransfer,
					finePointer: window.matchMedia('(any-pointer: fine)').matches,
					maxTouchPoints: navigator.maxTouchPoints,
				})),
			).toEqual({
				dataTransfer: 'function',
				finePointer: true,
				maxTouchPoints: 0,
			});
			await expect(renderItem).toHaveAttribute('draggable', 'true');
			const actionButtonCount = await actionButtons.count();
			expect(actionButtonCount).toBeGreaterThan(0);
			expect(await output.getAttribute('draggable')).toBeNull();
			expect(
				await renderItem.evaluate(
					(element) => getComputedStyle(element).cursor,
				),
			).not.toBe('grab');

			const drag = await renderItem.evaluate((element) => {
				const dataTransfer = new DataTransfer();
				const event = new DragEvent('dragstart', {
					bubbles: true,
					cancelable: true,
					dataTransfer,
				});
				const accepted = element.dispatchEvent(event);
				return {
					accepted,
					downloadUrl: dataTransfer.getData('DownloadURL'),
				};
			});

			expect(drag.accepted).toBe(true);
			await expect(actionButtons).toHaveCount(0);
			const prefix = 'application/octet-stream:render-output-drag-e2e.mp4:';
			expect(drag.downloadUrl.startsWith(prefix)).toBe(true);

			const response = await fetch(drag.downloadUrl.slice(prefix.length));
			expect(response.status).toBe(200);
			expect(Buffer.from(await response.arrayBuffer())).toEqual(contents);
			await renderItem.dispatchEvent('dragend');
			await expect(actionButtons).toHaveCount(actionButtonCount);

			await page.evaluate(() => {
				Object.defineProperty(navigator, 'userAgent', {
					configurable: true,
					value: 'Mozilla/5.0 Firefox/141.0',
				});
			});
			const firefoxId = 'render-output-drag-firefox-e2e';
			const firefoxResult = await apiCall('/api/register-client-render', {
				id: firefoxId,
				type: 'client-video',
				compositionId: 'RenderOutputDrag',
				outName,
				startedAt: Date.now(),
				deletedOutputLocation: false,
				metadata: {
					width: 1920,
					height: 1080,
					sizeInBytes: contents.length,
				},
			});
			expect(firefoxResult).toEqual({success: true});
			registeredIds.push(firefoxId);
			await expect(
				page.locator(`[data-render-queue-item="${firefoxId}"]`),
			).toHaveAttribute('draggable', 'false');
		} finally {
			for (const registeredId of registeredIds) {
				await apiCall('/api/unregister-client-render', {
					id: registeredId,
				}).catch(() => undefined);
			}
			fs.rmSync(absoluteOutput, {force: true});
		}
	});
});
