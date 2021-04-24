import {RemotionThreeCanvas, ThreeVideo} from '@remotion/three';
import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';

const videoSrc =
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ThreeBasic = (): React.ReactElement => {
	const frame = useCurrentFrame();
	return (
		<div style={{display: 'flex', width: '100%'}}>
			<RemotionThreeCanvas
				orthographic={false}
				camera={{fov: 75, position: [0, 0, 470]}}
			>
				<ambientLight intensity={0.15} />
				<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />

				<ThreeVideo ignoreDepth fullViewport src={videoSrc} startFrom={460} />

				<Sequence layout="none" from={-460} durationInFrames={Infinity}>
					<ThreeVideo ignoreDepth src={videoSrc} />
				</Sequence>

				<mesh
					position={[-300, -200, 0]}
					rotation={[
						frame * 0.06 * 0.5,
						frame * 0.07 * 0.5,
						frame * 0.08 * 0.5,
					]}
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
					rotation={[
						frame * 0.06 * 0.5,
						frame * 0.07 * 0.5,
						frame * 0.08 * 0.5,
					]}
				>
					<cylinderGeometry args={[50, 50, 180, 24]} />
					<meshStandardMaterial color="red" />
				</mesh>
			</RemotionThreeCanvas>
		</div>
	);
};

export default ThreeBasic;
