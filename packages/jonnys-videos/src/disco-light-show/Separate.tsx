import {Video} from '@remotion/media';
import React from 'react';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

const SeparateInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Interactive.Div
				name="Foreground and background export crop"
				style={{
					width: 2300,
					height: 1070,
					overflow: 'hidden',
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[0, 12, 42, 141],
						['-660px 0px', '-660px 0px', '-1220px 0px', '-1220px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			>
				<Video
					name="Foreground and background export"
					src={asset('Screen Recording 2026-07-19 at 17.05.25.mov')}
					style={{
						position: 'absolute',
						width: 2702,
						height: 1546,
						translate: '-350px -160px',
					}}
					playbackRate={0.8}
				/>
			</Interactive.Div>
		</>
	);
};

export const Separate = Interactive.create({
	Component: SeparateInner,
	layout: 'absolute-fill',
});
