import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {RiseText} from '../components/RiseText';
import {BEAT, colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const sinceBeat = (frame - 15) % BEAT;
	const pulse =
		frame >= 90 ? interpolate(sinceBeat, [0, 3, 12], [1, 1.16, 1], clamp) : 1;

	return (
		<AbsoluteFill style={{backgroundColor: '#0B0B0F'}}>
			<Interactive.Div
				name="Sign-off"
				style={{
					position: 'absolute',
					inset: 0,
					opacity: interpolate(frame, [180, 194], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 140,
						top: 130,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
					}}
				>
					<RiseText
						name="Let’s make"
						text="Let’s make"
						start={16}
						stagger={2}
						style={{
							fontFamily: sans,
							fontWeight: 800,
							fontSize: 236,
							lineHeight: 0.78,
							letterSpacing: '-0.05em',
							color: colors.paper,
							paddingTop: 16,
						}}
					/>
					<RiseText
						name="something"
						text="something"
						start={24}
						stagger={2}
						style={{
							fontFamily: serif,
							fontStyle: 'italic',
							fontSize: 272,
							lineHeight: 0.92,
							color: colors.accent,
							paddingRight: 24,
							paddingBottom: '0.16em',
							marginTop: 4,
							marginBottom: '-0.16em',
						}}
					/>
					<div style={{display: 'flex', alignItems: 'flex-end'}}>
						<RiseText
							name="move"
							text="move"
							start={34}
							stagger={3}
							style={{
								fontFamily: sans,
								fontWeight: 800,
								fontSize: 236,
								lineHeight: 0.78,
								letterSpacing: '-0.05em',
								color: colors.paper,
								paddingTop: 16,
							}}
						/>
						<Interactive.Div
							name="Dot"
							style={{
								width: 54,
								height: 54,
								marginLeft: 10,
								marginBottom: 6,
								transformOrigin: '50% 100%',
								translate: interpolate(
									frame,
									[48, 62, 69, 76],
									['0px -520px', '0px 0px', '0px -52px', '0px 0px'],
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
									[54, 61, 63, 67, 69, 75, 77, 82],
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
								opacity: interpolate(frame, [48, 49], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: '50%',
									backgroundColor: colors.accent,
									scale: pulse,
								}}
							/>
						</Interactive.Div>
					</div>
				</div>
				<Interactive.Div
					name="Rule"
					style={{
						position: 'absolute',
						left: 1140,
						right: 140,
						top: 728,
						height: 2,
						backgroundColor: '#F3EFE6',
						opacity: 0.3,
						transformOrigin: '0% 50%',
						scale: interpolate(frame, [66, 96], ['0 1', '1 1'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.16, 1, 0.3, 1),
						}),
					}}
				/>
				<Interactive.Div
					name="Credits"
					style={{
						position: 'absolute',
						left: 1140,
						top: 766,
						width: 640,
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
						opacity: interpolate(frame, [74, 92], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(frame, [74, 96], ['0px 26px', '0px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.16, 1, 0.3, 1),
						}),
					}}
				>
					<div
						style={{
							fontFamily: mono,
							fontSize: 22,
							fontWeight: 500,
							letterSpacing: '0.2em',
							color: colors.accent,
						}}
					>
						THANK YOU FOR WATCHING
					</div>
					<div
						style={{
							fontFamily: sans,
							fontWeight: 700,
							fontSize: 54,
							letterSpacing: '-0.03em',
							lineHeight: 1.05,
							color: colors.paper,
						}}
					>
						Every frame here is code.
					</div>
					<div
						style={{
							fontFamily: mono,
							fontSize: 19,
							letterSpacing: '0.06em',
							lineHeight: 1.6,
							color: colors.paper,
							opacity: 0.55,
						}}
					>
						React + Remotion · 1920×1080 · 30 fps · 120 BPM
					</div>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
