import {CheckIcon} from '@remotion/design';
import {Gif} from '@remotion/gif';
import {Circle} from '@remotion/shapes';
import {renderStillOnWeb} from '@remotion/web-renderer';
import React, {useEffect} from 'react';
import {AbsoluteFill, AnimatedImage, Img} from 'remotion';
import {expect, test, vi} from 'vitest';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

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
	});

	// It worked!
});

test('forwards refs to the rendered DOM nodes on React 18', async ({
	onTestFinished,
}) => {
	const consoleError = vi.spyOn(console, 'error');
	onTestFinished(() => consoleError.mockRestore());
	const fill = vi.fn();
	const image = vi.fn();
	const canvas = vi.fn();
	const path = vi.fn();
	const svg = vi.fn();
	const src =
		'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

	expect(React.version).toMatch(/^18\./);
	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			id: 'react18-refs',
			component: () => (
				<AbsoluteFill ref={fill}>
					<Img ref={image} src={src} />
					<AnimatedImage src={src} width={8} height={8} />
					<Gif ref={canvas} src={src} width={8} height={8} />
					<Circle ref={path} radius={4} />
					<CheckIcon ref={svg} />
				</AbsoluteFill>
			),
			width: 16,
			height: 16,
			fps: 30,
			durationInFrames: 1,
		},
		inputProps: {},
		frame: 0,
	});

	expect(fill).toHaveBeenCalledWith(expect.any(HTMLDivElement));
	expect(image).toHaveBeenCalledWith(expect.any(HTMLImageElement));
	expect(canvas).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
	expect(path).toHaveBeenCalledWith(expect.any(SVGPathElement));
	expect(svg).toHaveBeenCalledWith(expect.any(SVGSVGElement));
	expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(
		/`ref` is not a prop|Function components cannot be given refs/,
	);
});

class UseEffectError extends Error {
	name = 'UseEffectError';
}

// in react 18, errors were re-thrown
// in react 19, errors are not re-thrown and onUncaughtError was introduced
test('should propagate errors thrown in useEffect (React 18)', async () => {
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
				id: 'throws-in-useeffect-react18',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 0,
			inputProps: {},
		}),
	).rejects.toThrow(UseEffectError);
});
