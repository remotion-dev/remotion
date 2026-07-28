import {dropShadow} from '@remotion/effects/drop-shadow';
import {noise} from '@remotion/effects/noise';
import {Video} from '@remotion/media';
import React from 'react';
import {Sequence, Solid, interpolate, useCurrentFrame} from 'remotion';
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
			<Sequence
				name="Remotion markup"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: '0px 0px',
					scale: 0.6072,
				}}
			>
				<Skills2Announcement title="/remotion-markup" />
			</Sequence>
			<Sequence
				name="Remotion maps"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: '0px 0px',
					scale: 0.6072,
				}}
			>
				<Skills2Announcement title="/remotion-maps" />
			</Sequence>
			<Sequence
				name="Remotion create 1"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: '0px 0px',
					scale: 0.6072,
				}}
			>
				<Skills2Announcement title="/remotion-create" />
			</Sequence>
			<Sequence
				name="Remotion create 2"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: '0px 0px',
					scale: 0.6072,
				}}
			>
				<Skills2Announcement title="/remotion-create" />
			</Sequence>
			<Sequence
				name="Remotion SaaS"
				width={1071}
				height={102}
				durationInFrames={180}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[
							2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
							20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
						],
						[
							'575.5px 565.7px',
							'580px 623.5px',
							'585.5px 695.5px',
							'587.8px 777.1px',
							'580.5px 839px',
							'572.9px 877.8px',
							'568.8px 973.6px',
							'569px 976.7px',
							'574.1px 974.2px',
							'576.6px 973.7px',
							'579.2px 977px',
							'582.8px 973.9px',
							'585.4px 976.8px',
							'597.6px 978.7px',
							'602.6px 977.7px',
							'611.6px 975.8px',
							'615.6px 977.3px',
							'621.6px 974.8px',
							'627.2px 974.8px',
							'631.7px 973.3px',
							'636px 974.8px',
							'640.5px 975px',
							'646.5px 976.3px',
							'648.2px 979.2px',
							'653.2px 978.8px',
							'657.4px 977.4px',
							'661.2px 977px',
							'664.7px 977px',
							'668.6px 972.7px',
							'668.1px 972.7px',
							'666.6px 972px',
							'667.3px 974.3px',
							'664.1px 973.4px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(frame, [2], [0.446], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					rotate: interpolate(
						frame,
						[
							2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 15, 16, 17, 18, 22, 23, 24,
							25, 26, 27, 28, 29, 34,
						],
						[
							'95.4deg',
							'95.4deg',
							'92.8deg',
							'91.4deg',
							'93deg',
							'95deg',
							'94.8deg',
							'93.7deg',
							'92.7deg',
							'93.6deg',
							'92.6deg',
							'91.5deg',
							'90.3deg',
							'89.6deg',
							'88.7deg',
							'87.5deg',
							'86.5deg',
							'85.4deg',
							'86.6deg',
							'85.3deg',
							'84.3deg',
							'83.3deg',
							'82.4deg',
							'82.7deg',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			>
				<Skills2Announcement title="/remotion-saas" />
			</Sequence>
		</Sequence>
	);
};
