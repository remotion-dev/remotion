import {Skia} from '@shopify/react-native-skia';

type Value = string | number;
type Values = Value[];

export const glsl = (source: TemplateStringsArray, ...values: Values) => {
	const processed = source.flatMap((s, i) => [s, values[i]]).filter(Boolean);
	return processed.join('');
};

export const frag = (source: TemplateStringsArray, ...values: Values) => {
	const code = glsl(source, ...values);
	const rt = Skia.RuntimeEffect.Make(code);
	if (rt === null) {
		throw new Error("Couln't Compile Shader");
	}
	return rt;
};

export const transition = (t: string) => {
	return frag`
  uniform shader image1;
  uniform shader image2;

  uniform float progress;
  uniform float2 resolution;
  
  half4 getFromColor(float2 uv) {
    return image1.eval(uv * resolution);
  }
  
  half4 getToColor(float2 uv) {
    return image2.eval(uv * resolution);
  }
  
  ${t}

  half4 main(vec2 xy) {
    vec2 uv = xy / resolution;
    return transition(uv);
  }
  `;
};
