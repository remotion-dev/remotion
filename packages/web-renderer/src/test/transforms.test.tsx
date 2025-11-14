import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {testImage} from './utils';

test('should be able to deal with a simple transform directly on the element', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{transform: 'rotate(45deg)'}}
				>
					<polygon points="50,10 90,90 10,90" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'simple-transforms'});
});

test('should be able to deal with a simple transform on the parent', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill style={{transform: 'rotate(45deg)'}}>
				<svg viewBox="0 0 100 100" width="100" height="100">
					<polygon points="50,10 90,90 10,90" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'parent-transforms'});
});

test('should be able to deal with a transform-origin on itself', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}
				>
					<rect x="0" y="0" width="50" height="50" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-origin-itself'});
});

test('should be able to deal with a transform-origin on parent', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}
			>
				<svg viewBox="0 0 100 100" width="100" height="100">
					<rect x="0" y="0" width="50" height="50" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transform-origin'});
});

test('accumulated transforms', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill style={{transform: 'scale(0.5)'}}>
				<AbsoluteFill
					style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}
				>
					<svg viewBox="0 0 100 100" width="100" height="100">
						<rect x="0" y="0" width="50" height="50" fill="orange" />
					</svg>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'accumulated-origin'});
});

test('transformed canvases', async () => {
	const Component: React.FC = () => {
		const [handle] = useState(() => delayRender());
		const ref = useRef<HTMLCanvasElement>(null);

		useEffect(() => {
			if (!ref.current) return;
			const ctx = ref.current.getContext('2d');
			if (!ctx) return;
			ctx.fillStyle = 'orange';
			ctx.fillRect(0, 0, 50, 50);
			continueRender(handle);
		}, [handle]);

		return (
			<AbsoluteFill
				style={{
					transform: 'rotate(45deg)',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<canvas
					ref={ref}
					width="50"
					height="50"
					style={{width: '50px', height: '50px'}}
				/>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'transformed-canvas'});
});

test('multi-level nested transforms with distinct transform-origins', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{
					transform: 'rotate(15deg) scale(0.8)',
					transformOrigin: '25% 25%',
				}}
			>
				<AbsoluteFill
					style={{
						transform: 'rotate(30deg)',
						transformOrigin: '75% 75%',
					}}
				>
					<svg
						viewBox="0 0 100 100"
						width="100"
						height="100"
						style={{
							transform: 'rotate(45deg) scale(1.2)',
							transformOrigin: '10% 90%',
						}}
					>
						<rect x="10" y="10" width="30" height="30" fill="orange" />
						<circle cx="70" cy="70" r="15" fill="blue" />
					</svg>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'multi-level-transform-origins'});
});

test('three-level nested transforms with varying origins', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{
					transform: 'scale(0.9)',
					transformOrigin: '0% 0%',
				}}
			>
				<AbsoluteFill
					style={{
						transform: 'translate(10px, 10px) rotate(20deg)',
						transformOrigin: '50% 0%',
					}}
				>
					<AbsoluteFill
						style={{
							transform: 'rotate(-10deg)',
							transformOrigin: '100% 100%',
						}}
					>
						<svg viewBox="0 0 100 100" width="100" height="100">
							<rect x="20" y="20" width="60" height="60" fill="orange" />
						</svg>
					</AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-level-transform-origins'});
});

test('nested transforms with pixel-based transform-origins', async () => {
	const Component: React.FC = () => {
		return (
			<AbsoluteFill
				style={{
					transform: 'rotate(25deg)',
					transformOrigin: '10px 10px',
				}}
			>
				<svg
					viewBox="0 0 100 100"
					width="100"
					height="100"
					style={{
						transform: 'rotate(-25deg) scale(0.8)',
						transformOrigin: '90px 10px',
					}}
				>
					<polygon points="50,10 90,90 10,90" fill="orange" />
				</svg>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		component: Component,
		durationInFrames: 100,
		fps: 30,
		width: 100,
		height: 100,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'pixel-transform-origins'});
});
