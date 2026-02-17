import {Player} from '@remotion/player';
import React from 'react';
import {Html5Video, interpolate, Sequence, useCurrentFrame} from 'remotion';

const remapSpeed = ({
	frame,
	speed,
}: {
	frame: number;
	speed: (fr: number) => number;
}) => {
	let framesPassed = 0;

	for (let i = 0; i <= frame; i++) {
		framesPassed += speed(i);
	}

	return framesPassed;
};

const AcceleratedVideo: React.FC = () => {
	const frame = useCurrentFrame();

	const speedFunction = (f: number) =>
		Math.min(16, interpolate(f, [0, 500], [1, 5]));

	const remappedFrame = remapSpeed({
		frame,
		speed: speedFunction,
	});

	return (
		<Sequence from={frame}>
			<Html5Video
				trimBefore={Math.round(remappedFrame)}
				playbackRate={speedFunction(frame)}
				src="https://remotion.media/BigBuckBunny.mp4#disable"
			/>
		</Sequence>
	);
};

export const AcceleratedVideoExample: React.FC = () => {
	return (
		<Player
			component={AcceleratedVideo}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={1500}
			fps={30}
			controls
			style={{
				width: '100%',
			}}
		/>
	);
};
