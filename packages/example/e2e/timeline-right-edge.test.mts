import {expect, test} from '@playwright/test';
import fs from 'fs';
import {rootFile, STUDIO_URL} from './constants.mts';
import {startStudio, stopStudio} from './studio-server.mts';

test('handles timeline layer edge geometry and interactions', async ({
	page,
}) => {
	await startStudio();
	try {
		const openInEditorRequests: unknown[] = [];
		await page.route('**/api/default-editor-info', async (route) => {
			await route.fulfill({
				json: {
					success: true,
					data: {
						defaultEditor: 'vscode',
						installedEditors: [
							{
								id: 'vscode',
								name: 'Code',
								nameWithType: 'VS Code',
							},
						],
					},
				},
			});
		});
		await page.route('**/api/open-in-editor', async (route) => {
			openInEditorRequests.push(route.request().postDataJSON());
			await route.fulfill({json: {success: true, data: {success: true}}});
		});
		fs.writeFileSync(
			rootFile,
			`
import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Composition, Sequence, Solid, staticFile} from 'remotion';
const src = staticFile('sine-wave.wav'); // Exactly one second, or 30 frames.
const Layers = () => <>
  <AbsoluteFill name="Fill available time" />
  <AbsoluteFill name="Explicit fill cutoff" durationInFrames={30} />
  <AbsoluteFill name="Explicit composition match" durationInFrames={180} />
  <AbsoluteFill name="Fill clipped before own cutoff" durationInFrames={240} />
  <Sequence name="Fill parent" durationInFrames={30}>
    <AbsoluteFill name="Inherited fill" />
  <AbsoluteFill name="Explicit parent match" durationInFrames={30} />
    <AbsoluteFill name="Child clipped before own cutoff" durationInFrames={60} />
  </Sequence>
  <Solid name="Solid cutoff" color="gray" width={100} height={100} from={27} durationInFrames={9} trimBefore={27} />
  <Audio name="Natural end" src={src} durationInFrames={30} />
  <Audio name="Duration cutoff" src={src} durationInFrames={15} />
  <Sequence name="Short parent" durationInFrames={15}>
    <Audio name="Parent cutoff" src={src} />
  </Sequence>
  <Sequence name="Matching parent" durationInFrames={30}>
    <Audio name="Matching child" src={src} />
  </Sequence>
  <Audio name="Trimmed start" src={src} trimBefore={10} durationInFrames={20} />
  <Audio name="Trimmed end" src={src} trimAfter={20} />
  <Audio name="Fast media" src={src} playbackRate={2} durationInFrames={15} />
  <Audio name="Slow media" src={src} playbackRate={0.5} durationInFrames={60} />
  <Audio name="Loop" src={src} loop durationInFrames={60} />
  <Audio name="Frozen" src={src} freeze={0} durationInFrames={30} />
  <Audio name="Loop without cutoff" src={src} loop />
  <Audio name="Freeze without cutoff" src={src} freeze={0} />
  <Audio name="Composition cutoff" src={src} from={165} />
  <Audio name="Composition match" src={src} from={150} />
  <Video name="Video natural end" src={staticFile('blush-1x.webm')} durationInFrames={80} muted />
  <Video name="Video cutoff" src={staticFile('blush-1x.webm')} durationInFrames={79} muted />
  <Video name="Video without cutoff" src={staticFile('blush-1x.webm')} muted />
  <Video name="Video trimmed start" src={staticFile('blush-1x.webm')} from={20} trimBefore={20} muted />
  <Video name="Video shifted start" src={staticFile('blush-1x.webm')} from={20} muted />
  <Video name="Video fast trimmed start" src={staticFile('blush-1x.webm')} from={20} trimBefore={20} playbackRate={2} muted />
  <Video name="Video held frame" src={staticFile('blush-1x.webm')} durationInFrames={120} muted />
</>;
export const E2eTestRoot = () => <Composition id="timeline-edges" component={Layers} durationInFrames={180} fps={30} width={640} height={360} />;
`,
		);
		await page.setViewportSize({width: 1440, height: 2000});
		await page.goto(`${STUDIO_URL}/timeline-edges`);
		for (const [name, radius] of [
			['Fill available time', '2px'],
			['Explicit fill cutoff', '0px'],
			['Explicit composition match', '2px'],
			['Fill clipped before own cutoff', '2px'],
			['Fill parent', '0px'],
			['Inherited fill', '2px'],
			['Explicit parent match', '2px'],
			['Child clipped before own cutoff', '2px'],
			['Natural end', '2px'],
			['Solid cutoff', '0px'],
			['Duration cutoff', '0px'],
			['Short parent', '0px'],
			['Parent cutoff', '2px'],
			['Matching parent', '0px'],
			['Matching child', '2px'],
			['Trimmed start', '2px'],
			['Trimmed end', '0px'],
			['Fast media', '2px'],
			['Slow media', '2px'],
			['Loop', '0px'],
			['Frozen', '0px'],
			['Loop without cutoff', '2px'],
			['Freeze without cutoff', '2px'],
			['Composition cutoff', '2px'],
			['Composition match', '2px'],
			['Video natural end', '2px'],
			['Video cutoff', '0px'],
			['Video held frame', '0px'],
			['Video without cutoff', '2px'],
		]) {
			const layer = page.locator(
				`[data-timeline-marquee-item][title="${name}"]`,
			);
			await layer.scrollIntoViewIfNeeded();
			await expect(layer).toHaveCSS('border-top-right-radius', radius);
			await expect(layer).toHaveCSS('border-bottom-right-radius', radius);
		}
		for (const [name, radius] of [
			['Video trimmed start', '0px'],
			['Video shifted start', '2px'],
			['Video fast trimmed start', '0px'],
			['Trimmed start', '0px'],
			['Natural end', '2px'],
		]) {
			const layer = page.locator(
				`[data-timeline-marquee-item][title="${name}"]`,
			);
			await layer.scrollIntoViewIfNeeded();
			await expect(layer).toHaveCSS('border-top-left-radius', radius);
			await expect(layer).toHaveCSS('border-bottom-left-radius', radius);
		}

		const movableLayer = page.locator(
			'[data-timeline-marquee-item][title="Natural end"]',
		);
		await movableLayer.click({button: 'right', position: {x: 30, y: 10}});
		const contextMenu = page.locator('[data-remotion-menu-tree-id]').last();
		await expect(contextMenu).toBeVisible();
		await movableLayer.click({position: {x: 30, y: 10}});
		await expect(contextMenu).not.toBeVisible();
		expect(openInEditorRequests).toHaveLength(0);
		await movableLayer.dblclick({position: {x: 30, y: 10}});
		await expect.poll(() => openInEditorRequests.length).toBe(1);

		const rightEdgeLayer = page.locator(
			'[data-timeline-marquee-item][title="Explicit fill cutoff"]',
		);
		await expect(rightEdgeLayer).toHaveCSS('opacity', '0.75');
		const rightEdgeHandle = rightEdgeLayer.locator(
			'[title="Drag to change duration"]',
		);

		await rightEdgeHandle.hover();
		await page.mouse.down();
		try {
			await expect(rightEdgeLayer).toHaveCSS('opacity', '0.75');
		} finally {
			await page.mouse.up();
		}

		await expect(rightEdgeLayer).toHaveCSS('opacity', '1');

		const leftEdgeLayer = page.locator(
			'[data-timeline-marquee-item][title="Solid cutoff"]',
		);
		await expect(leftEdgeLayer).toHaveCSS('opacity', '0.75');
		const leftEdgeHandle = leftEdgeLayer.locator(
			'[title="Drag to trim start"]',
		);
		const leftEdgeHandleBox = await leftEdgeHandle.boundingBox();
		if (leftEdgeHandleBox === null) {
			throw new Error('Expected left timeline edge to have a bounding box');
		}

		await page.mouse.move(
			leftEdgeHandleBox.x + leftEdgeHandleBox.width - 1,
			leftEdgeHandleBox.y + leftEdgeHandleBox.height / 2,
		);
		await page.mouse.down();
		try {
			await expect(leftEdgeLayer).toHaveCSS('opacity', '0.75');
			await expect(rightEdgeLayer).toHaveCSS('opacity', '1');
		} finally {
			await page.mouse.up();
		}

		await expect(leftEdgeLayer).toHaveCSS('opacity', '1');
		await expect(rightEdgeLayer).toHaveCSS('opacity', '0.75');

		const dragHandle = async ({
			handle,
			deltaX,
		}: {
			readonly handle: ReturnType<typeof page.locator>;
			readonly deltaX: number;
		}) => {
			const box = await handle.boundingBox();
			if (box === null) {
				throw new Error(
					'Expected timeline resize handle to have a bounding box',
				);
			}

			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
			try {
				await page.mouse.move(
					box.x + box.width / 2 + deltaX,
					box.y + box.height / 2,
					{
						steps: 5,
					},
				);
			} finally {
				await page.mouse.up();
			}
		};

		const getSequenceNumberProp = (
			source: string,
			name: string,
			prop: 'durationInFrames' | 'from',
		) => {
			const match = source.match(
				new RegExp(
					`<[A-Za-z]+\\b(?=[^>]*name="${name}")(?=[^>]*${prop}=\\{(\\d+)\\})[^>]*>`,
				),
			);
			return match ? Number(match[1]) : null;
		};

		const rightResizeA = page.locator(
			'[data-timeline-marquee-item][title="Explicit fill cutoff"]',
		);
		const rightResizeB = page.locator(
			'[data-timeline-marquee-item][title="Duration cutoff"]',
		);
		await rightResizeA.scrollIntoViewIfNeeded();
		await rightResizeA.click();
		await expect(rightResizeA).toHaveCSS('opacity', '1');
		await expect(rightResizeB).toHaveCSS('opacity', '0.75');
		await dragHandle({
			handle: rightResizeB.locator('[title="Drag to change duration"]'),
			deltaX: -40,
		});
		await expect(rightResizeA).toHaveCSS('opacity', '1');
		await expect(rightResizeB).toHaveCSS('opacity', '0.75');
		await expect
			.poll(() => {
				const source = fs.readFileSync(rootFile, 'utf-8');
				return [
					getSequenceNumberProp(
						source,
						'Explicit fill cutoff',
						'durationInFrames',
					),
					getSequenceNumberProp(source, 'Duration cutoff', 'durationInFrames'),
				];
			})
			.toEqual([30, 9]);

		await rightResizeB
			.locator('[title="Drag to change duration"]')
			.click({modifiers: ['Meta']});
		await expect(rightResizeA).toHaveCSS('opacity', '1');
		await expect(rightResizeB).toHaveCSS('opacity', '1');
		await dragHandle({
			handle: rightResizeB.locator('[title="Drag to change duration"]'),
			deltaX: 40,
		});
		await expect
			.poll(() => {
				const source = fs.readFileSync(rootFile, 'utf-8');
				return [
					getSequenceNumberProp(
						source,
						'Explicit fill cutoff',
						'durationInFrames',
					),
					getSequenceNumberProp(source, 'Duration cutoff', 'durationInFrames'),
				];
			})
			.toEqual([36, 15]);

		const leftResizeA = page.locator(
			'[data-timeline-marquee-item][title="Explicit composition match"]',
		);
		const leftResizeB = page.locator(
			'[data-timeline-marquee-item][title="Fill clipped before own cutoff"]',
		);
		await leftResizeA.scrollIntoViewIfNeeded();
		await leftResizeA.click();
		await expect(leftResizeA).toHaveCSS('opacity', '1');
		await expect(leftResizeB).toHaveCSS('opacity', '0.75');
		await dragHandle({
			handle: leftResizeB.locator('[title="Drag to trim start"]'),
			deltaX: 40,
		});
		await expect(leftResizeA).toHaveCSS('opacity', '1');
		await expect(leftResizeB).toHaveCSS('opacity', '0.75');
		await expect
			.poll(() => {
				const source = fs.readFileSync(rootFile, 'utf-8');
				const fromA = getSequenceNumberProp(
					source,
					'Explicit composition match',
					'from',
				);
				const fromB = getSequenceNumberProp(
					source,
					'Fill clipped before own cutoff',
					'from',
				);
				return [
					fromA,
					fromB,
					getSequenceNumberProp(
						source,
						'Explicit composition match',
						'durationInFrames',
					),
					getSequenceNumberProp(
						source,
						'Fill clipped before own cutoff',
						'durationInFrames',
					),
				];
			})
			.toEqual([null, 6, 180, 174]);

		await leftResizeB
			.locator('[title="Drag to trim start"]')
			.click({modifiers: ['Meta']});
		await expect(leftResizeA).toHaveCSS('opacity', '1');
		await expect(leftResizeB).toHaveCSS('opacity', '1');
		await dragHandle({
			handle: leftResizeB.locator('[title="Drag to trim start"]'),
			deltaX: 40,
		});
		await expect
			.poll(() => {
				const source = fs.readFileSync(rootFile, 'utf-8');
				const fromA = getSequenceNumberProp(
					source,
					'Explicit composition match',
					'from',
				);
				const fromB = getSequenceNumberProp(
					source,
					'Fill clipped before own cutoff',
					'from',
				);
				return [
					fromA,
					fromB,
					getSequenceNumberProp(
						source,
						'Explicit composition match',
						'durationInFrames',
					),
					getSequenceNumberProp(
						source,
						'Fill clipped before own cutoff',
						'durationInFrames',
					),
				];
			})
			.toEqual([6, 12, 174, 168]);
	} finally {
		await stopStudio();
	}
});
