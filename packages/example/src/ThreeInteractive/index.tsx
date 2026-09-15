import {InteractiveThree, ThreeCanvas} from '@remotion/three';
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const ThreeInteractive: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	return (
		<ThreeCanvas
			width={width}
			height={height}
			style={{backgroundColor: '#f6f6f6'}}
			camera={{position: [0, 0, 6]}}
		>
			<ambientLight intensity={2} />
			<InteractiveThree.Group
				name="Editable 3D cube"
				positionX={interpolate(frame, [0, 90], [-1, 1])}
				positionY={0}
				positionZ={0}
				rotationX={0}
				rotationY={0}
				rotationZ={0}
				scaleX={1}
				scaleY={1}
				scaleZ={1}
			>
				<mesh>
					<boxGeometry args={[1.5, 1.5, 1.5]} />
					<meshStandardMaterial color="#4664e8" />
				</mesh>
			</InteractiveThree.Group>
		</ThreeCanvas>
	);
};
