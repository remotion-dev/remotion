import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const DIVIDER_WIDTH = 15;

export const SlideToSplitScreen: React.FC = () => {
	const frame = useCurrentFrame();
	const {height, width} = useVideoConfig();
	const bPanelWidth = width * 0.4;
	const aPanelWidth = width - bPanelWidth - DIVIDER_WIDTH;
	const aShift = (width - aPanelWidth) / 2;
	const splitProgress = interpolate(frame, [20, 52, 98, 130], [0, 1, 1, 0], {
		easing: [
			Easing.bezier(0.65, 0, 0.35, 1),
			Easing.linear,
			Easing.bezier(0.65, 0, 0.35, 1),
		],
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					height,
					overflow: 'hidden',
					position: 'absolute',
					width: interpolate(splitProgress, [0, 1], [width, aPanelWidth]),
				}}
			>
				<Interactive.Div
					name="Scene A"
					style={{
						alignItems: 'center',
						color: '#ffffff',
						display: 'flex',
						fontFamily: 'sans-serif',
						fontSize: 240,
						fontWeight: 900,
						height,
						justifyContent: 'center',
						position: 'absolute',
						textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
						translate: `${-aShift * splitProgress}px 0px`,
						width,
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
			</div>

			<div
				style={{
					display: 'flex',
					height,
					position: 'absolute',
					right: 0,
					translate: `${(1 - splitProgress) * (bPanelWidth + DIVIDER_WIDTH)}px 0px`,
					width: bPanelWidth + DIVIDER_WIDTH,
					willChange: 'transform',
				}}
			>
				<Interactive.Div
					name="Divider"
					style={{
						backgroundColor: '#ffffff',
						flex: `0 0 ${DIVIDER_WIDTH}px`,
						height: '100%',
					}}
				/>
				<Interactive.Div
					name="Scene B"
					style={{
						alignItems: 'center',
						color: '#ffffff',
						display: 'flex',
						fontFamily: 'sans-serif',
						fontSize: 240,
						fontWeight: 900,
						height,
						justifyContent: 'center',
						position: 'relative',
						textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
						width: bPanelWidth,
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
			</div>
		</AbsoluteFill>
	);
};
