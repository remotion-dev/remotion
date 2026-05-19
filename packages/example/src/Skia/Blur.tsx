import {
	Canvas,
	Fill,
	ImageShader,
	Shader,
	useImage,
} from '@shopify/react-native-skia';
import React, {useState} from 'react';
import {staticFile, useCurrentFrame, useDelayRender} from 'remotion';
import {cube} from './blur-cube-shader';
import {transition} from './skia-shader-utils';

export const RuntimeShaderZoomBlur = () => {
	React.useState(0);
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() => delayRender());

	const image1 = useImage(staticFile('1.jpg'));
	const image2 = useImage(staticFile('2.jpg'));
	const prog = useCurrentFrame();
	if (!image1 || !image2) {
		return null;
	}
	continueRender(handle);

	return (
		<Canvas style={{width: 1080, height: 1080}}>
			<Fill>
				<Shader
					source={transition(cube)}
					uniforms={{
						progress: prog / 30,
						resolution: [1080, 1080],
						strength: 0.5,
					}}
				>
					<ImageShader
						image={image1}
						fit="cover"
						rect={{x: 0, y: 0, width: 1080, height: 1080}}
					/>
					<ImageShader
						image={image2}
						fit="cover"
						rect={{x: 0, y: 0, width: 1080, height: 1080}}
					/>
				</Shader>
			</Fill>
		</Canvas>
	);
};
