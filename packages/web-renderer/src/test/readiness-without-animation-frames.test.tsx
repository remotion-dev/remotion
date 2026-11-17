import {useEffect, useState} from 'react';
import {useDelayRender} from 'remotion';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {renderFramesOnWeb, renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

// Hidden tabs stop requestAnimationFrame. Readiness must still settle.
beforeEach(() => {
	vi.stubGlobal('requestAnimationFrame', () => 0);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const settlesWithin = <T,>(promise: Promise<T>, ms: number) =>
	Promise.race([
		promise.then(
			(value) => ({status: 'resolved' as const, value}),
			(error: Error) => ({status: 'rejected' as const, error}),
		),
		new Promise<{status: 'pending'}>((resolve) => {
			setTimeout(() => resolve({status: 'pending'}), ms);
		}),
	]);

const ContinuesAfterDelay: React.FC = () => {
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() => delayRender('waiting for data'));

	useEffect(() => {
		const timeout = setTimeout(() => continueRender(handle), 50);
		return () => clearTimeout(timeout);
	}, [continueRender, handle]);

	return <div style={{width: 10, height: 10, backgroundColor: 'green'}} />;
};

const NeverContinues: React.FC = () => {
	const {delayRender} = useDelayRender();
	useState(() => delayRender('never continued'));
	return null;
};

const composition = (component: React.FC) => ({
	component,
	id: 'readiness-without-animation-frames',
	width: 10,
	height: 10,
	fps: 30,
	durationInFrames: 10,
});

test('renderStillOnWeb finishes after continueRender', async () => {
	const result = await settlesWithin(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition: composition(ContinuesAfterDelay),
			frame: 0,
			inputProps: {},
		}),
		3000,
	);

	expect(result.status).toBe('resolved');
});

test('renderFramesOnWeb finishes after continueRender', async () => {
	const result = await settlesWithin(
		renderFramesOnWeb({
			licenseKey: 'free-license',
			composition: composition(ContinuesAfterDelay),
			frames: [0],
			inputProps: {},
		}),
		3000,
	);

	expect(result.status).toBe('resolved');
});

test('renderStillOnWeb rejects when delayRender times out', async () => {
	const result = await settlesWithin(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition: composition(NeverContinues),
			frame: 0,
			inputProps: {},
			delayRenderTimeoutInMilliseconds: 200,
		}),
		6000,
	);

	expect(result.status).toBe('rejected');
	expect(result.status === 'rejected' && result.error.message).toContain(
		'never continued',
	);
});

test('renderStillOnWeb rejects when aborted', async () => {
	const controller = new AbortController();
	const rendering = renderStillOnWeb({
		licenseKey: 'free-license',
		composition: composition(NeverContinues),
		frame: 0,
		inputProps: {},
		signal: controller.signal,
	});
	setTimeout(() => controller.abort(), 50);

	const result = await settlesWithin(rendering, 3000);

	expect(result.status).toBe('rejected');
	expect(result.status === 'rejected' && result.error.message).toBe(
		'renderStillOnWeb() was cancelled',
	);
});
