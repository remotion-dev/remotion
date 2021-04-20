/// <reference types="@react-three/fiber" />

import React from 'react';
import { RemotionThreeCanvas } from '@remotion/three';

import ShaderedVideo from './ShaderedVideo';

const videoSrc = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ThreeShaderedVideo = (): React.ReactElement => {
	return (
		<div style={{ display: 'flex', width: '100%' }}>
			<RemotionThreeCanvas
				orthographic={false}
				camera={{ fov: 75, position: [0, 0, 470] }}
			>
				<ambientLight intensity={0.15} />
				<pointLight args={[undefined, 0.4]} position={[200, 200, 0]} />
				<ShaderedVideo ignoreDepth src={videoSrc} startFrom={460} />
			</RemotionThreeCanvas>
		</div>
	);
};

export default ThreeShaderedVideo;
