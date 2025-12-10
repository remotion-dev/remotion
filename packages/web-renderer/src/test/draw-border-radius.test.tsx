import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import {test} from 'vitest';
import {parseBorderRadius, setBorderRadius} from '../border-radius';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('should draw image with simple border radius', async () => {
	const Component: React.FC = () => {
		const ref = useRef<HTMLCanvasElement>(null);

		useLayoutEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;

			// Create a simple colored rectangle as our "image"
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 100;
			tempCanvas.height = 100;
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) return;
			tempCtx.fillStyle = 'red';
			tempCtx.fillRect(0, 0, 100, 100);

			const borderRadius = parseBorderRadius({
				borderRadius: '20px',
				width: 100,
				height: 100,
			});

			setBorderRadius({
				ctx,
				img: tempCanvas,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				borderRadius,
			});
		}, []);

		return (
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<canvas ref={ref} width={100} height={100} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'draw-border-radius-simple',
			width: 200,
			height: 200,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-simple'});
});

test('should draw image with elliptical border radius', async () => {
	const Component: React.FC = () => {
		const ref = useRef<HTMLCanvasElement>(null);

		useLayoutEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;

			// Create a gradient as our "image"
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 100;
			tempCanvas.height = 100;
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) return;
			const gradient = tempCtx.createLinearGradient(0, 0, 100, 100);
			gradient.addColorStop(0, 'blue');
			gradient.addColorStop(1, 'green');
			tempCtx.fillStyle = gradient;
			tempCtx.fillRect(0, 0, 100, 100);

			const borderRadius = parseBorderRadius({
				borderRadius: '50px / 25px',
				width: 100,
				height: 100,
			});

			setBorderRadius({
				ctx,
				img: tempCanvas,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				borderRadius,
			});
		}, []);

		return (
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<canvas ref={ref} width={100} height={100} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'draw-border-radius-elliptical',
			width: 200,
			height: 200,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-elliptical'});
});

test('should draw image with different corner radii', async () => {
	const Component: React.FC = () => {
		const ref = useRef<HTMLCanvasElement>(null);

		useLayoutEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;

			// Create a pattern
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 100;
			tempCanvas.height = 100;
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) return;
			tempCtx.fillStyle = 'purple';
			tempCtx.fillRect(0, 0, 100, 100);
			tempCtx.fillStyle = 'yellow';
			tempCtx.fillRect(25, 25, 50, 50);

			const borderRadius = parseBorderRadius({
				borderRadius: '10px 20px 30px 40px',
				width: 100,
				height: 100,
			});

			setBorderRadius({
				ctx,
				img: tempCanvas,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				borderRadius,
			});
		}, []);

		return (
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<canvas ref={ref} width={100} height={100} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'draw-border-radius-different',
			width: 200,
			height: 200,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-different'});
});

test('should draw image with percentage border radius', async () => {
	const Component: React.FC = () => {
		const ref = useRef<HTMLCanvasElement>(null);

		useLayoutEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;

			// Create a simple colored rectangle
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 100;
			tempCanvas.height = 100;
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) return;
			tempCtx.fillStyle = 'orange';
			tempCtx.fillRect(0, 0, 100, 100);

			const borderRadius = parseBorderRadius({
				borderRadius: '50%',
				width: 100,
				height: 100,
			});

			setBorderRadius({
				ctx,
				img: tempCanvas,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				borderRadius,
			});
		}, []);

		return (
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<canvas ref={ref} width={100} height={100} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'draw-border-radius-percentage',
			width: 200,
			height: 200,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-percentage'});
});

test('should draw image with no border radius', async () => {
	const Component: React.FC = () => {
		const ref = useRef<HTMLCanvasElement>(null);

		useLayoutEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;

			// Create a simple colored rectangle
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 100;
			tempCanvas.height = 100;
			const tempCtx = tempCanvas.getContext('2d');
			if (!tempCtx) return;
			tempCtx.fillStyle = 'cyan';
			tempCtx.fillRect(0, 0, 100, 100);

			const borderRadius = parseBorderRadius({
				borderRadius: '0px',
				width: 100,
				height: 100,
			});

			setBorderRadius({
				ctx,
				img: tempCanvas,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				borderRadius,
			});
		}, []);

		return (
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<canvas ref={ref} width={100} height={100} />
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'draw-border-radius-none',
			width: 200,
			height: 200,
			fps: 25,
			durationInFrames: 1,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'draw-border-radius-none'});
});
