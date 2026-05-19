import {
	Canvas,
	Fill,
	ImageShader,
	Shader,
	useImage,
} from '@shopify/react-native-skia';
import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import {cube} from './shader-cube-shader';
import {transition} from './skia-shader-utils';

export const RuntimeShaderDemo = () => {
	React.useState(0);

	const image = useImage(staticFile('nested/mp4.png'));
	const prog = useCurrentFrame();
	if (!image) {
		return null;
	}

	return (
		<Canvas style={{width: 1080, height: 1080}}>
			<Fill>
				<Shader
					source={transition(cube)}
					uniforms={{
						progress: prog / 30,
						resolution: [1080, 1080],
					}}
				>
					<ImageShader
						image={image}
						fit="cover"
						rect={{x: 0, y: 0, width: 1080, height: 1080}}
					/>
					<ImageShader
						image={image}
						fit="cover"
						rect={{x: 0, y: 0, width: 1080, height: 1080}}
					/>
				</Shader>
			</Fill>
		</Canvas>
	);
};
