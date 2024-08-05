import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DisplayedEmoji} from './DisplayedEmoji';

export const EmojiCard: React.FC<{
	emojiPosition: number;
}> = ({emojiPosition}) => {
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
			<DisplayedEmoji
				isNext={emojiPosition % 3 === 0}
				isPrevious={emojiPosition % 3 === 1}
				emoji={'fire'}
			/>
			<DisplayedEmoji
				isNext={emojiPosition % 3 === 1}
				isPrevious={emojiPosition % 3 === 2}
				emoji={'partying-face'}
			/>
			<DisplayedEmoji
				isNext={emojiPosition % 3 === 2}
				isPrevious={emojiPosition % 3 === 0}
				emoji={'melting'}
			/>
		</AbsoluteFill>
	);
};
