import {interpolate} from 'remotion';
import {useVideoConfig} from 'remotion';
import {useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

export const ThreeDebug: React.FC = () => {
	const frame = useCurrentFrame();
	// Const {width, height} = useVideoConfig();
	const width = 800;
	const height = 600;
	return (
		<ThreeCanvas
			orthographic={false}
			width={width}
			height={height}
			style={{
				backgroundColor: 'white',
			}}
			camera={{fov: 75, position: [0, 0, 470]}}
		>
			<ambientLight intensity={0.15} />
			<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />
			<mesh
				position={[0, 0, 0]}
				rotation={[frame * 0.06 * 0.5, frame * 0.07 * 0.5, frame * 0.08 * 0.5]}
				scale={interpolate(Math.sin(frame / 10), [-1, 1], [0.8, 1.2])}
			>
				<boxGeometry args={[100, 100, 100]} />
				<meshStandardMaterial
					color={[
						Math.sin(frame * 0.12) * 0.5 + 0.5,
						Math.cos(frame * 0.11) * 0.5 + 0.5,
						Math.sin(frame * 0.08) * 0.5 + 0.5,
					]}
				/>
			</mesh>
		</ThreeCanvas>
	);
};
