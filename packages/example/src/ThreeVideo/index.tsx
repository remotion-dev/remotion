import {ThreeCanvas, ThreeVideo} from '@remotion/three';
import React from 'react';
import {Sequence} from 'remotion';

const videoSrc =
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const Video = (): React.ReactElement => {
	return (
		<div style={{display: 'flex', width: '100%'}}>
			<ThreeCanvas>
				<Sequence layout="none" from={-460} durationInFrames={Infinity}>
					<ThreeVideo ignoreDepth src={videoSrc} />
				</Sequence>
			</ThreeCanvas>
		</div>
	);
};

export default Video;
