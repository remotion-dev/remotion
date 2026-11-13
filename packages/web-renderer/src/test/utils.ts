import type {ComponentType} from 'react';
import {expect, onTestFinished} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {withResolvers} from '../with-resolvers';

export const testImage = async ({
	blob,
	testId,
	threshold = 0.15,
	allowedMismatchedPixelRatio = 0.001,
}: {
	blob: Blob;
	testId: string;
	threshold?: number;
	allowedMismatchedPixelRatio?: number;
}) => {
	const img = document.createElement('img');
	const url = URL.createObjectURL(blob);
	img.src = url;
	img.dataset.testid = testId;
	document.body.appendChild(img);

	onTestFinished(() => {
		document.body.removeChild(img);
		URL.revokeObjectURL(url);
	});

	const {promise, resolve, reject} = withResolvers<void>();
	img.onload = () => {
		resolve();
	};

	img.onerror = () => {
		reject(new Error('Image failed to load'));
	};

	await promise;

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
		comparatorOptions: {
			threshold,
			allowedMismatchedPixelRatio,
		},
	});
};

export const testCompositions = async ({
	cases,
	columns,
	testId,
	scale,
}: {
	cases: {
		composition: {
			component: ComponentType;
			id: string;
			width: number;
			height: number;
			fps: number;
			durationInFrames: number;
		};
		frame: number;
	}[];
	columns: number;
	testId: string;
	scale: number | null;
}) => {
	const renderScale = scale ?? 1;
	const width = Math.max(...cases.map(({composition}) => composition.width));
	const maxHeight = Math.max(
		...cases.map(({composition}) => composition.height),
	);
	const cellWidth = Math.ceil(width * renderScale);
	const rowHeights = Array.from(
		{length: Math.ceil(cases.length / columns)},
		(_, row) =>
			Math.max(
				...cases
					.slice(row * columns, (row + 1) * columns)
					.map(({composition}) => Math.ceil(composition.height * renderScale)),
			),
	);
	await page.viewport(Math.max(1280, width), Math.max(720, maxHeight));
	const sheet = new OffscreenCanvas(
		cellWidth * columns,
		rowHeights.reduce((sum, height) => sum + height, 0),
	);
	try {
		const context = sheet.getContext('2d')!;
		// Separate renders keep SVG stylesheets and resource IDs from affecting other cases.
		for (const [index, {composition, frame}] of cases.entries()) {
			const still = await renderStillOnWeb({
				composition,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
				scale: renderScale,
			});
			const canvas = await still.canvas();
			try {
				context.drawImage(
					canvas,
					(index % columns) * cellWidth,
					rowHeights
						.slice(0, Math.floor(index / columns))
						.reduce((sum, height) => sum + height, 0),
				);
			} finally {
				canvas.width = 0;
				canvas.height = 0;
			}
		}

		await page.viewport(
			Math.max(1280, sheet.width),
			Math.max(720, sheet.height),
		);
		await testImage({
			blob: await sheet.convertToBlob({type: 'image/png'}),
			testId,
			allowedMismatchedPixelRatio: 0,
		});
	} finally {
		sheet.width = 0;
		sheet.height = 0;
	}
};
