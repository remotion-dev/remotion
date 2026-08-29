import {burlap} from '@remotion/effects/burlap';
import {tint} from '@remotion/effects/tint';
import {Video} from '@remotion/media';
import React from 'react';
import {
	getStaticFiles,
	interpolate,
	Sequence,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {Skills2Announcement} from './Skills2Announcement';

export const Skills2TableBang: React.FC = () => {
	const frame = useCurrentFrame();
	const localFluidHand = getStaticFiles().find(
		(file) =>
			file.name ===
			'fluid-hand-morphing-and-dissolving-animation-2026-02-18-11-59-25-utc.mov',
	);

	return (
		<>
			<Solid
				width={1344}
				height={1126}
				color={'#f5fafb'}
				style={{
					position: 'absolute',
				}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Sequence
				name="Remotion SaaS label"
				width={1071}
				height={102}
				from={5}
				durationInFrames={5}
				trimBefore={18}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[
							5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
							29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
							45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
							61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
							77,
						],
						[
							'120.2px -33.2px',
							'144.2px 476px',
							'144.2px 448.2px',
							'144.2px 432.7px',
							'144.2px 417.2px',
							'144.2px 401.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'96.5px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 429.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 418.3px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 429.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 418.3px',
							'144.2px 402.8px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: interpolate(frame, [7, 12], [0.35, 1.11], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Skills2Announcement title="/remotion-saas" />
			</Sequence>
			<Video
				src={
					localFluidHand?.src ??
					'https://remotion.media/skills-2-announcement/fluid-hand-morphing-and-dissolving-animation-2026-02-18-11-59-25-utc.mov'
				}
				durationInFrames={456.46}
				from={0}
				style={{
					position: 'absolute',
					translate: '-647px -444px',
					width: 2560,
					height: 1440,
					scale: 1.031,
				}}
				muted
				effects={[
					tint({
						color: '#1ec8ff',
						amount: 0.06,
					}),
				]}
			/>
			<Sequence
				name="Remotion SaaS label"
				width={1071}
				height={102}
				from={10}
				durationInFrames={68}
				trimBefore={23}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[
							5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
							29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
							45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
							61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
							77,
						],
						[
							'120.2px -33.2px',
							'144.2px 476px',
							'144.2px 448.2px',
							'144.2px 432.7px',
							'144.2px 417.2px',
							'144.2px 401.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 430.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 417.2px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 429.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 418.3px',
							'144.2px 402.8px',
							'144.2px 394.6px',
							'144.2px 398.7px',
							'144.2px 413.1px',
							'144.2px 429.6px',
							'144.2px 444px',
							'144.2px 450.2px',
							'144.2px 446.1px',
							'144.2px 433.7px',
							'144.2px 418.3px',
							'144.2px 402.8px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					scale: interpolate(frame, [7, 12], [0.35, 1.11], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Skills2Announcement title="/remotion-saas" />
			</Sequence>
		</>
	);
};
