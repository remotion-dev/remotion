import {AnimatedEmoji, getAvailableEmojis} from '@remotion/animated-emoji';
import type {EmojiName} from '@remotion/animated-emoji/src/get-available-emoji';
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

export const EmojiCard: React.FC<{
	emojiPosition: number;
}> = ({emojiPosition}) => {
	const {durationInFrames, fps} = useVideoConfig();

	const emoji: EmojiName = useMemo(() => {
		if (emojiPosition % 3 === 0) {
			return 'partying-face';
		}

		if (emojiPosition % 3 === 1) {
			return 'melting';
		}

		return 'fire';
	}, [emojiPosition]);

	const partyDuration = getAvailableEmojis().find(
		(e) => e.name === emoji,
	).durationInSeconds;

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
			<div
				style={{
					color: '#0b84f3',
					fontFamily: 'GT Planar',
					fontWeight: '500',
					fontSize: 13,
					textAlign: 'center',
					position: 'absolute',
					marginTop: -90,
				}}
			>
				Choose an emoji
			</div>
			<AnimatedEmoji
				style={{
					height: 100,
					position: 'absolute',
				}}
				emoji={emoji}
				scale="0.5"
				playbackRate={closestRatio}
				onError={(e) => {
					if (e.message.includes('PIPELINE_ERROR')) {
						return;
					}

					throw e;
				}}
			/>
		</AbsoluteFill>
	);
};
