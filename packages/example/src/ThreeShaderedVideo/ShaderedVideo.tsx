import {MeshProps, useThree} from '@react-three/fiber';
import {useVideoTexture, UseVideoTextureOptions} from '@remotion/three';
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ShaderChunk, ShaderLib} from 'three';

const vShaderFullViewport = ShaderLib.basic.vertexShader.replace(
	'#include <project_vertex>',
	`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = vec4(position * 2.0, 1.0);
`
);

ShaderChunk.swirl_map_fragment = `
    vec2 cUV = vUv * size - size / 2. - offset;
    float dist = length(cUV);
    if (dist < radius)
    {
        float percent = (radius - dist) / radius;
        float theta = percent * percent * angle * 8.0;
        float s = sin(theta);
        float c = cos(theta);
        cUV = vec2(dot(cUV, vec2(c, -s)), dot(cUV, vec2(s, c)));
    }
    cUV = xyToUv(cUV + offset + size / 2.);

	vec4 texelColor = texture2D( map, cUV );
	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;`;

const swirlFragmentShader = `
uniform float radius;
uniform float angle;
uniform vec2 offset;
const vec2 size = vec2(1920.0, 1080.0);
vec2 xyToUv(in vec2 _xy) {
    return vec2(_xy.x, _xy.y) / size;
}
${ShaderLib.basic.fragmentShader}`.replace(
	'#include <map_fragment>',
	'#include <swirl_map_fragment>'
);

export interface ThreeVideoProps
	extends MeshProps,
		Pick<UseVideoTextureOptions, 'src' | 'startFrom'> {
	fullViewport?: boolean;
	ignoreDepth?: boolean;
	videoProps?: UseVideoTextureOptions;
}

const swirlShaderUniforms = {
	...ShaderLib.basic.uniforms,
	radius: {value: 200},
	angle: {value: 0.4},
	offset: {value: [0, 0]},
	size: {value: [1920, 1080]},
};

const ThreeVideo = React.forwardRef(
	(
		props: ThreeVideoProps,
		ref: React.ForwardedRef<React.ComponentType<'mesh'>>
	) => {
		const {
			fullViewport,
			ignoreDepth,
			src,
			startFrom,
			videoProps,
			...rest
		} = props;
		const frame = useCurrentFrame();
		const [size] = useThree((s) => [s.size] as const);
		const videoTexture = useVideoTexture({src, startFrom, ...videoProps});
		return (
			<mesh
				ref={ref}
				scale={[size.width, size.height, 1]}
				renderOrder={ignoreDepth ? -2 : undefined}
				{...rest}
			>
				<planeGeometry args={[1, 1]} />
				{videoTexture && (
					<texturedShaderMaterial
						vertexShader={
							fullViewport ? vShaderFullViewport : ShaderLib.basic.vertexShader
						}
						fragmentShader={swirlFragmentShader}
						uniforms={swirlShaderUniforms}
						uniforms-offset-value={[
							Math.sin(frame * 0.1) * 300,
							Math.cos(frame * 0.1) * 300,
						]}
						uniforms-angle-value={0.5}
						uniforms-radius-value={400}
						uniforms-size-value={[size.width, size.height, 1]}
						map={videoTexture}
						depthTest={!ignoreDepth}
						depthWrite={!ignoreDepth}
					/>
				)}
			</mesh>
		);
	}
);

export default ThreeVideo;
