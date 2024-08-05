import {AnimatedEmoji, getAvailableEmojis} from '@remotion/animated-emoji';
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

export const EmojiCard: React.FC = () => {
	const partyDuration = getAvailableEmojis().find(
		(e) => e.name === 'partying-face',
	).durationInSeconds;
	const {durationInFrames, fps} = useVideoConfig();
	const ratio = durationInFrames / fps / partyDuration;
	const closestInteger = Math.round(ratio);
	const closestRatio = closestInteger / ratio;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<AnimatedEmoji
				style={{
					height: 100,
				}}
				emoji="partying-face"
				scale="0.5"
				playbackRate={closestRatio}
			/>
		</AbsoluteFill>
	);
};
