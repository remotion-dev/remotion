import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ExtrudeDiv} from '../3DContext/Div3D';

export function ApplicationRenderButton() {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'flex-start',
				paddingTop: 840,
			}}
		>
			<ExtrudeDiv
				backFace={
					<div
						style={{
							backgroundColor: '#075cb0',
							border: '5px solid black',
							borderRadius: 30,
							height: '100%',
							width: '100%',
						}}
					/>
				}

				cornerRadius={30}
				depth={48}
				height={104}
				name="Render video button"
				rotationX={-0.14}
				rotationY={-0.08}
				rotationZ={0.01}
				translationX={-4}
				translationY={2}
				width={370}
			>
				<div
					style={{
						alignItems: 'center',
						backgroundColor: '#0b84f3',
						border: '5px solid black',
						borderRadius: 30,
						color: 'white',
						display: 'flex',
						fontFamily: 'GT Planar, sans-serif',
						fontSize: 40,
						fontWeight: 500,
						gap: 22,
						height: '100%',
						justifyContent: 'center',
						overflow: 'hidden',
						position: 'relative',
						width: '100%',
					}}
				>
					<div
						style={{
							background:
								'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.8) 50%, transparent 80%)',
							inset: 0,
							opacity: interpolate(
								useCurrentFrame() % 120,
								[0, 70, 84, 98, 119],
								[0, 0, 0.3, 0, 0],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							position: 'absolute',
							translate: `${interpolate(
								useCurrentFrame() % 120,
								[70, 98],
								[-370, 370],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							)}px 0px`,
						}}
					/>
					<svg height={44} viewBox="0 0 48 48" width={44}>
						<path
							d="M24 7v23m0 0 9-9m-9 9-9-9M10 39h28"
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={5}
						/>
					</svg>
					<span>Render video</span>
				</div>
			</ExtrudeDiv>
		</AbsoluteFill>
	);
}
