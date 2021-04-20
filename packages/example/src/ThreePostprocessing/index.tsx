import React from 'react';
import { useCurrentFrame } from 'remotion';
import { RemotionThreeCanvas, SwirlEffect, ThreeVideo } from '@remotion/three';
import { EffectComposer, Vignette, Scanline } from '@react-three/postprocessing';

const videoSrc = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ThreePostprocessing = (): React.ReactElement => {
	const frame = useCurrentFrame();
	const [enableEffects, setEnableEffects] = React.useState(true); // eslint-disable-line @typescript-eslint/no-unused-vars
	return (
		<div
			style={{ display: 'flex', width: '100%' }}
			// onClick={() => setEnableEffects(x => !x)}
		>
			<RemotionThreeCanvas
				orthographic={false}
				camera={{ fov: 75, position: [0, 0, 470] }}
			>
				<ambientLight intensity={0.15} />
				<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />

				<ThreeVideo ignoreDepth fullViewport src={videoSrc} startFrom={460} />

				<mesh
					position={[-300, -200, 0]}
					rotation={[frame * 0.06 * 0.5, frame * 0.07 * 0.5, frame * 0.08 * 0.5]}
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

				<mesh
					position={[300, -200, 0]}
					rotation={[frame * 0.06 * 0.5, frame * 0.07 * 0.5, frame * 0.08 * 0.5]}
				>
					<cylinderGeometry args={[50, 50, 180, 24]} />
					<meshStandardMaterial color='red' />
				</mesh>

				{enableEffects && (
					<EffectComposer
						multisampling={0} // TODO: Remove with three.js v128
					>
						{/* <Bloom
							kernelSize={4}
							intensity={1.1}
							luminanceSmoothing={0.04}
							luminanceThreshold={0.7}
						/> */}
						{/* <DotScreen scale={0.5} /> */}
						{/* <Sepia intensity={1} /> */}
						<SwirlEffect
							radius={400}
							offset={[
								Math.sin(frame * 0.1) * 200,
								Math.cos(frame * 0.1) * 200
							]}
							angle={Math.cos(frame * 0.013) * 0.6}
						/>
						<Scanline density={0.9} opacity={0.2} />
						<Vignette darkness={0.55} />
					</EffectComposer>
				)}
			</RemotionThreeCanvas>
		</div>
	);
};

export default ThreePostprocessing;
