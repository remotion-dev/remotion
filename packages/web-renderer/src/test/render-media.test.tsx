import {interpolateColors, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

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
		progress: {renderedFrames: number; encodedFrames: number};
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
	expect(finalCall.progress.renderedFrames).toBe(30);
	expect(finalCall.progress.encodedFrames).toBe(30);

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

test('should not fire stale progress callbacks after render completes', async () => {
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
