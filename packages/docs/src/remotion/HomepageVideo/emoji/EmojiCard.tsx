import React from 'react';
import {AbsoluteFill} from 'remotion';
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

type EmojiCardProps = {};

export const EmojiCard: React.FC<EmojiCardProps> = () => {
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
					fontFamily: 'GTPlanar',
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
				}}
			>
				<div style={{width: '100%', position: 'absolute', left: 0}}>
					<DisplayedEmoji emoji={'melting'} />
				</div>
				<div style={{width: '100%', position: 'absolute', left: '100%'}}>
					<DisplayedEmoji emoji={'partying-face'} />
				</div>
				<div style={{width: '100%', position: 'absolute', left: '200%'}}>
					<DisplayedEmoji emoji={'fire'} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const EmojisDuringRendering: React.FC = () => {
	return (
		<>
			<EmptyDiv />
			<DisplayedEmoji emoji={'melting'} />
			<EmptyDiv />
		</>
	);
};
