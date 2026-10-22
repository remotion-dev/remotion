import React from 'react';
import {CanvasImage, Interactive} from 'remotion';
import {asset} from './assets';

// Dark paper scan with a flat tone and subtle grain.
const DiscoBallBgInner: React.FC = () => {
	return (
		<CanvasImage
			name="Paper background"
			src={asset('paper-texture-dark-2566e6c4f4cc.jpg')}
			width={1080}
			height={1920}
			fit="cover"
			style={{position: 'absolute'}}
		/>
	);
};

export const DiscoBallBg = Interactive.create({
	Component: DiscoBallBgInner,
	layout: 'absolute-fill',
});
