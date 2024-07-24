import {
	Loop,
	OffthreadVideo,
	RemotionOffthreadVideoProps,
	useVideoConfig,
} from 'remotion';
import {
	CalculateEmojiSrc,
	Scale,
	defaultCalculateEmojiSrc,
} from './calculate-emoji-src';
import {emojis} from './emoji-data';
import type {EmojiName} from './get-available-emoji';
import {isWebkit} from './is-webkit';

export type AnimatedEmojiProps = Omit<RemotionOffthreadVideoProps, 'src'> & {
	emoji: EmojiName;
	scale?: Scale;
	calculateSrc?: CalculateEmojiSrc;
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
