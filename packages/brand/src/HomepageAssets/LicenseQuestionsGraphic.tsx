import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const LicenseQuestionsGraphic: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			<Interactive.Div
				name="License questions graphic"
				style={{
					inset: 0,
					position: 'absolute',
					translate: '0px 216px',
				}}
			>
				<svg
					viewBox="0 0 1080 1080"
					style={{
						height: '100%',
						inset: 0,
						overflow: 'visible',
						position: 'absolute',
						width: '100%',
					}}
				>
					<defs>
						<clipPath id="license-line-reveal">
							<rect
								height="80"
								width={interpolate(
									frame,
									[55, 67, 132, 144],
									[0, 322, 322, 0],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								)}
								x="274"
								y="500"
							/>
						</clipPath>
					</defs>
					<g clipPath="url(#license-line-reveal)">
						<path
							d="M280 540H590"
							fill="none"
							stroke="black"
							strokeDasharray="28 28"
							strokeDashoffset={interpolate(frame, [55, 132], [0, -138], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})}
							strokeLinecap="round"
							strokeWidth="12"
						/>
					</g>
				</svg>
				<Interactive.Div
					name="Mehmet avatar"
					style={{
						height: 280,
						left: 590,
						opacity: interpolate(frame, [23, 24, 158, 168], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						scale: interpolate(frame, [24, 41], [0, 1], {
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
							output: 'perceptual-scale',
						}),
						top: 400,
						width: 280,
					}}
				>
					<Interactive.Div
						name="Mehmet portrait"
						style={{
							border: '12px solid black',
							borderRadius: '50%',
							boxSizing: 'border-box',
							height: '100%',
							overflow: 'hidden',
							position: 'absolute',
							width: '100%',
						}}
					>
						<Img
							name="Mehmet"
							src={staticFile('homepage-assets/mehmet.png')}
							style={{
								height: '100%',
								objectFit: 'cover',
								width: '100%',
							}}
						/>
					</Interactive.Div>
					<Interactive.Div
						name="Remotion badge"
						style={{
							alignItems: 'center',
							backgroundColor: 'white',
							borderRadius: '50%',
							boxShadow: '0 6px 18px rgba(0, 0, 0, 0.18)',
							display: 'flex',
							height: 92,
							justifyContent: 'center',
							position: 'absolute',
							right: -18,
							top: -18,
							width: 92,
							translate: '-13.9px 203.7px',
						}}
					>
						<Img
							name="Remotion favicon"
							src={staticFile('homepage-assets/remotion-favicon.png')}
							style={{height: 56, objectFit: 'contain', width: 56}}
						/>
					</Interactive.Div>
				</Interactive.Div>
				<Interactive.Div
					name="Phone"
					style={{
						alignItems: 'center',
						backgroundColor: '#0b84f3',
						border: '12px solid black',
						borderRadius: '50%',
						boxSizing: 'border-box',
						display: 'flex',
						height: 280,
						justifyContent: 'center',
						left: 0,
						position: 'absolute',
						rotate: interpolate(
							frame,
							[0, 3, 6, 9, 12, 15, 18, 21, 24],
							[
								'0deg',
								'-8deg',
								'8deg',
								'-7deg',
								'7deg',
								'-4deg',
								'4deg',
								'-2deg',
								'0deg',
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						top: 400,
						width: 280,
					}}
				>
					<svg
						aria-label="Phone"
						role="img"
						viewBox="0 0 512 512"
						style={{height: 150, overflow: 'visible', width: 150}}
					>
						{/* Font Awesome Pro v7.3.1 by @fontawesome — https://fontawesome.com/license (Commercial License), Copyright 2026 Fonticons, Inc. */}
						<path
							d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"
							fill="white"
						/>
					</svg>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};
