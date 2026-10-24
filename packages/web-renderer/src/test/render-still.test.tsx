import {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import {useCurrentFrame, useDelayRender} from 'remotion';
import {expect, expectTypeOf, test} from 'vitest';
import {renderFramesOnWeb, renderStillOnWeb} from '../index';
import {renderMediaOnWeb} from '../render-media-on-web';
import type {RenderStillOnWebResult} from '../render-still-on-web';
import '../symbol-dispose';
import {testImage} from './utils';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'render-still-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
				calculateMetadata: () => Promise.resolve({}),
			},
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'test-img'});
});

test('should be able to read frame number', async () => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100">
				<text x="50" y="50" textAnchor="middle" fill="blue">
					{frame}
				</text>
			</svg>
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'frame-number-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 20,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'frame-number'});
});

test('should render a still while a media render is in progress', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let notifyMediaStarted: () => void = () => undefined;
	const mediaStarted = new Promise<void>((resolve) => {
		notifyMediaStarted = resolve;
	});
	let notifyStillStarted: () => void = () => undefined;
	const stillStarted = new Promise<void>((resolve) => {
		notifyStillStarted = resolve;
	});
	let releaseMedia: () => void = () => undefined;
	const mediaReleased = new Promise<void>((resolve) => {
		releaseMedia = resolve;
	});

	const Component: React.FC<{type: 'media' | 'still'}> = ({type}) => {
		const {delayRender, continueRender} = useDelayRender();
		const [handle] = useState(() =>
			type === 'media' ? delayRender('Waiting to release media render') : null,
		);

		useEffect(() => {
			if (type === 'still') {
				notifyStillStarted();
				return;
			}

			notifyMediaStarted();
			mediaReleased.then(() => continueRender(handle!));
		}, [continueRender, handle, type]);

		return <div style={{width: 100, height: 100, backgroundColor: 'red'}} />;
	};

	const composition = {
		component: Component,
		id: 'parallel-media-and-still-test',
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 1,
		defaultProps: {type: 'media' as const},
	};

	const mediaRender = renderMediaOnWeb({
		licenseKey: 'free-license',
		composition,
		inputProps: {type: 'media' as const},
		outputTarget: 'arraybuffer',
	});
	await mediaStarted;

	const stillRender = renderStillOnWeb({
		licenseKey: 'free-license',
		composition,
		frame: 0,
		inputProps: {type: 'still' as const},
	});
	const stillStartedBeforeMediaFinished = await Promise.race([
		stillStarted.then(() => true),
		new Promise<false>((resolve) => {
			setTimeout(() => resolve(false), 5000);
		}),
	]);

	releaseMedia();
	await Promise.all([mediaRender, stillRender]);

	expect(stillStartedBeforeMediaFinished).toBe(true);
});

test('captures sparse frames without remounting and waits for each seek', async () => {
	let mounts = 0;
	let unmounts = 0;
	let metadataCalls = 0;
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender} = useDelayRender();
		const [readyFrame, setReadyFrame] = useState(-1);
		useEffect(() => {
			mounts++;
			return () => {
				unmounts++;
			};
		}, []);
		useEffect(() => {
			const handle = delayRender(`Loading frame ${frame}`);
			const timeout = setTimeout(() => {
				flushSync(() => setReadyFrame(frame));
				continueRender(handle);
			}, 30);
			return () => clearTimeout(timeout);
		}, [frame, delayRender, continueRender]);
		return (
			<div
				style={{
					width: 10,
					height: 10,
					backgroundColor: `rgb(${readyFrame}, 0, 0)`,
				}}
			/>
		);
	};

	const results = await renderFramesOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'batch-stills',
			width: 10,
			height: 10,
			fps: 30,
			durationInFrames: 30,
			calculateMetadata: () => {
				metadataCalls++;
				return {};
			},
		},
		frames: [20, 0, 10],
		inputProps: {},
	});
	expectTypeOf(results).toEqualTypeOf<RenderStillOnWebResult[]>();
	expect(mounts).toBe(1);
	expect(unmounts).toBe(1);
	expect(metadataCalls).toBe(1);
	const pixels = [];
	for (const result of results) {
		const canvas = await result.canvas();
		pixels.push(
			Array.from(canvas.getContext('2d')!.getImageData(5, 5, 1, 1).data),
		);
		// Encoding remains available after the composition has unmounted.
		expect((await result.blob()).size).toBeGreaterThan(0);
	}

	expect(pixels).toEqual([
		[0, 0, 0, 255],
		[10, 0, 0, 255],
		[20, 0, 0, 255],
	]);
});

test.each(['abort', 'error'] as const)(
	'cleans up after a batch %s on a later frame and allows the next call',
	async (failure) => {
		const controller = new AbortController();
		let unmounts = 0;
		const visited: number[] = [];
		const Component: React.FC = () => {
			const frame = useCurrentFrame();
			const {delayRender} = useDelayRender();
			useEffect(() => {
				return () => {
					unmounts++;
				};
			}, []);
			useEffect(() => {
				visited.push(frame);
				if (frame === 10) {
					if (failure === 'error') {
						throw new Error('Batch frame failed');
					}

					delayRender('Waiting on aborted frame');
					controller.abort();
				}
			}, [frame, delayRender]);
			return <div />;
		};

		const composition = {
			component: Component,
			id: 'batch-failure',
			width: 10,
			height: 10,
			fps: 30,
			durationInFrames: 30,
		};
		await expect(
			renderFramesOnWeb({
				licenseKey: 'free-license',
				composition,
				frames: [0, 10, 20],
				signal: controller.signal,
				inputProps: {},
			}),
		).rejects.toThrow(
			failure === 'abort'
				? 'renderFramesOnWeb() was cancelled'
				: 'Batch frame failed',
		);
		expect(unmounts).toBe(1);
		expect(visited).toEqual([0, 10]);
		const still = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 0,
			inputProps: {},
		});
		expectTypeOf(still).toEqualTypeOf<RenderStillOnWebResult>();
		expect((await still.blob()).size).toBeGreaterThan(0);
		expect(unmounts).toBe(2);
	},
);

test.each([
	{frames: [], message: 'at least one frame'},
	{frames: [1, 1], message: 'duplicate frames'},
	{frames: [-1], message: 'non-negative numbers'},
	{frames: [0.5], message: 'only integers'},
	{frames: [NaN], message: 'finite numbers'},
	{frames: [Infinity], message: 'finite numbers'},
	{frames: [30], message: 'out of range'},
	{frames: ['1'] as unknown as number[], message: 'only numbers'},
	{frames: 1 as unknown as number[], message: 'must be an array'},
])(
	'renderFramesOnWeb rejects $message before mounting (#12326)',
	async ({frames, message}) => {
		let mounts = 0;
		const Component: React.FC = () => {
			useEffect(() => {
				mounts++;
			}, []);
			return null;
		};

		await expect(
			renderFramesOnWeb({
				licenseKey: 'free-license',
				composition: {
					component: Component,
					id: 'empty-batch',
					width: 10,
					height: 10,
					fps: 30,
					durationInFrames: 30,
				},
				frames,
				inputProps: {},
			}),
		).rejects.toThrow(message);
		expect(mounts).toBe(0);
	},
);
