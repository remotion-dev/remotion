import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const TITLE = 'Remotion Best Practices';

const RemotionCube: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Svg
			name="Remotion cube"
			viewBox="0 0 22 28"
			style={{
				width: 66,
				height: 84,
				overflow: 'visible',
				opacity: interpolate(frame, [0, 12], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				}),
				scale: interpolate(frame, [0, 18], [0.82, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: Easing.spring({damping: 200}),
					output: 'perceptual-scale',
				}),
			}}
		>
			<Interactive.Path
				name="Cube outline"
				d="M11 1.5 20.25 7v14L11 26.5 1.75 21V7Z"
				fill="none"
				stroke="#2888dd"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
			/>
			<Interactive.Path
				name="Cube facets"
				d="M1.75 7 11 12.5 20.25 7M11 12.5v14M1.75 14 11 19.5 20.25 14"
				fill="none"
				stroke="#2888dd"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.8}
			/>
		</Interactive.Svg>
	);
};

export const Skills2Announcement: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#ffffff',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Interactive.Div
				name="Best practices title lockup"
				style={{
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					width: 1071,
					height: 102,
					opacity: interpolate(frame, [0, 10], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.16, 1, 0.3, 1),
					}),
				}}
			>
				<RemotionCube />
				<Interactive.Div
					name="Typed title"
					style={{
						position: 'relative',
						width: 927,
						height: 102,
						marginLeft: 36,
						overflow: 'hidden',
					}}
				>
					<Interactive.Div
						name="Title text"
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 927,
							height: 102,
							display: 'flex',
							alignItems: 'center',
							color: '#2888dd',
							fontFamily: 'Arial, Helvetica, sans-serif',
							fontSize: 88,
							fontWeight: 400,
							letterSpacing: -1.5,
							lineHeight: 1,
							whiteSpace: 'nowrap',
						}}
					>
						{TITLE}
					</Interactive.Div>
				</Interactive.Div>
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export default Skills2Announcement;
