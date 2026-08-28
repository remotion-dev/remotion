/* eslint-disable react/no-unknown-property */
import {ThreeCanvas} from '@remotion/three';
import {ThreeWebGPUCanvas} from '@remotion/three/webgpu';
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';

const Mesh: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<mesh
			rotation={[frame * 0.06, frame * 0.07, frame * 0.08]}
			scale={interpolate(Math.sin(frame / 10), [-1, 1], [0.8, 1.2])}
		>
			<boxGeometry args={[100, 100, 100]} />
			<meshStandardMaterial
				color={[
					Math.sin(frame * 0.12) * 0.5 + 0.5,
					Math.cos(frame * 0.11) * 0.5 + 0.5,
					Math.sin(frame * 0.08) * 0.5 + 0.5,
				]}
			/>
		</mesh>
	);
};

const ThreeTestComponent: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<ThreeCanvas
			width={width}
			height={height}
			style={{backgroundColor: 'white'}}
			camera={{fov: 75, position: [0, 0, 470]}}
		>
			<ambientLight intensity={0.15} />
			<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />
			<Mesh />
		</ThreeCanvas>
	);
};

const ThreeWebGPUTestComponent: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<ThreeWebGPUCanvas
			width={width}
			height={height}
			style={{backgroundColor: '#0b1020'}}
			camera={{fov: 60, position: [0, 0, 5]}}
		>
			<ambientLight intensity={0.4} />
			<directionalLight position={[5, 5, 5]} intensity={2.5} />
			<pointLight position={[-5, -3, 2]} intensity={30} color="#4f9dff" />
			<mesh>
				<torusKnotGeometry args={[1.1, 0.38, 220, 36]} />
				<meshStandardMaterial
					color="#ff8080"
					metalness={0.6}
					roughness={0.25}
				/>
			</mesh>
		</ThreeWebGPUCanvas>
	);
};

const extractPixelData = async (frame: VideoFrame): Promise<Uint8Array> => {
	const buffer = new Uint8Array(frame.allocationSize());
	await frame.copyTo(buffer);
	return buffer;
};

const framesAreIdentical = (a: Uint8Array, b: Uint8Array): boolean => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
};

test(
	'ThreeCanvas should not produce duplicate frames at 60fps',
	{timeout: 60_000},
	async (t) => {
		if (t.task.file.projectName === 'webkit') {
			t.skip();
			return;
		}

		const framePixelData: Uint8Array[] = [];

		await renderMediaOnWeb({
			composition: {
				component: ThreeTestComponent,
				id: 'three-duplicate-test',
				width: 400,
				height: 400,
				fps: 60,
				durationInFrames: 30,
			},
			inputProps: {},
			licenseKey: 'free-license',
			onFrame: async (videoFrame) => {
				const pixelData = await extractPixelData(videoFrame);
				framePixelData.push(pixelData);
				return videoFrame;
			},
		});

		const duplicates: number[] = [];
		for (let i = 1; i < framePixelData.length; i++) {
			if (framesAreIdentical(framePixelData[i - 1], framePixelData[i])) {
				duplicates.push(i);
			}
		}

		expect(duplicates.length).toBe(0);
	},
);

test(
	'ThreeWebGPUCanvas should fully render its first frame',
	{timeout: 60_000},
	async (t) => {
		if (t.task.file.projectName === 'webkit' || !('gpu' in navigator)) {
			t.skip();
			return;
		}

		const framePixelData: Uint8Array[] = [];

		await renderMediaOnWeb({
			composition: {
				component: ThreeWebGPUTestComponent,
				id: 'three-webgpu-first-frame-test',
				width: 400,
				height: 400,
				fps: 30,
				durationInFrames: 2,
			},
			inputProps: {},
			licenseKey: 'free-license',
			onFrame: async (videoFrame) => {
				const pixelData = await extractPixelData(videoFrame);
				framePixelData.push(pixelData);
				return videoFrame;
			},
		});

		expect(framePixelData).toHaveLength(2);
		expect(new Set(framePixelData[0]).size).toBeGreaterThan(10);
		expect(framesAreIdentical(framePixelData[0], framePixelData[1])).toBe(true);
	},
);
