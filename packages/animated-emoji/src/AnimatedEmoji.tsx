import type {LayoutAndStyle, RemotionOffthreadVideoProps} from 'remotion';
import {Loop, OffthreadVideo, useVideoConfig} from 'remotion';
import type {CalculateEmojiSrc, Scale} from './calculate-emoji-src';
import {defaultCalculateEmojiSrc} from './calculate-emoji-src';
import {emojis} from './emoji-data';
import type {EmojiName} from './get-available-emoji';
import {isWebkit} from './is-webkit';

export type AnimatedEmojiProps = Omit<
	RemotionOffthreadVideoProps,
	'src' | 'muted'
> & {
	readonly emoji: EmojiName;
	readonly scale?: Scale;
	readonly calculateSrc?: CalculateEmojiSrc;
} & LayoutAndStyle;

export const AnimatedEmoji = ({
	emoji,
	scale = '1',
	calculateSrc = defaultCalculateEmojiSrc,
	playbackRate = 1,
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
		<Loop
			layout="none"
			durationInFrames={Math.floor(
				(emojiData.durationInSeconds * fps) / playbackRate,
			)}
		>
			<OffthreadVideo
				{...props}
				muted
				transparent
				playbackRate={playbackRate}
				src={calculateSrc({emoji, scale, format: isWebkit() ? 'hevc' : 'webm'})}
			/>
		</Loop>
	);
};
