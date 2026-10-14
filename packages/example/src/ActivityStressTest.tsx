import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';

const SCENE_COUNT = 1000;
const SCENE_DURATION = 30;
const CALCULATION_ITERATIONS = 75000;

export const ACTIVITY_STRESS_TEST_DURATION = SCENE_COUNT * SCENE_DURATION;

const ExpensiveScene: React.FC<{readonly sceneIndex: number}> = ({
	sceneIndex,
}) => {
	const frame = useCurrentFrame();
	let seed = sceneIndex + 1;
	let energy = 0;

	// Deliberately do real render work before returning any scene markup.
	// Stable dormant frames must prevent renders, rather than memoize this work.
	for (let iteration = 0; iteration < CALCULATION_ITERATIONS; iteration++) {
		seed = Math.imul(seed ^ (seed >>> 13), 1664525) + 1013904223;
		const sample = (seed >>> 0) / 0xffffffff;
		energy +=
			Math.sin(sample * Math.PI * 2 + frame * 0.02) *
				Math.cos(iteration * 0.001 + sceneIndex * 0.07) +
			Math.sqrt(sample + 0.01);
	}

	const checksum = energy / CALCULATION_ITERATIONS;

	return (
		<div
			data-activity-stress-scene={sceneIndex}
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: `hsl(${(sceneIndex * 47) % 360}, 45%, 18%)`,
				color: 'white',
				fontFamily: 'monospace',
				padding: 80,
			}}
		>
			<h1 style={{fontSize: 72}}>
				Scene {sceneIndex + 1} / {SCENE_COUNT}
			</h1>
			<p style={{fontSize: 36}}>Local frame: {frame}</p>
			<Sequence
				name="Calculated checksum"
				durationInFrames={SCENE_DURATION}
				layout="none"
			>
				<p style={{fontSize: 28}}>Checksum: {checksum.toFixed(6)}</p>
				<Sequence
					name="Second half"
					from={15}
					durationInFrames={15}
					layout="none"
				>
					<p style={{fontSize: 28}}>Second half of this scene</p>
				</Sequence>
			</Sequence>
		</div>
	);
};

// Reuse identical scene elements even if Studio renders the composition root again.
const scenes = Array.from({length: SCENE_COUNT}, (_, sceneIndex) => (
	<Sequence
		key={sceneIndex}
		name={`Expensive scene ${sceneIndex + 1}`}
		from={sceneIndex * SCENE_DURATION}
		durationInFrames={SCENE_DURATION}
	>
		<ExpensiveScene sceneIndex={sceneIndex} />
	</Sequence>
));

export const ActivityStressTest: React.FC = () => <>{scenes}</>;
