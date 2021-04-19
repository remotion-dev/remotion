/// <reference types="@react-three/fiber" />

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { RemotionThreeCanvas, SwirlEffect, ThreeVideo } from '@remotion/three';
import { EffectComposer, Vignette, Bloom, DotScreen, Scanline } from '@react-three/postprocessing';

const videoSrc = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ThreeBasic = (): React.ReactElement => {
	const frame = useCurrentFrame();
	const [enableEffects, setEnableEffects] = React.useState(true);
	return (
		<div
			style={{ display: 'flex', width: '100%' }}
			onClick={() => setEnableEffects(x => !x)}
		>
			<RemotionThreeCanvas
				orthographic={false}
				camera={{ fov: 75, position: [0, 0, 470] }}
			>
				<ambientLight intensity={0.1} />
				<pointLight args={[undefined, 0.1]} position={[200, 0, 0]} />

				<ThreeVideo ignoreDepth src={videoSrc} startFrom={460} />

				{/* <Sequence
					layout='none'
					from={-460}
					showInTimeline={false}
					durationInFrames={Number.POSITIVE_INFINITY}
				>
					<ThreeVideo ignoreDepth src={videoSrc} />
				</Sequence> */}

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
						{/* <Noise premultiply opacity={0.6} /> */}
						{/* <DotScreen scale={0.85} /> */}
						<SwirlEffect
							radius={400}
							offset={[
								Math.sin(frame * 0.1) * 300,
								Math.cos(frame * 0.1) * 300
							]}
							angle={Math.cos(frame * 0.013) * 0.6}
						/>
						<Scanline density={0.9} opacity={0.2} />
						<Vignette darkness={0.65} />
					</EffectComposer>
				)}
			</RemotionThreeCanvas>
		</div >
	);
};

export default ThreeBasic;
