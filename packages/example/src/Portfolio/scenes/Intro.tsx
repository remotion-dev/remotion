import {Audio} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {RiseText} from '../components/RiseText';
import {Typewriter} from '../components/Typewriter';
import {mono, sans, serif} from '../theme';

export const Intro: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0B0B0F',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Interactive.Div
				name="Title group"
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					scale: interpolate(frame, [0, 120], [0.96, 1.03], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Interactive.Div
					name="Eyebrow"
					style={{
						fontFamily: mono,
						fontSize: 26,
						fontWeight: 500,
						letterSpacing: '0.34em',
						color: '#F3EFE6',
						marginBottom: 44,
						opacity: interpolate(frame, [98, 112], [0.7, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Typewriter text="MOTION DESIGN PORTFOLIO — 2026" start={18} />
				</Interactive.Div>
				<div
					style={{
						position: 'relative',
						display: 'flex',
						alignItems: 'flex-end',
					}}
				>
					<RiseText
						text="Motion"
						start={14}
						stagger={3}
						duration={26}
						exitAt={104}
						style={{
							fontFamily: sans,
							fontWeight: 800,
							fontSize: 330,
							lineHeight: 0.78,
							letterSpacing: '-0.045em',
							color: '#F3EFE6',
							paddingRight: 10,
						}}
					/>
					<Interactive.Div
						name="Dot zoom"
						style={{
							width: 72,
							height: 72,
							marginBottom: 9,
							scale: interpolate(frame, [118, 146], [1, 64], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.7, 0, 0.84, 0),
								output: 'perceptual-scale',
							}),
						}}
					>
						<Interactive.Div
							name="Dot"
							style={{
								width: 72,
								height: 72,
								borderRadius: 36,
								backgroundColor: '#FF4A1C',
								transformOrigin: '50% 100%',
								translate: interpolate(
									frame,
									[40, 56, 64, 72],
									['0px -900px', '0px 0px', '0px -70px', '0px 0px'],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										easing: [
											Easing.in(Easing.quad),
											Easing.out(Easing.quad),
											Easing.in(Easing.quad),
										],
									},
								),
								scale: interpolate(
									frame,
									[48, 55, 57, 61, 64, 71, 73, 78],
									[
										'1 1',
										'0.8 1.24',
										'1.42 0.62',
										'0.88 1.14',
										'1 1',
										'0.94 1.06',
										'1.16 0.86',
										'1 1',
									],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</Interactive.Div>
					<Interactive.Div
						name="Baseline"
						style={{
							position: 'absolute',
							left: -90,
							right: -90,
							bottom: 0,
							height: 3,
							scale: interpolate(frame, [0, 26], ['0 1', '1 1'], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.16, 1, 0.3, 1),
							}),
						}}
					>
						<Interactive.Div
							name="Baseline retract"
							style={{
								width: '100%',
								height: '100%',
								backgroundColor: '#F3EFE6',
								transformOrigin: 'calc(100% - 126px) 50%',
								scale: interpolate(frame, [106, 122], ['1 1', '0 1'], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: Easing.bezier(0.7, 0, 0.84, 0),
								}),
							}}
						/>
					</Interactive.Div>
				</div>
				<Interactive.Div
					name="Subtitle"
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 66,
						color: '#F3EFE6',
						marginTop: 40,
						opacity: interpolate(frame, [56, 76, 98, 110], [0, 0.9, 0.9, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(
							frame,
							[56, 80, 98, 112],
							['0px 24px', '0px 0px', '0px 0px', '0px -18px'],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: [
									Easing.bezier(0.16, 1, 0.3, 1),
									Easing.linear,
									Easing.bezier(0.7, 0, 0.84, 0),
								],
							},
						),
					}}
				>
					selected work, written entirely in code
				</Interactive.Div>
			</Interactive.Div>
			<Audio
				name="Dot zoom whoosh"
				src="https://remotion.media/portfolio-reel/v1/sfx/whoosh.wav"
				from={128}
				volume={0.55}
			/>
		</AbsoluteFill>
	);
};
