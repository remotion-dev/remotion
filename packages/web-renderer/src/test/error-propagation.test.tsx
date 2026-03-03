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
class RootCauseError extends Error {}

test('should propagate errors thrown in useEffect', async () => {
	const ThrowsInUseEffect: React.FC = () => {
		useEffect(() => {
			throw new UseEffectError('Error from useEffect');
		}, []);
		return <div>Hello</div>;
	};

	const promise = renderStillOnWeb({
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

	await expect(promise).rejects.toThrow(UseEffectError);

	await expect(promise).rejects.toMatchObject({
		stack: expect.stringContaining('React component stack:'),
	});
	await expect(promise).rejects.toMatchObject({
		stack: expect.stringContaining(
			'For the likely root cause, see "React component stack:" after the JavaScript stack trace below.',
		),
	});
	await expect(promise).rejects.toMatchObject({
		stack: expect.stringContaining('ThrowsInUseEffect'),
	});
});

test('should propagate useful errors for non-Error throw values', async () => {
	const ThrowsObjectInUseEffect: React.FC = () => {
		useEffect(() => {
			const objectThrownAsUnknown: unknown = {
				foo: 'bar',
				reason: 'object-error',
			};
			throw objectThrownAsUnknown;
		}, []);

		return <div>Hello</div>;
	};

	const promise = renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: ThrowsObjectInUseEffect,
			id: 'throws-object-in-useeffect',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await expect(promise).rejects.toMatchObject({
		message: expect.stringContaining('"reason":"object-error"'),
		stack: expect.stringContaining('React component stack:'),
	});
	await expect(promise).rejects.toMatchObject({
		stack: expect.stringContaining('ThrowsObjectInUseEffect'),
	});
});

test('should unwrap generic React wrapper errors and keep useful stack', async () => {
	// Unit-style normalization test: We synthesize the wrapper shape that
	// normalizeUncaughtReactError() handles, instead of asserting React itself
	// always emits this wrapper in onUncaughtError().
	const ThrowsWrappedReactStyleError: React.FC = () => {
		useEffect(() => {
			throw new Error('Error thrown during rendering', {
				cause: new RootCauseError('Root cause from wrapped React error'),
			});
		}, []);

		return <div>Hello</div>;
	};

	const promise = renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: ThrowsWrappedReactStyleError,
			id: 'throws-wrapped-react-style-error',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await expect(promise).rejects.toThrow(RootCauseError);
	await expect(promise).rejects.toMatchObject({
		message: 'Root cause from wrapped React error',
		stack: expect.stringContaining('ThrowsWrappedReactStyleError'),
	});
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
