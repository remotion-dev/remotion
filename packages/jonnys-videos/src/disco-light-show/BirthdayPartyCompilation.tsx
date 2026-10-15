import {Video} from '@remotion/media';
import React from 'react';
import {
	Interactive,
	Solid,
	interpolate,
	useCurrentFrame,
	Easing,
} from 'remotion';
import {asset} from './assets';
import {Clip1} from './Clip1';
import {Clip3} from './Clip3';
import {Clip4} from './Clip4';

const BirthdayPartyCompilationInner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Clip1
				name="Clip1"
				width={1080}
				height={1920}
				durationInFrames={45}
				style={{
					position: 'absolute',
				}}
				from={93}
			/>
			<Clip3
				name="Clip3"
				width={1080}
				height={1920}
				durationInFrames={57}
				style={{
					position: 'absolute',
				}}
				from={37}
			/>
			<Clip4
				name="Clip4"
				width={1080}
				height={1920}
				durationInFrames={21}
				style={{
					position: 'absolute',
				}}
				from={134}
			/>
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

export const BirthdayPartyCompilation = Interactive.create({
	Component: BirthdayPartyCompilationInner,
	layout: 'absolute-fill',
});
