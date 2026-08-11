import {loadFont} from '@remotion/google-fonts/Inter';
import React from 'react';
import {
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['500', '700'],
});

export const NameLowerThird: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const accentOpacity = interpolate(frame, [0, 8, 110, 119], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const panelProgress =
		frame < 60
			? spring({
					frame: Math.max(0, frame - 8),
					fps,
					durationInFrames: 18,
					config: {
						damping: 16,
						mass: 0.8,
						stiffness: 180,
					},
				})
			: interpolate(frame, [102, 110], [1, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
	const visiblePanelProgress = Math.min(1, Math.max(0, panelProgress));

	return (
		<Interactive.Div
			name="Container"
			style={{
				display: 'flex',
				alignItems: 'stretch',
				gap: 0,
				width: 534,
				height: 132,
				boxSizing: 'border-box',
				fontFamily: 'Inter',
			}}
		>
			<Interactive.Div
				name="Accent block"
				style={{
					width: 64,
					height: 132,
					boxSizing: 'border-box',
					backgroundColor: '#2563eb',
					opacity: accentOpacity,
				}}
			/>

			<Interactive.Div
				name="Text panel"
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 8,
					width: 470,
					height: 132,
					minWidth: 0,
					boxSizing: 'border-box',
					padding: '16px 22px',
					overflow: 'hidden',
					backgroundColor: 'rgba(250, 250, 249, 0.97)',
					borderWidth: 1,
					borderStyle: 'solid',
					borderColor: 'rgba(24, 24, 27, 0.1)',
					clipPath: `inset(0 ${(1 - visiblePanelProgress) * 100}% 0 0)`,
				}}
			>
				<Interactive.Div
					name="Name"
					style={{
						width: '100%',
						minWidth: 0,
						overflow: 'hidden',
						color: '#18181b',
						fontSize: 46,
						fontWeight: 700,
						letterSpacing: -1,
						lineHeight: 1.1,
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						translate: `${-24 * (1 - panelProgress)}px 0px`,
					}}
				>
					Alex Morgan
				</Interactive.Div>
				<Interactive.Div
					name="Title"
					style={{
						width: '100%',
						minWidth: 0,
						overflow: 'hidden',
						color: '#52525b',
						fontSize: 27,
						fontWeight: 500,
						lineHeight: 1.15,
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						translate: `${-24 * (1 - panelProgress)}px 0px`,
					}}
				>
					Creative Developer
				</Interactive.Div>
			</Interactive.Div>
		</Interactive.Div>
	);
};
