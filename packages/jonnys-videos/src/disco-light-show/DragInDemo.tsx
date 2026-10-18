import {Video} from '@remotion/media';
import React from 'react';
import {
	Easing,
	Interactive,
	interpolate,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {asset} from './assets';

const DragInDemoInner: React.FC = () => {
	const frame = useCurrentFrame();
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
				style={{
					position: 'absolute',
					width: 1664,
					height: 1040,
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[0, 15, 75, 102],
						[
							'-785.3px -64.78px',
							'-785.3px -64.78px',
							'-1415.3px -64.78px',
							'-1415.3px -64.78px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: 1.82,
				}}
				from={-2}
				durationInFrames={151}
				trimBefore={8}
				playbackRate={1.45}
			/>
		</>
	);
};

export const DragInDemo = Interactive.create({
	Component: DragInDemoInner,
	layout: 'absolute-fill',
});
