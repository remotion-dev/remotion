import {
	OffthreadVideo,
	RemotionOffthreadVideoProps,
	staticFile,
} from 'remotion';
import {EmojiName} from './get-available-emojis';

export type Scale = '0.5' | '1' | '2';

export type AnimatedEmojiProps = Omit<RemotionOffthreadVideoProps, 'src'> & {
	emoji: EmojiName;
	scale: Scale;
};

export const AnimatedEmoji = ({emoji, scale, ...props}: AnimatedEmojiProps) => {
	return (
		<OffthreadVideo {...props} src={staticFile(`${emoji}-${scale}x.mp4`)} />
	);
};
