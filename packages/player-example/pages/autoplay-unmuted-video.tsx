import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const AutoplayUnmutedVideo: React.FC = () => {
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
			<h1>Autoplay video with blocked audio</h1>
			<p>
				Without interacting with the page, the Player attempts to autoplay with
				audio. If the browser blocks the AudioContext, the Player should log a
				warning, mute itself after one second, and continue playing the video.
			</p>
			<Player
				component={AutoplayUnmutedVideo}
				compositionWidth={1280}
				compositionHeight={720}
				controls
				durationInFrames={300}
				fps={30}
				autoPlay
				loop
				acknowledgeRemotionLicense
				style={{
					width: 640,
					maxWidth: '100%',
				}}
			/>
		</div>
	);
};

export default Page;
