import React, {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import {evenHarderCase} from './fixtures';
import {transformOriginFixture} from './transform-origin-fixture';
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
		composition: {
			component: Component,
			id: 'simple-transforms',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
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
		composition: {
			component: Component,
			id: 'parent-transforms',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
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
		composition: {
			component: Component,
			id: 'transform-origin-itself',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
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
		composition: {
			component: Component,
			id: 'transform-origin',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
			calculateMetadata: () => Promise.resolve({}),
		},
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
		composition: {
			component: Component,
			id: 'accumulated-origin',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
			calculateMetadata: () => Promise.resolve({}),
		},
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
		composition: {
			component: Component,
			id: 'transformed-canvas',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
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
		composition: {
			component: Component,
			id: 'multi-level-transform-origins',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
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
		composition: {
			component: Component,
			id: 'three-level-transform-origins',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 100,
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-level-transform-origins'});
});

test('nested transforms with pixel-based transform-origins', async () => {
	const blob = await renderStillOnWeb({
		composition: transformOriginFixture,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'pixel-transform-origins'});
});

test('complicated example', async () => {
	await page.viewport(1080, 1080);

	const Component: React.FC = () => {
		return (
			<AbsoluteFill>
				<AbsoluteFill style={{}}>
					<AbsoluteFill>
						<AbsoluteFill
							style={{
								transformOrigin: 'center center',
								transform: 'scale(0.68) translateX(0px) translateY(0px)',
							}}
						>
							<AbsoluteFill>
								<AbsoluteFill
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										transform: 'scale(1.24643)',
									}}
								>
									<svg
										width="311.7691453623979"
										height="360"
										viewBox="0 0 311.7691453623979 360"
										xmlns="http://www.w3.org/2000/svg"
										style={{
											overflow: 'visible',
											marginLeft: 90,
										}}
									>
										<path
											// `transform-origin` is not a valid SVG prop, skipping or put into style if necessary
											// transformOrigin is not a valid property on SVG path in React.
											d="M 0 180 C 0 307.26 45.6741797955913 333.63 155.88457268119896 270 C 266.09496556680665 206.37 266.09496556680665 153.63 155.88457268119896 90 C 45.6741797955913 26.370000000000005 0 52.74000000000001 0 180 Z"
											fill="rgba(236, 245, 254, 1)"
											style={{
												transformBox: 'fill-box',
											}}
										/>
									</svg>
								</AbsoluteFill>
								<AbsoluteFill
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										transform: 'scale(1.27459)',
									}}
								>
									<svg
										width="233.82685902179844"
										height="270"
										viewBox="0 0 233.82685902179844 270"
										xmlns="http://www.w3.org/2000/svg"
										style={{
											overflow: 'visible',
											marginLeft: 70,
										}}
									>
										<path
											d="M 0 135 C 0 230.445 34.25563484669348 250.2225 116.91342951089922 202.5 C 199.57122417510496 154.7775 199.57122417510496 115.2225 116.91342951089922 67.5 C 34.25563484669348 19.777500000000003 0 39.55500000000001 0 135 Z"
											fill="rgba(182, 218, 251, 1)"
											style={{
												transformBox: 'fill-box',
											}}
										/>
									</svg>
								</AbsoluteFill>
								<AbsoluteFill
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										transform: 'scale(1.30414)',
									}}
								>
									<svg
										width="155.88457268119896"
										height="180"
										viewBox="0 0 155.88457268119896 180"
										xmlns="http://www.w3.org/2000/svg"
										style={{
											overflow: 'visible',
											marginLeft: 50,
										}}
									>
										<path
											d="M 0 90 C 0 153.63 22.83708989779565 166.815 77.94228634059948 135 C 133.04748278340332 103.185 133.04748278340332 76.815 77.94228634059948 45 C 22.83708989779565 13.185000000000002 0 26.370000000000005 0 90 Z"
											fill="rgba(12, 133, 243, 1)"
											style={{
												transformBox: 'fill-box',
											}}
										/>
									</svg>
								</AbsoluteFill>
							</AbsoluteFill>
						</AbsoluteFill>
					</AbsoluteFill>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	};

	const blob = await renderStillOnWeb({
		composition: {
			component: Component,
			id: 'complicated-example',
			width: 1080,
			height: 1080,
			fps: 30,
			durationInFrames: 100,
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'complicated-example'});
});

test('even harder case', async () => {
	await page.viewport(1080, 1080);
	const blob = await renderStillOnWeb({
		composition: evenHarderCase,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'even-harder-case'});
});
