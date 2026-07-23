import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const AutoplayMutedVideo: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Video
				objectFit="cover"
				src="https://remotion.media/video.mp4"
				style={{
					width: '100%',
					height: '100%',
				}}
			/>
		</AbsoluteFill>
	);
};

const Page: React.FC = () => {
	return (
		<div
			style={{
				fontFamily: 'sans-serif',
				margin: 40,
			}}
		>
			<h1>Autoplay muted video</h1>
			<Player
				component={AutoplayMutedVideo}
				compositionWidth={1280}
				compositionHeight={720}
				controls
				durationInFrames={300}
				fps={30}
				initiallyMuted
				autoPlay
				style={{
					width: 640,
					maxWidth: '100%',
				}}
			/>
		</div>
	);
};

export default Page;
