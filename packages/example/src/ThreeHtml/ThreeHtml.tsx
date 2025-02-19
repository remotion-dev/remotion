import {Html} from '@react-three/drei';
import {ThreeCanvas} from '@remotion/three';
import React, {useRef} from 'react';
import {
	Internals,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Content = () => {
	return <h1>{useCurrentFrame()}</h1>;
};

const Box: React.FC<{
	readonly portalTarget: React.MutableRefObject<HTMLDivElement>;
}> = ({portalTarget}) => {
	const frame = useCurrentFrame();
	const rotation = interpolate(frame, [0, 1_000], [0, -5], {
		extrapolateRight: 'clamp',
		extrapolateLeft: 'clamp',
	});

	const contexts = Internals.useRemotionContexts();

	return (
		<group position={[0, 0.05, -0.75]} rotation={[0, rotation, 0]}>
			<mesh position={[0, 0.05, -0.7]}>
				<boxGeometry args={[2, 2, 0.1]} />
				<meshStandardMaterial color="#f00" />

				<Html transform portal={portalTarget}>
					<Internals.RemotionContextProvider contexts={contexts}>
						<Content />
					</Internals.RemotionContextProvider>
				</Html>
			</mesh>
		</group>
	);
};

export const ThreeHtml = () => {
	const portalRef = useRef<HTMLDivElement | null>(
		null,
	) as React.MutableRefObject<HTMLDivElement>;

	const {width, height} = useVideoConfig();

	return (
		<div style={{background: 'rgba(0, 0, 0, 0.5)'}}>
			<div ref={portalRef} data-portal />
			<ThreeCanvas
				camera={{position: [0, 2, 5], fov: 50}}
				width={width}
				height={height}
			>
				<pointLight position={[10, 10, 10]} />
				<Box portalTarget={portalRef} />
			</ThreeCanvas>
		</div>
	);
};
