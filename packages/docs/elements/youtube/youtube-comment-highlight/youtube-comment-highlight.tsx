import {loadFont} from '@remotion/google-fonts/Inter';
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
	weights: ['500', '600', '700'],
});

export const YouTubeCommentHighlight: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				height: 360,
				perspective: 1500,
				perspectiveOrigin: '50% 50%',
				position: 'relative',
				width: 1120,
			}}
		>
			<Interactive.Div
				name="Container"
				style={{
					alignContent: 'center',
					backfaceVisibility: 'hidden',
					backgroundColor: '#15161a',
					border: '1px solid rgba(255, 255, 255, 0.09)',
					borderRadius: 26,
					boxShadow: '0 18px 40px rgba(0, 0, 0, 0.26)',
					boxSizing: 'border-box',
					columnGap: 18,
					display: 'grid',
					gridTemplateColumns: '88px minmax(0, 1fr)',
					height: 300,
					left: 0,
					opacity: interpolate(frame, [0, 90, 164, 179], [0, 1, 1, 0], {
						easing: [
							Easing.linear,
							Easing.linear,
							Easing.bezier(0.7, 0, 0.84, 0),
						],
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					padding: '24px 28px',
					position: 'absolute',
					rotate: interpolate(
						frame,
						[0, 90, 180, 270],
						['y -10deg', 'y 5deg', 'y -5deg', 'y 5deg'],
						{
							easing: Easing.inOut(Easing.sin),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					top: 30,
					transformOrigin: '50% 50%',
					width: 1120,
				}}
			>
				<Interactive.Div
					name="Pinned label"
					style={{
						alignItems: 'center',
						color: '#a9abb3',
						display: 'flex',
						fontFamily: 'Inter',
						fontSize: 20,
						fontWeight: 600,
						gap: 8,
						gridColumn: 2,
						gridRow: 1,
						lineHeight: 1.2,
						marginBottom: 14,
					}}
				>
					<svg
						aria-hidden="true"
						height="22"
						style={{flex: '0 0 auto'}}
						viewBox="0 0 24 24"
						width="22"
					>
						<path
							d="M6 2h12v3h-2v6l3 3v2h-6v6l-1 2-1-2v-6H5v-2l3-3V5H6Z"
							fill="currentColor"
						/>
					</svg>
					Pinned by Remotion
				</Interactive.Div>

				<>
					<CanvasImage
						fit="cover"
						height={88}
						name="Author avatar"
						src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=176&h=176&q=80&fm=jpg"
						style={{
							backgroundColor: '#2a2b31',
							border: '1px solid rgba(255, 255, 255, 0.12)',
							borderRadius: 999,
							boxSizing: 'border-box',
							display: 'block',
							gridColumn: 1,
							gridRow: 2,
							height: 88,
							width: 88,
						}}
						width={88}
					/>

					<div
						style={{
							gridColumn: 2,
							gridRow: 2,
							minWidth: 0,
						}}
					>
						<div
							style={{
								alignItems: 'baseline',
								display: 'flex',
								gap: 12,
							}}
						>
							<Interactive.Span
								name="Author handle"
								style={{
									color: '#ffffff',
									fontFamily: 'Inter',
									fontSize: 26,
									fontWeight: 700,
									lineHeight: 1.1,
								}}
							>
								@alexrenders
							</Interactive.Span>
							<Interactive.Span
								name="Timestamp"
								style={{
									color: '#a9abb3',
									fontFamily: 'Inter',
									fontSize: 20,
									fontWeight: 600,
									lineHeight: 1.1,
								}}
							>
								2 days ago
							</Interactive.Span>
						</div>

						<Interactive.Div
							name="Comment"
							style={{
								color: '#f4f4f5',
								fontFamily: 'Inter',
								fontSize: 32,
								fontWeight: 500,
								letterSpacing: -0.35,
								lineHeight: 1.3,
								marginTop: 8,
								overflowWrap: 'anywhere',
							}}
						>
							This breakdown made the whole process click — would love to see
							how you plan the animation timing in a future video!
						</Interactive.Div>

						<div
							style={{
								alignItems: 'center',
								color: '#a9abb3',
								display: 'flex',
								fontFamily: 'Inter',
								fontSize: 20,
								fontWeight: 600,
								gap: 20,
								lineHeight: 1,
								marginTop: 14,
							}}
						>
							<div
								style={{
									alignItems: 'center',
									display: 'flex',
									gap: 7,
								}}
							>
								<svg
									aria-hidden="true"
									height="25"
									viewBox="0 0 24 24"
									width="25"
								>
									<path
										d="M7 10v11H4V10Zm2 11V10l4-7c1.4.2 2.2 1.5 1.8 2.8L14 9h4.5c1.3 0 2.3 1.2 2 2.5l-1.7 7A3.3 3.3 0 0 1 15.6 21Z"
										fill="none"
										stroke="currentColor"
										strokeLinejoin="round"
										strokeWidth="1.8"
									/>
								</svg>
								<Interactive.Span name="Like count">2.4K</Interactive.Span>
							</div>

							<svg
								aria-hidden="true"
								height="25"
								style={{rotate: '180deg'}}
								viewBox="0 0 24 24"
								width="25"
							>
								<path
									d="M7 10v11H4V10Zm2 11V10l4-7c1.4.2 2.2 1.5 1.8 2.8L14 9h4.5c1.3 0 2.3 1.2 2 2.5l-1.7 7A3.3 3.3 0 0 1 15.6 21Z"
									fill="none"
									stroke="currentColor"
									strokeLinejoin="round"
									strokeWidth="1.8"
								/>
							</svg>

							<span>Reply</span>

							<div
								style={{
									height: 34,
									marginLeft: 2,
									position: 'relative',
									width: 40,
								}}
							>
								<CanvasImage
									fit="cover"
									height={34}
									name="Creator mark"
									src="https://remotion.media/elements/social-endcard-remotion-logo.png"
									style={{
										backgroundColor: '#ffffff',
										borderRadius: 999,
										display: 'block',
										height: 34,
										width: 34,
									}}
									width={34}
								/>
								<div
									style={{
										alignItems: 'center',
										backgroundColor: '#ffffff',
										borderRadius: 999,
										bottom: -2,
										display: 'flex',
										height: 17,
										justifyContent: 'center',
										position: 'absolute',
										right: 0,
										width: 17,
									}}
								>
									<svg
										aria-hidden="true"
										height="12"
										viewBox="0 0 24 24"
										width="12"
									>
										<path
											d="M12 21S3 16.2 3 9.5C3 6.5 5.4 4 8.5 4c1.8 0 3.1.8 3.5 2 .4-1.2 1.7-2 3.5-2C18.6 4 21 6.5 21 9.5 21 16.2 12 21 12 21Z"
											fill="#ff1744"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</>
			</Interactive.Div>
		</div>
	);
};
