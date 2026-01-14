import {useEffect, useState} from 'react';
import {useCurrentFrame, useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

class UseEffectError extends Error {}
class FrameRenderError extends Error {}
class UseEffectOnFrameError extends Error {}
class InitialRenderError extends Error {}

test('should propagate errors thrown in useEffect', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const ThrowsInUseEffect: React.FC = () => {
		useEffect(() => {
			throw new UseEffectError('Error from useEffect');
		}, []);
		return <div>Hello</div>;
	};

	try {
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: ThrowsInUseEffect,
				id: 'throws-in-useeffect',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 0,
			inputProps: {},
			imageFormat: 'png',
		});
		expect.fail('Expected render to throw');
	} catch (err) {
		expect(err).toBeInstanceOf(UseEffectError);
	}
});

test('should propagate errors thrown on a specific frame', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const ThrowsOnFrame5: React.FC = () => {
		const frame = useCurrentFrame();
		if (frame === 5) {
			throw new FrameRenderError('Error on frame 5');
		}

		return <div>Frame {frame}</div>;
	};

	try {
		await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: ThrowsOnFrame5,
				id: 'throws-on-frame-5',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 10,
			},
			inputProps: {},
		});
		expect.fail('Expected render to throw');
	} catch (err) {
		expect(err).toBeInstanceOf(FrameRenderError);
	}
});

test('should propagate errors thrown in useEffect on a specific frame', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const ThrowsInUseEffectOnFrame3: React.FC = () => {
		const frame = useCurrentFrame();

		useEffect(() => {
			if (frame === 3) {
				throw new UseEffectOnFrameError('useEffect error on frame 3');
			}
		}, [frame]);

		return <div>Frame {frame}</div>;
	};

	try {
		await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: ThrowsInUseEffectOnFrame3,
				id: 'throws-in-useeffect-on-frame-3',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 10,
			},
			inputProps: {},
		});
		expect.fail('Expected render to throw');
	} catch (err) {
		expect(err).toBeInstanceOf(UseEffectOnFrameError);
	}
});

test('should propagate errors thrown during initial render', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const ThrowsDuringRender: React.FC = () => {
		throw new InitialRenderError('Error during initial render');
	};

	try {
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: ThrowsDuringRender,
				id: 'throws-during-render',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 0,
			inputProps: {},
			imageFormat: 'png',
		});
		expect.fail('Expected render to throw');
	} catch (err) {
		expect(err).toBeInstanceOf(InitialRenderError);
	}
});

// TODO: delayRender timeout errors escape in real browsers because cancelRenderInternalthrows synchronously from setTimeout. In puppeteer this is caught via Runtime.exceptionThrown,
// but in real browsers it escapes. Need to investigate a fix in core.
test.skip('should propagate delayRender timeout errors', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const NeverContinues: React.FC = () => {
		const {delayRender} = useDelayRender();
		useState(() =>
			delayRender('Waiting forever', {
				retries: 0,
			}),
		);
		return <div>Loading...</div>;
	};

	try {
		await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: NeverContinues,
				id: 'never-continues',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 10,
			},
			inputProps: {},
			delayRenderTimeoutInMilliseconds: 3000,
		});
		expect.fail('Expected render to throw');
	} catch (err) {
		expect(err).toBeInstanceOf(Error);
		const error = err as Error;
		// Check message or stack since Firefox doesn't include message in first line of stack
		const errorText = error.message + (error.stack ?? '');
		expect(errorText).toMatch(/delayRender.*Waiting forever/);
	}
});
