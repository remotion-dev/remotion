import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, Solid, useVideoConfig} from 'remotion';
import {asset} from './assets';
import {RemotionSticker} from './RemotionSticker';

const DragInDemoInner: React.FC = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Solid
				name="Studio background"
				color="#1b1f23"
				width={1080}
				height={1920}
				style={{position: 'absolute'}}
			/>
			<Video
				name="Importing video layers"
				src={asset('Screen Recording 2026-07-19 at 18.16.56.mov')}
				cropTop={100 / 1040}
				style={{
					position: 'absolute',
					width: 1664,
					height: 1040,
					transformOrigin: '0% 0%',
					translate: '-313px 250px',
					scale: 0.94,
				}}
				from={-2}
				durationInFrames={151}
				trimBefore={8}
				playbackRate={1.45}
			/>
			<RemotionSticker
				name="Remotion logo sticker"
				from={(56 / 30) * fps}
				durationInFrames={(46 / 30) * fps}
			/>
		</>
	);
};

export const DragInDemo = Interactive.create({
	Component: DragInDemoInner,
	layout: 'absolute-fill',
});
