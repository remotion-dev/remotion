import {useEffect} from 'react';
import {useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';

class UseEffectError extends Error {}
class FrameRenderError extends Error {}
class UseEffectOnFrameError extends Error {}
class InitialRenderError extends Error {}

test('should propagate errors thrown in useEffect', async () => {
	const ThrowsInUseEffect: React.FC = () => {
		useEffect(() => {
			throw new UseEffectError('Error from useEffect');
		}, []);
		return <div>Hello</div>;
	};

	await expect(
		renderStillOnWeb({
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
		}),
	).rejects.toThrow(UseEffectError);
});

test('should propagate errors thrown on a specific frame', async () => {
	const ThrowsOnFrame5: React.FC = () => {
		const frame = useCurrentFrame();
		if (frame === 5) {
			throw new FrameRenderError('Error on frame 5');
		}

		return <div>Frame {frame}</div>;
	};

	await expect(
		renderMediaOnWeb({
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
		}),
	).rejects.toThrow(FrameRenderError);
});

test('should propagate errors thrown in useEffect on a specific frame', async () => {
	const ThrowsInUseEffectOnFrame3: React.FC = () => {
		const frame = useCurrentFrame();

		useEffect(() => {
			if (frame === 3) {
				throw new UseEffectOnFrameError('useEffect error on frame 3');
			}
		}, [frame]);

		return <div>Frame {frame}</div>;
	};

	await expect(
		renderMediaOnWeb({
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
		}),
	).rejects.toThrow(UseEffectOnFrameError);
});

test('should propagate errors thrown during initial render', async () => {
	const ThrowsDuringRender: React.FC = () => {
		throw new InitialRenderError('Error during initial render');
	};

	await expect(
		renderStillOnWeb({
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
		}),
	).rejects.toThrow(InitialRenderError);
});
