import {
	Canvas,
	Fill,
	ImageShader,
	Shader,
	Skia,
	useImage,
} from '@shopify/react-native-skia';
import React from 'react';
import {staticFile} from 'remotion';

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
 
half4 main(float2 xy) {   
  xy.x += sin(xy.y / 3) * 4;
  return image.eval(xy).rbga;
}`)!;

export const RuntimeShaderDemo = () => {
	const s = React.useState(0);

	const image = useImage(staticFile('nested/mp4.png'));
	if (!image) {
		return null;
	}

	return (
		<Canvas style={{width: 1080, height: 1080}}>
			<Fill>
				<Shader source={source}>
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
