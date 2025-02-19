import {
	Canvas,
	Fill,
	ImageShader,
	Shader,
	Skia,
	useImage,
} from '@shopify/react-native-skia';
import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';

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

export const cube = glsl`
// Author: gre
// License: MIT
const float persp = 0.7;
const float unzoom = 0.3;
const float reflection = 0.4;
const float floating = 3.0;

vec2 project (vec2 p) {
  return p * vec2(1.0, -1.2) + vec2(0.0, -floating/100.);
}

bool inBounds (vec2 p) {
  return all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));
}

vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
  vec4 c = vec4(0.0, 0.0, 0.0, 1.0);
  pfr = project(pfr);
  // FIXME avoid branching might help perf!
  if (inBounds(pfr)) {
    c += mix(vec4(0.0), getFromColor(pfr), reflection * mix(1.0, 0.0, pfr.y));
  }
  pto = project(pto);
  if (inBounds(pto)) {
    c += mix(vec4(0.0), getToColor(pto), reflection * mix(1.0, 0.0, pto.y));
  }
  return c;
}

// p : the position
// persp : the perspective in [ 0, 1 ]
// center : the xcenter in [0, 1] \ 0.5 excluded
vec2 xskew (vec2 p, float persp, float center) {
  float x = mix(p.x, 1.0-p.x, center);
  return (
    (
      vec2( x, (p.y - 0.5*(1.0-persp) * x) / (1.0+(persp-1.0)*x) )
      - vec2(0.5-distance(center, 0.5), 0.0)
    )
    * vec2(0.5 / distance(center, 0.5) * (center<0.5 ? 1.0 : -1.0), 1.0)
    + vec2(center<0.5 ? 0.0 : 1.0, 0.0)
  );
}

vec4 transition(vec2 op) {
  float uz = unzoom * 2.0*(0.5-distance(0.5, progress));
  vec2 p = -uz*0.5+(1.0+uz) * op;
  vec2 fromP = xskew(
    (p - vec2(progress, 0.0)) / vec2(1.0-progress, 1.0),
    1.0-mix(progress, 0.0, persp),
    0.0
  );
  vec2 toP = xskew(
    p / vec2(progress, 1.0),
    mix(pow(progress, 2.0), 1.0, persp),
    1.0
  );
  // FIXME avoid branching might help perf!
  if (inBounds(fromP)) {
    return getFromColor(fromP);
  }
  else if (inBounds(toP)) {
    return getToColor(toP);
  }
  return bgColor(op, fromP, toP);
}

`;

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
