import {
	DotScreen,
	EffectComposer,
	Scanline,
	Sepia,
	Vignette,
} from '@react-three/postprocessing';
import {ThreeCanvas, ThreeVideo} from '@remotion/three';
import React from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {SwirlEffect} from './SwirlEffect';

const videoSrc =
	'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ThreePostprocessing = (): React.ReactElement => {
	const frame = useCurrentFrame();
	return (
		<div style={{flex: 1}}>
			<ThreeCanvas orthographic={false}>
				<ThreeVideo ignoreDepth fullViewport src={videoSrc} startFrom={460} />
				<EffectComposer
					multisampling={0} // TODO: Remove with three.js v128
				>
					<Sequence durationInFrames={100} from={0} layout="none">
						<Scanline density={0.9} opacity={0.2} />
					</Sequence>
					<Sequence durationInFrames={100} from={100} layout="none">
						<SwirlEffect
							radius={400}
							offset={[
								Math.sin(frame * 0.1) * 200,
								Math.cos(frame * 0.1) * 200,
							]}
							angle={Math.cos(frame * 0.013) * 0.6}
						/>
					</Sequence>
					<Sequence durationInFrames={100} from={200} layout="none">
						<Vignette darkness={0.55} />
					</Sequence>
					<Sequence durationInFrames={100} from={300} layout="none">
						<Sepia intensity={1} />
					</Sequence>
					<Sequence durationInFrames={100} from={400} layout="none">
						<DotScreen scale={0.5} />
					</Sequence>
				</EffectComposer>
			</ThreeCanvas>
		</div>
	);
};

export default ThreePostprocessing;
