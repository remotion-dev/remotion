import type {EmojiName} from '@remotion/animated-emoji';
import {AnimatedEmoji, getAvailableEmojis} from '@remotion/animated-emoji';
import React from 'react';
import {useVideoConfig} from 'remotion';
import styles from './emoji.module.css';

export const DisplayedEmoji: React.FC<{
	readonly emoji: EmojiName;
	readonly isNext: boolean;
	readonly isPrevious: boolean;
}> = ({emoji, isNext, isPrevious}) => {
	const partyDuration = getAvailableEmojis().find(
		(e) => e.name === emoji,
	).durationInSeconds;
	const {durationInFrames, fps} = useVideoConfig();

	const ratio = durationInFrames / fps / partyDuration;
	const closestInteger = Math.round(ratio);
	const closestRatio = closestInteger / ratio;

	return (
		<AnimatedEmoji
			style={{
				height: 100,
				position: 'absolute',
				transition: 'transform 0.2s ease-in, opacity 0.2s ease-in-out',
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
			className={isNext ? styles.next : isPrevious ? styles.prev : undefined}
		/>
	);
};
