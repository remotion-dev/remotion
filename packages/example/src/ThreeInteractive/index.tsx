import {InteractiveThree, ThreeCanvas} from '@remotion/three';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const ThreeInteractive: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{backgroundColor: '#10141f'}}>
			<ThreeCanvas
				width={width}
				height={height}
				camera={{position: [0, 0, 7], fov: 38}}
			>
				<ambientLight intensity={1.2} />
				<directionalLight position={[4, 6, 5]} intensity={2.5} />
				<InteractiveThree.Group
					name="Square"
					positionX={interpolate(
						frame,
						[0, 4, 5, 7, 18, 88, 109, 119],
						[-0.8623, -1.879, -0.8728, 0.1701, 0.192, 0.449, -1.865, 1.2],
					)}
					positionZ={interpolate(
						frame,
						[0, 5, 7, 119],
						[-1.5457, -1.982, -2.2359, -1.5543],
					)}
					rotationZ={interpolate(frame, [0, 7, 119], [4.986, 25.785, 4.986])}
					scale={interpolate(
						frame,
						[0, 5, 44, 119],
						[1.039, 1.0806, 0.7396, 1.039],
						{
							outputType: 'scale',
						},
					)}
					rotationX={interpolate(frame, [0, 7, 119], [71.836, 59.654, 71.836])}
					rotationY={interpolate(frame, [0, 7, 119], [10.682, 22.719, 10.682])}
					positionY={interpolate(
						frame,
						[0, 5, 7, 119],
						[-0.3208, -0.2438, -0.4044, -0.3907],
					)}
				>
					<mesh>
						<boxGeometry args={[2.3, 2.3, 0.45]} />
						<meshStandardMaterial color="#5b7cff" roughness={0.28} />
					</mesh>
				</InteractiveThree.Group>
				<InteractiveThree.Group
					name="Circle"
					positionX={interpolate(
						frame,
						[0, 5, 7, 44, 119],
						[-2.6001, -2.7595, -2.6233, -2.5885, -2.6],
					)}
					positionY={interpolate(
						frame,
						[0, 5, 7, 44, 119],
						[1.0626, 0.7016, 0.7895, 0.8402, 1.0644],
					)}
					positionZ={interpolate(
						frame,
						[0, 5, 7, 44, 119],
						[-1.6826, -0.7916, -0.9319, -1.1379, -1.6875],
					)}
					scale={interpolate(frame, [0, 44, 119], [0.72, 0.893, 0.72], {
						outputType: 'scale',
					})}
					rotationZ={interpolate(
						frame,
						[0, 5, 44, 119],
						[-8.403, -12.414, -34.953, -8.403],
					)}
					rotationX={interpolate(
						frame,
						[0, 5, 119],
						[-61.768, -0.858, -61.768],
					)}
					rotationY={interpolate(
						frame,
						[0, 5, 44, 119],
						[78.547, 53.002, 136.467, 78.547],
					)}
				>
					<mesh>
						<sphereGeometry args={[1.2, 48, 32]} />
						<meshStandardMaterial color="#ff8b68" roughness={0.3} />
					</mesh>
				</InteractiveThree.Group>
				<InteractiveThree.Group
					name="Triangle"
					positionX={interpolate(frame, [0, 54, 119], [2.9976, 3.0988, 2.9976])}
					positionY={interpolate(
						frame,
						[0, 54, 119],
						[-0.8843, -0.6736, -0.8843],
					)}
					positionZ={interpolate(
						frame,
						[0, 54, 119],
						[-0.9253, -0.8976, -0.9253],
					)}
					rotationX={interpolate(frame, [0, 5, 119], [22.433, -3.714, 0])}
					rotationY={interpolate(
						frame,
						[0, 5, 119],
						[-15.322, 1.1679999999999993, -15.322],
					)}
					rotationZ={interpolate(frame, [0, 119], [-26.486, -26.486])}
					scale={interpolate(
						frame,
						[0, 5, 44, 119],
						[1.002, 0.5743, 0.756, 0.8],
						{
							outputType: 'scale',
						},
					)}
				>
					<mesh>
						<coneGeometry args={[1.35, 2.2, 3]} />
						<meshStandardMaterial color="#62d6a8" roughness={0.3} />
					</mesh>
				</InteractiveThree.Group>
			</ThreeCanvas>
		</AbsoluteFill>
	);
};
