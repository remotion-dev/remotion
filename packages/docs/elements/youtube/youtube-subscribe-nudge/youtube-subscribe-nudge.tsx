import {loadFont} from '@remotion/google-fonts/Inter';
import {Audio} from '@remotion/media';
import {ding, mouseClick} from '@remotion/sfx';
import React from 'react';
import {
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '600', '700', '800'],
});

export const YouTubeSubscribeNudge: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				height: 240,
				position: 'relative',
				width: 760,
			}}
		>
			<Audio
				durationInFrames={12}
				from={61}
				name="Subscribe click"
				src={mouseClick}
				trimBefore={3}
				volume={0.5}
			/>
			<Audio
				durationInFrames={39}
				from={81}
				name="Bell chime"
				playbackRate={1.1}
				src={ding}
				trimBefore={4}
				volume={0.3}
			/>
			<div
				style={{
					height: 240,
					opacity: interpolate(frame, [0, 16, 104, 119], [0, 1, 1, 0], {
						easing: [
							Easing.bezier(0.65, 0, 0.35, 1),
							Easing.linear,
							Easing.bezier(0.7, 0, 0.84, 0),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					position: 'relative',
					scale: interpolate(frame, [0, 24, 104, 119], [0.98, 1, 1, 0.97], {
						easing: [
							Easing.bezier(0.65, 0, 0.35, 1),
							Easing.linear,
							Easing.bezier(0.7, 0, 0.84, 0),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					transformOrigin: '50% 50%',
					translate: interpolate(
						frame,
						[0, 24, 104, 119],
						['0px 14px', '0px 0px', '0px 0px', '0px 20px'],
						{
							easing: [
								Easing.bezier(0.65, 0, 0.35, 1),
								Easing.linear,
								Easing.bezier(0.7, 0, 0.84, 0),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					width: 760,
				}}
			>
				<Interactive.Div
					name="Card"
					style={{
						alignItems: 'center',
						backgroundColor: '#15161a',
						border: '1px solid rgba(255, 255, 255, 0.09)',
						borderRadius: 26,
						boxShadow: '0 18px 40px rgba(0, 0, 0, 0.26)',
						boxSizing: 'border-box',
						display: 'flex',
						height: 144,
						left: 0,
						padding: '0 24px',
						position: 'absolute',
						top: 48,
						width: 760,
					}}
				>
					<CanvasImage
						fit="cover"
						height={88}
						name="Avatar"
						src="https://remotion.media/elements/social-endcard-remotion-logo.png"
						style={{
							backgroundColor: '#ffffff',
							border: '1px solid rgba(255, 255, 255, 0.12)',
							borderRadius: 999,
							boxSizing: 'border-box',
							display: 'block',
							flex: '0 0 auto',
							height: 88,
							marginRight: 18,
							width: 88,
						}}
						width={88}
					/>

					<div
						style={{
							flex: '1 1 auto',
							marginRight: 32,
							minWidth: 0,
						}}
					>
						<Interactive.Div
							name="Channel name"
							style={{
								color: '#ffffff',
								fontFamily: 'Inter',
								fontSize: 34,
								fontWeight: 800,
								lineHeight: 1.1,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							Remotion
						</Interactive.Div>
						<Interactive.Div
							name="Channel handle"
							style={{
								color: '#a9abb3',
								fontFamily: 'Inter',
								fontSize: 21,
								fontWeight: 600,
								lineHeight: 1.15,
								marginTop: 6,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							@remotion
						</Interactive.Div>
					</div>

					<div
						style={{
							flex: '0 0 auto',
							height: 62,
							marginRight: 16,
							position: 'relative',
							scale: interpolate(frame, [58, 61, 68], [1, 0.94, 1], {
								easing: [
									Easing.bezier(0.4, 0, 1, 1),
									Easing.spring({
										damping: 9,
										mass: 0.45,
										overshootClamping: false,
										stiffness: 180,
									}),
								],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
							width: 200,
						}}
					>
						<Interactive.Div
							name="Subscribe button"
							style={{
								alignItems: 'center',
								backgroundColor: '#ff1744',
								borderRadius: 14,
								color: '#ffffff',
								display: 'flex',
								fontFamily: 'Inter',
								fontSize: 26,
								fontWeight: 700,
								height: 62,
								justifyContent: 'center',
								left: 0,
								letterSpacing: -0.25,
								opacity: interpolate(frame, [63, 64], [1, 0], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								pointerEvents: frame < 64 ? 'auto' : 'none',
								position: 'absolute',
								top: 0,
								width: 200,
							}}
						>
							Subscribe
						</Interactive.Div>
						<Interactive.Div
							name="Subscribed button"
							style={{
								alignItems: 'center',
								backgroundColor: '#2a2b31',
								border: '1px solid rgba(255, 255, 255, 0.1)',
								borderRadius: 14,
								boxSizing: 'border-box',
								color: '#ffffff',
								display: 'flex',
								fontFamily: 'Inter',
								fontSize: 26,
								fontWeight: 700,
								gap: 10,
								height: 62,
								justifyContent: 'center',
								left: 0,
								letterSpacing: -0.25,
								opacity: interpolate(frame, [63, 64], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								}),
								pointerEvents: frame < 64 ? 'none' : 'auto',
								position: 'absolute',
								top: 0,
								width: 200,
							}}
						>
							<Interactive.Svg
								aria-hidden="true"
								height="26"
								name="Subscribed checkmark"
								style={{
									color: '#ffffff',
									flex: '0 0 auto',
									translate: '0px 1px',
								}}
								viewBox="0 0 24 24"
								width="26"
							>
								<path
									d="m4 12.5 5 4.8L20 7"
									fill="none"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="3"
								/>
							</Interactive.Svg>
							Subscribed
						</Interactive.Div>
					</div>

					<Interactive.Div
						name="Notification bell"
						style={{
							alignItems: 'center',
							backgroundColor: frame >= 81 ? '#303137' : '#24252b',
							border: '1px solid rgba(255, 255, 255, 0.12)',
							borderRadius: 999,
							boxSizing: 'border-box',
							display: 'flex',
							flex: '0 0 auto',
							height: 64,
							justifyContent: 'center',
							position: 'relative',
							scale: interpolate(frame, [78, 81, 93], [1, 0.9, 1], {
								easing: [
									Easing.bezier(0.4, 0, 1, 1),
									Easing.spring({
										damping: 7,
										mass: 0.55,
										overshootClamping: false,
										stiffness: 160,
									}),
								],
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
							}),
							transformOrigin: '50% 50%',
							width: 64,
						}}
					>
						<Interactive.Svg
							aria-hidden="true"
							height="36"
							name="Bell icon"
							style={{
								color: '#f4f4f5',
								overflow: 'visible',
								rotate: interpolate(
									frame,
									[81, 85, 89, 93, 97, 101],
									['0deg', '-18deg', '16deg', '-11deg', '7deg', '0deg'],
									{
										easing: Easing.inOut(Easing.cubic),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								transformOrigin: '50% 20%',
							}}
							viewBox="0 0 24 24"
							width="36"
						>
							{frame < 84 ? (
								<>
									<path
										d="M5.5 17h13c-1.7-1.9-2.2-3.9-2.2-7 0-2.8-1.7-5-4.3-5s-4.3 2.2-4.3 5c0 3.1-.5 5.1-2.2 7Z"
										fill="none"
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.8"
									/>
									<path
										d="M9.8 20c.5 1 1.2 1.5 2.2 1.5s1.7-.5 2.2-1.5"
										fill="none"
										stroke="currentColor"
										strokeLinecap="round"
										strokeWidth="1.8"
									/>
								</>
							) : (
								<path
									d="M19.395 1.196a1 1 0 0 0-.199 1.4A9 9 0 0 1 21 8a1 1 0 0 0 2 0 11 11 0 0 0-2.205-6.605 1 1 0 0 0-1.4-.199Zm-16.192.2A11 11 0 0 0 1 8a1 1 0 0 0 2 0 9 9 0 0 1 1.803-5.404 1 1 0 0 0-1.6-1.2ZM12 1a7 7 0 0 0-7 7v4.446a1 1 0 0 1-.144.515L3.05 15.972C2.25 17.305 3.21 19 4.766 19H8a4 4 0 1 0 8 0h3.233c1.555 0 2.515-1.695 1.715-3.029l-1.805-3.01a1 1 0 0 1-.143-.515V8a7 7 0 0 0-7-7Zm0 2a5 5 0 0 1 5 5v4.445a3 3 0 0 0 .428 1.545L19.233 17H4.766l1.806-3.01c.28-.466.428-1 .428-1.544V8a5 5 0 0 1 5-5Zm-2 16h4a2 2 0 0 1-4 0Z"
									fill="currentColor"
								/>
							)}
						</Interactive.Svg>
					</Interactive.Div>
				</Interactive.Div>

				<Interactive.Svg
					aria-hidden="true"
					height="54"
					name="Cursor"
					style={{
						filter: 'drop-shadow(0 4px 5px rgba(0, 0, 0, 0.26))',
						left: interpolate(frame, [40, 60, 66, 78], [690, 620, 620, 699], {
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.linear,
								Easing.bezier(0.65, 0, 0.35, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						opacity: interpolate(frame, [38, 43, 84, 91], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						position: 'absolute',
						top: interpolate(frame, [40, 60, 66, 78], [202, 124, 124, 117], {
							easing: [
								Easing.bezier(0.16, 1, 0.3, 1),
								Easing.linear,
								Easing.bezier(0.65, 0, 0.35, 1),
							],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
					viewBox="0 0 48 54"
					width="48"
				>
					<path
						d="M5 3 39 35l-16 2 9 13-8 5-9-14L5 50Z"
						fill="#ffffff"
						stroke="#111217"
						strokeLinejoin="round"
						strokeWidth="3"
					/>
				</Interactive.Svg>
			</div>
		</div>
	);
};
