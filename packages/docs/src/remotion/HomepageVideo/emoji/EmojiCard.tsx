import React from 'react';
import {AbsoluteFill, getRemotionEnvironment} from 'remotion';
import {DisplayedEmoji} from './DisplayedEmoji';

export type EmojiPosition = {
	prev: 'melting' | 'partying-face' | 'fire';
	current: 'melting' | 'partying-face' | 'fire';
	next: 'melting' | 'partying-face' | 'fire';
	translation: number;
	translationStyle: string;
};

const EmptyDiv: React.FC = () => {
	return <div style={{width: '100%'}} />;
};

type EmojiCardProps = {
	readonly emojiPositions: EmojiPosition;
};

export const EmojiCard: React.FC<EmojiCardProps> = ({emojiPositions}) => {
	const {isRendering} = getRemotionEnvironment();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
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
			<div
				style={{
					position: 'absolute',
					width: '300%',
					display: 'flex',
					whiteSpace: 'nowrap',
					transition: emojiPositions.translationStyle,
					transform: `translateX(${-emojiPositions.translation}%)`,
				}}
			>
				{isRendering ? (
					<EmptyDiv />
				) : (
					<DisplayedEmoji emoji={emojiPositions.prev} />
				)}
				<DisplayedEmoji emoji={emojiPositions.current} />
				{isRendering ? (
					<EmptyDiv />
				) : (
					<DisplayedEmoji emoji={emojiPositions.next} />
				)}
			</div>
		</AbsoluteFill>
	);
};
