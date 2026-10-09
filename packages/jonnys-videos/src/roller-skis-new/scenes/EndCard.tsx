import {Audio, Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
} from 'remotion';
import {fontFamily} from '../elements/font';

const EndCardInner: React.FC<InteractiveTransformProps> = ({style}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: 'black', fontFamily, ...style}}>
			<Sequence name="Last frame" freeze={3328} premountFor={fps}>
				<Video
					name="IMG_0475"
					src={
						'https://remotion.media/jonnys-videos/roller-skis/footage/IMG_0475.MOV'
					}
					muted
					premountFor={fps}
					objectFit="cover"
					style={{
						width: '100%',
						height: '100%',
						filter: 'blur(16px) brightness(0.45)',
						scale: interpolate(frame, [0, 120], [1.1, 1.18], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</Sequence>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Interactive.Div
					name="Next time"
					style={{
						color: 'white',
						fontSize: 64,
						fontWeight: 700,
						letterSpacing: 16,
						textTransform: 'uppercase',
						opacity: interpolate(frame, [4, 14], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						translate: interpolate(frame, [4, 18], ['0px 30px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					Next time:
				</Interactive.Div>
				<Interactive.Div
					name="Brakes"
					style={{
						position: 'relative',
						marginTop: 10,
						padding: '0px 48px',
						scale: interpolate(frame, [14, 28], [0.3, 1], {
							easing: Easing.spring({damping: 11}),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
						opacity: interpolate(frame, [14, 17], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						rotate: interpolate(frame, [14, 30], ['-8deg', '-2deg'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<Interactive.Div
						name="Marker"
						cropRight={interpolate(frame, [20, 32], [1, 0], {
							easing: Easing.bezier(0.65, 0, 0.35, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: '#dc2626',
							borderRadius: 24,
						}}
					/>
					<div
						style={{
							position: 'relative',
							color: 'white',
							fontSize: 260,
							fontWeight: 900,
							letterSpacing: -6,
							lineHeight: 1.05,
							textTransform: 'uppercase',
							textShadow: '0 12px 40px rgba(0,0,0,0.4)',
						}}
					>
						Brakes.
					</div>
				</Interactive.Div>
			</AbsoluteFill>
			<Audio
				name="Whoosh"
				src="https://remotion.media/whoosh.wav"
				from={12}
				volume={0.6}
				premountFor={fps}
			/>
		</AbsoluteFill>
	);
};

export const EndCard = Interactive.withSchema({
	Component: EndCardInner,
	componentName: '<EndCard>',
	schema: {},
	wrapInSequence: true,
});
