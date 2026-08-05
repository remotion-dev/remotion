import {burlap} from '@remotion/effects/burlap';
import {tint} from '@remotion/effects/tint';
import {Video} from '@remotion/media';
import React from 'react';
import {
	Easing,
	getStaticFiles,
	interpolate,
	Sequence,
	Solid,
	useCurrentFrame,
} from 'remotion';
import {Skills2Announcement} from './Skills2Announcement';

export const Skills2TableBangComp: React.FC = () => {
	const frame = useCurrentFrame();
	const localGrittyFist = getStaticFiles().find(
		(file) =>
			file.name ===
			'gritty-fist-punch-with-impact-animation-2026-02-18-04-46-33-utc.mov',
	);

	return (
		<>
			<Solid
				width={1344}
				height={1700}
				color={'#f5fafb'}
				style={{position: 'absolute'}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Sequence
				name="Remotion Interactivity label"
				width={1071}
				height={102}
				durationInFrames={84}
				style={{
					position: 'absolute',
					scale: interpolate(frame, [28, 49], [0.382, 0.96], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
						posterize: 3,
					}),
					translate: interpolate(
						frame,
						[28, 49],
						['178.1px 1095.2px', '137.9px 430.5px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
							posterize: 3,
						},
					),
					rotate: interpolate(frame, [28, 63], ['-194deg', '-0.3deg'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 8,
								mass: 0.69,
								stiffness: 112,
								allowTail: true,
								durationRestThreshold: 0.075,
								overshootClamping: false,
							}),
						],
						posterize: 3,
					}),
				}}
				from={27}
				trimBefore={27}
			>
				<Skills2Announcement title="/remotion-interactivity" />
			</Sequence>
			<Video
				src={
					localGrittyFist?.src ??
					'https://remotion.media/skills-2-announcement/gritty-fist-punch-with-impact-animation-2026-02-18-04-46-33-utc.mov'
				}
				durationInFrames={214}
				from={-104}
				style={{
					position: 'absolute',
					translate: '-608px 260px',
					width: 2560,
					height: 1440,
				}}
				effects={[
					tint({
						color: '#1ec8ff',
						amount: 0.06,
					}),
				]}
			/>
		</>
	);
};
