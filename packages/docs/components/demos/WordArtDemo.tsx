import {
	BlueWaveWordArt,
	ChromeWordArt,
	OrangeWordArt,
	RainbowWordArt,
	type WordArtProps,
} from '@remotion/wordart';
import React from 'react';
import {AbsoluteFill} from 'remotion';

type WordArtDemoProps = {
	readonly text: string;
	readonly depth: number;
	readonly distortion: number;
};

const WordArtDemo: React.FC<
	WordArtDemoProps & {readonly component: React.FC<WordArtProps>}
> = ({component: Component, text, depth, distortion}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<Component
				width={1000}
				height={360}
				depth={depth}
				distortion={distortion}
			>
				{text}
			</Component>
		</AbsoluteFill>
	);
};

export const RainbowWordArtDemo: React.FC<WordArtDemoProps> = (props) => {
	return <WordArtDemo {...props} component={RainbowWordArt} />;
};

export const OrangeWordArtDemo: React.FC<WordArtDemoProps> = (props) => {
	return <WordArtDemo {...props} component={OrangeWordArt} />;
};

export const BlueWaveWordArtDemo: React.FC<WordArtDemoProps> = (props) => {
	return <WordArtDemo {...props} component={BlueWaveWordArt} />;
};

export const ChromeWordArtDemo: React.FC<WordArtDemoProps> = (props) => {
	return <WordArtDemo {...props} component={ChromeWordArt} />;
};
