import {brightness} from '@remotion/effects/brightness';
import {hue} from '@remotion/effects/hue';
import {Audio, Video} from '@remotion/media';
import {Star, Arrow} from '@remotion/shapes';
import {visualControl} from '@remotion/studio';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill, staticFile, Img} from 'remotion';

const NewSticker: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: visualControl('color', '#fff9bd', zColor()),
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			<Star
				points={20}
				innerRadius={174}
				outerRadius={207}
				fill={'#f2be0a'}
				cornerRadius={33}
				effects={[
					hue({
						degrees: 74,
					}),
				]}
				style={{
					translate: '-0.2px 0px',
					scale: 2.239685,
				}}
			/>
			<Arrow
				length={300}
				headWidth={185}
				headLength={120}
				shaftWidth={80}
				direction="right"
				cornerRadius={0}
				fill="#0b84ff"
				style={{
					position: 'absolute',
					translate: '240.6px 276.1px',
				}}
			/>
			<Audio src="https://remotion.media/yippee.wav" />
			<Video
				src={staticFile('star-radius.mp4')}
				style={{
					position: 'absolute',
					scale: 0.101023,
					translate: '-0.7px 73.9px',
				}}
			/>
			<Video
				src={staticFile('canvas-capture-cursor.mov')}
				style={{
					position: 'absolute',
				}}
			/>
		</AbsoluteFill>
	);
};

export default NewSticker;
