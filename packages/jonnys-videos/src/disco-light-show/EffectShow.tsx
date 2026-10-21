import {Video} from '@remotion/media';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

const EffectShowInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Interactive.Div
				name="Text behind video preview crop"
				style={{
					width: 1920,
					height: 1080,
					overflow: 'hidden',
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[18, 55, 100, 140, 162, 175],
						[
							'-510px 0px',
							'-510px 0px',
							'-620px 0px',
							'-285px 0px',
							'-480px 0px',
							'-480px 0px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: 1.05,
				}}
			>
				<Video
					name="Text behind video preview"
					src={asset('TextBehindVideoSeries.mp4')}
					style={{width: 1920, height: 1080}}
					muted
					trimBefore={151}
				/>
			</Interactive.Div>
		</>
	);
};

export const EffectShow = Interactive.create({
	Component: EffectShowInner,
	layout: 'absolute-fill',
});
