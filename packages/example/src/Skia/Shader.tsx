import {
	Canvas,
	Circle,
	Group,
	RuntimeShader,
	Skia,
} from '@shopify/react-native-skia';

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
 
half4 main(float2 xy) {
  return image.eval(xy).rbga;
}
`)!;

export const RuntimeShaderDemo = () => {
	const r = 128;
	return (
		<Canvas style={{flex: 1}}>
			<Group>
				<RuntimeShader source={source} />
				<Circle cx={r} cy={r} r={r} color="lightblue" />
			</Group>
		</Canvas>
	);
};
