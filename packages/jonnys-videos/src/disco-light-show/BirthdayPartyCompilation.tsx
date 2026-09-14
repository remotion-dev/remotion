import {Video} from '@remotion/media';
import React from 'react';
import {Sequence, Solid, interpolate, useCurrentFrame, Easing} from 'remotion';
import {asset} from './assets';
import {Clip1} from './Clip1';
import {Clip3} from './Clip3';
import {Clip4} from './Clip4';

export const BirthdayPartyCompilation: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Sequence
				name="Clip1"
				width={1080}
				height={1920}
				durationInFrames={45}
				style={{
					position: 'absolute',
				}}
				from={93}
				premountFor={30}
			>
				<Clip1 />
			</Sequence>
			<Sequence
				name="Clip3"
				width={1080}
				height={1920}
				durationInFrames={57}
				style={{
					position: 'absolute',
				}}
				from={37}
				premountFor={30}
			>
				<Clip3 />
			</Sequence>
			<Sequence
				name="Clip4"
				width={1080}
				height={1920}
				durationInFrames={21}
				style={{
					position: 'absolute',
				}}
				from={134}
				premountFor={30}
			>
				<Clip4 />
			</Sequence>
			<Video
				src={asset('Setup.mp4')}
				style={{
					position: 'absolute',
					width: 1080,
					height: 1920,
				}}
				from={4}
				durationInFrames={33}
				trimBefore={11}
				premountFor={30}
				muted
			/>
			<Solid
				width={1080}
				height={1920}
				color={'#ffffff'}
				style={{
					position: 'absolute',
					opacity: interpolate(
						frame,
						[0, 4, 8, 148, 155, 162],
						[0, 1, 0, 0, 1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.linear,
								Easing.bezier(0, 0, 0.58, 1),
								Easing.linear,
								Easing.linear,
								Easing.linear,
							],
						},
					),
				}}
			/>
		</>
	);
};
