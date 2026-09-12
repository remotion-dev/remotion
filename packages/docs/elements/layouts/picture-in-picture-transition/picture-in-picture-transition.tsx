import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const PictureInPictureTransition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<Interactive.Div
				name="Scene B"
				style={{
					alignItems: 'center',
					color: '#ffffff',
					display: 'flex',
					fontFamily: 'sans-serif',
					fontSize: 240,
					fontWeight: 900,
					inset: 0,
					justifyContent: 'center',
					position: 'absolute',
					textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
				}}
			>
				<Img
					alt=""
					name="Scene B background"
					src="https://remotion.media/transition-bg-pink.jpg"
					style={{
						height: '100%',
						objectFit: 'cover',
						position: 'absolute',
						width: '100%',
					}}
				/>
				<div style={{position: 'relative'}}>B</div>
			</Interactive.Div>

			<Interactive.Div
				cropBottom={interpolate(frame, [15, 50], [0, 0.06], {
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
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				cropLeft={interpolate(frame, [15, 50], [0, 0.302], {
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
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				cropRight={interpolate(frame, [15, 50], [0, 0.302], {
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
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				cropTop={interpolate(frame, [15, 50], [0, 0.06], {
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
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				})}
				name="Scene A"
				style={{
					alignItems: 'center',
					borderRadius: interpolate(frame, [15, 50], [0, 48], {
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
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					color: '#ffffff',
					display: 'flex',
					fontFamily: 'sans-serif',
					fontSize: 240,
					fontWeight: 900,
					height: '100%',
					justifyContent: 'center',
					overflow: 'hidden',
					position: 'absolute',
					scale: interpolate(frame, [15, 50], [1, 0.38], {
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
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
					transformOrigin: 'top left',
					translate: interpolate(frame, [15, 50], ['0px 0px', '1363px 23px'], {
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
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					width: '100%',
					willChange: 'transform',
				}}
			>
				<Img
					alt=""
					name="Scene A background"
					src="https://remotion.media/transition-bg-blue.jpg"
					style={{
						height: '100%',
						objectFit: 'cover',
						position: 'absolute',
						width: '100%',
					}}
				/>
				<div style={{position: 'relative'}}>A</div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
