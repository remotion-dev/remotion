import {dropShadow} from '@remotion/effects/drop-shadow';
import {noise} from '@remotion/effects/noise';
import {Video} from '@remotion/media';
import React from 'react';
import {interpolate, Sequence, Solid, useCurrentFrame} from 'remotion';
import {Skills2Announcement} from './Skills2Announcement/index';

export const Skills2Gesture: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Sequence>
			<Solid
				width={1920}
				height={1080}
				color={'#ffffff'}
				style={{
					position: 'absolute',
				}}
				effects={[
					noise({
						amount: 0,
					}),
				]}
			/>
			<Sequence
				name="Skills2Announcement"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[2, 5, 9, 12, 15, 36, 51, 61, 80, 96, 112, 123, 137, 155, 171],
						[
							'425.8px 386.6px',
							'409.3px 514px',
							'329px 746px',
							'359.9px 837.4px',
							'425.8px 851.5px',
							'425.8px 862.4px',
							'425.8px 864.2px',
							'425.8px 862.4px',
							'425.8px 861.1px',
							'425.8px 862.4px',
							'425.8px 853.8px',
							'425.8px 862.4px',
							'425.8px 853.8px',
							'425.8px 862.4px',
							'425.8px 852.1px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					rotate: interpolate(
						frame,
						[2, 5, 9, 12, 15],
						['14.4deg', '37.8deg', '43deg', '10.3deg', '-0.2deg'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(
						frame,
						[2, 5, 36, 51, 61, 80, 96, 112, 123, 155],
						[
							0.271,
							0.506,
							0.506,
							'0.52 0.51',
							0.506,
							'0.54 0.51',
							0.506,
							'0.54 0.51',
							0.506,
							0.506,
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
				}}
			>
				<Skills2Announcement title="/react-best-practices" />
			</Sequence>
			<Video
				src="https://remotion.media/skills-2-announcement/puppet-master-hand.mov"
				durationInFrames={456.46}
				from={0}
				style={{
					position: 'absolute',
					translate: '-320px -198.6px',
					width: 2560,
					height: 1440,
					scale: 0.7,
				}}
				effects={[dropShadow({})]}
			/>
		</Sequence>
	);
};
