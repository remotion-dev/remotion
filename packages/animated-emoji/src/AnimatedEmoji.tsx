import type {RemotionOffthreadVideoProps} from 'remotion';
import {Loop, OffthreadVideo, useVideoConfig} from 'remotion';
import type {CalculateEmojiSrc, Scale} from './calculate-emoji-src';
import {defaultCalculateEmojiSrc} from './calculate-emoji-src';
import {emojis} from './emoji-data';
import type {EmojiName} from './get-available-emoji';
import {isWebkit} from './is-webkit';

export type AnimatedEmojiProps = Omit<RemotionOffthreadVideoProps, 'src'> & {
	readonly emoji: EmojiName;
	readonly scale?: Scale;
	readonly calculateSrc?: CalculateEmojiSrc;
};

export const AnimatedEmoji = ({
	emoji,
	scale = '1',
	calculateSrc = defaultCalculateEmojiSrc,
	...props
}: AnimatedEmojiProps) => {
	const {fps} = useVideoConfig();

	const emojiData = emojis.find((e) => e.name === emoji);
	if (!emojiData) {
		throw new Error(
			`Emoji ${emoji} not found. Available emojis: ${emojis.map((e) => e.name).join(', ')}`,
		);
	}

	return (
		<Loop durationInFrames={Math.floor(emojiData.durationInSeconds * fps)}>
			<OffthreadVideo
				{...props}
				src={calculateSrc({emoji, scale, format: isWebkit() ? 'hevc' : 'webm'})}
			/>
		</Loop>
	);
};
