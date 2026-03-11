import {ALL_FORMATS, BlobSource, Input} from 'mediabunny';
import {interpolateColors, useCurrentFrame} from 'remotion';
import {VERSION} from 'remotion/version';
import {expect, test} from 'vitest';
import type {RenderMediaOnWebProgress} from '../render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

const getMaxScrollDimensions = () => {
	return {
		width: Math.max(
			document.documentElement.scrollWidth,
			document.body.scrollWidth,
		),
		height: Math.max(
			document.documentElement.scrollHeight,
			document.body.scrollHeight,
		),
	};
};

test('should render media on web', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100" style={{width: 400, height: 400}}>
				<circle
					cx="50"
					cy="50"
					r="50"
					fill={interpolateColors(frame, [0, 4], ['red', 'blue'])}
				/>
			</svg>
		);
	};

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'render-media-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 5,
		},
		inputProps: {},
	});
});

test('should not increase page scroll dimensions while rendering', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const baselineDimensions = getMaxScrollDimensions();
	const makeEven = (value: number) => (value % 2 === 0 ? value : value + 1);
	const compositionWidth = makeEven(baselineDimensions.width + 400);
	const compositionHeight = makeEven(baselineDimensions.height + 400);

	let onProgressCalls = 0;
	const maxObservedDimensions = {...baselineDimensions};

	const Component: React.FC = () => null;

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'scroll-dimensions-test',
			width: compositionWidth,
			height: compositionHeight,
			fps: 30,
			durationInFrames: 3,
		},
		inputProps: {},
		onProgress: () => {
			onProgressCalls++;
			const currentDimensions = getMaxScrollDimensions();
			maxObservedDimensions.width = Math.max(
				maxObservedDimensions.width,
				currentDimensions.width,
			);
			maxObservedDimensions.height = Math.max(
				maxObservedDimensions.height,
				currentDimensions.height,
			);
		},
	});

	expect(onProgressCalls).toBeGreaterThan(0);
	expect(maxObservedDimensions.width).toBeLessThanOrEqual(
		baselineDimensions.width,
	);
	expect(maxObservedDimensions.height).toBeLessThanOrEqual(
		baselineDimensions.height,
	);

	const afterRenderDimensions = getMaxScrollDimensions();
	expect(afterRenderDimensions.width).toBeLessThanOrEqual(
		baselineDimensions.width,
	);
	expect(afterRenderDimensions.height).toBeLessThanOrEqual(
		baselineDimensions.height,
	);
});

test('should throttle onProgress callback to 250ms', {retry: 2}, async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100" style={{width: 400, height: 400}}>
				<circle
					cx="50"
					cy="50"
					r="50"
					fill={interpolateColors(frame, [0, 30], ['red', 'blue'])}
				/>
			</svg>
		);
	};

	const progressCalls: Array<{
		time: number;
		progress: RenderMediaOnWebProgress;
	}> = [];
	const startTime = Date.now();

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'throttle-test',
			width: 400,
			height: 400,
			fps: 30,
			durationInFrames: 30,
		},
		inputProps: {},
		onProgress: (progress) => {
			progressCalls.push({
				time: Date.now() - startTime,
				progress: {...progress},
			});
		},
	});

	// Should have at least one progress call
	expect(progressCalls.length).toBeGreaterThan(0);

	// Final call should have all frames rendered and encoded
	const finalCall = progressCalls[progressCalls.length - 1];
	expect(finalCall.progress).toEqual({
		renderedFrames: 30,
		encodedFrames: 30,
		doneIn: expect.any(Number),
		renderEstimatedTime: 0,
		progress: 1,
	});

	// Check that calls are throttled (if we have multiple calls)
	if (progressCalls.length > 1) {
		for (let i = 1; i < progressCalls.length - 1; i++) {
			const timeDiff = progressCalls[i].time - progressCalls[i - 1].time;
			// Allow some variance but should be around 250ms
			// We use 200ms as lower bound to account for timing variations
			expect(timeDiff).toBeGreaterThanOrEqual(200);
		}
	}
});

test(
	'should provide progress estimates while rendering',
	{retry: 2},
	async (t) => {
		if (t.task.file.projectName === 'webkit') {
			t.skip();
			return;
		}

		const progressCalls: RenderMediaOnWebProgress[] = [];
		const Component: React.FC = () => null;

		await renderMediaOnWeb({
			composition: {
				component: Component,
				id: 'progress-estimation-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 20,
			},
			inputProps: {},
			onFrame: async (frame) => {
				await new Promise((resolve) => {
					setTimeout(resolve, 40);
				});
				return frame;
			},
			onProgress: (progress) => {
				progressCalls.push({...progress});
			},
		});

		expect(progressCalls.length).toBeGreaterThan(1);

		const intermediateCall = progressCalls.find((progress) => {
			return progress.encodedFrames < 20;
		});
		expect(intermediateCall).toBeDefined();
		expect(intermediateCall?.renderedFrames).toBeGreaterThan(0);
		expect(intermediateCall?.renderEstimatedTime).toBeGreaterThan(0);
		expect(intermediateCall?.doneIn).toBeNull();
		expect(intermediateCall?.progress).toBeGreaterThan(0);
		expect(intermediateCall?.progress).toBeLessThan(1);

		const finalCall = progressCalls[progressCalls.length - 1];
		expect(finalCall).toEqual({
			renderedFrames: 20,
			encodedFrames: 20,
			doneIn: expect.any(Number),
			renderEstimatedTime: 0,
			progress: 1,
		});
	},
);

test('should include "Made with Remotion" metadata', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const Component: React.FC = () => null;

	const result = await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'metadata-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 5,
		},
		inputProps: {},
	});

	const blob = await result.getBlob();

	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(blob),
	});

	const tags = await input.getMetadataTags();
	expect(tags.comment).toBe(`Made with Remotion ${VERSION}`);
});

test('should not fire stale progress callbacks after render completes', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let renderCompleted = false;
	let staleCallbackReceived = false;
	let callbackCallCount = 0;

	const Component: React.FC = () => null;

	await renderMediaOnWeb({
		composition: {
			component: Component,
			id: 'stale-progress-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 60,
		},
		inputProps: {},
		onProgress: () => {
			callbackCallCount++;
			if (renderCompleted) {
				staleCallbackReceived = true;
			}
		},
		licenseKey: 'free-license',
	});

	renderCompleted = true;

	// eslint-disable-next-line
	await new Promise((resolve) => setTimeout(resolve, 500));

	expect(staleCallbackReceived).toBe(false);
	expect(callbackCallCount).toBeGreaterThan(0);
});
