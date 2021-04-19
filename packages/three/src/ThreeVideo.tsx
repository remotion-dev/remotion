import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MeshProps, useThree } from '@react-three/fiber';

import useVideoTexture, { UseVideoTextureOptions } from './useVideoTexture';
import { ShaderLib } from 'three';

const vShaderDefault = `
varying vec2 v_uv;
void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const vShaderFullViewport = `
varying vec2 v_uv;
void main() {
    v_uv = uv;
    gl_Position = vec4(position * 2., 1.0);
}
`;

const fShaderDefault = `
varying vec2 v_uv;

uniform sampler2D map;

void main() {
    vec4 color = texture2D(map, v_uv);
    gl_FragColor = vec4(color.rgb, 1.0);
}
`;

const swirlShader = `
varying vec2 v_uv;

uniform sampler2D map;

uniform vec2 size;
uniform int frame;
uniform float t;

uniform float radius;
uniform float angle;
uniform vec2 offset;

vec2 xyToUv(in vec2 _xy) {
    return vec2(_xy.x, _xy.y) / size;
}

void main() {
    vec2 cUV = v_uv * size - size / 2. - offset;
    float dist = length(cUV);
    if (dist < radius)
    {
        float percent = (radius - dist) / radius;
        float theta = percent * percent * angle * 8.0;
        float s = sin(theta);
        float c = cos(theta);
        cUV = vec2(dot(cUV, vec2(c, -s)), dot(cUV, vec2(s, c)));
    }
    cUV = xyToUv(cUV + offset + size / 2.); // / vec2(width, height) + vec2(0.5, 0.5);
    gl_FragColor = vec4(texture2D(map, cUV).rgb, 1.0);
}
`;

export interface ThreeVideoProps extends MeshProps, Pick<UseVideoTextureOptions, 'src' | 'startFrom'> {
    videoProps?: UseVideoTextureOptions;
    fullViewport?: boolean;
    ignoreDepth?: boolean;
}

const swirlShaderUniforms = {
    ...ShaderLib.basic.uniforms,
    map: { value: null },
    //
    radius: { value: 300 },
    angle: { value: 0.5 },
    offset: { value: [0, 0] },
    frame: { value: 0 },
    t: { value: 0 },
    size: { value: [1920, 1080] },
};

const ThreeVideo = React.forwardRef((props: ThreeVideoProps, ref: React.ForwardedRef<React.ComponentType<'mesh'>>) => {
    const {
        src,
        startFrom,
        videoProps,
        ignoreDepth,
        fullViewport,
        ...rest
    } = props;
    const frame = useCurrentFrame();
    const [size] = useThree(s => [s.size] as const);
    const videoTexture = useVideoTexture({ src, startFrom, ...videoProps });
    return (
        <mesh
            ref={ref}
            scale={[size.width, size.height, 1]}
            renderOrder={ignoreDepth ? -10 : undefined}
            {...rest}
        >
            {/* <boxGeometry args={[4, 4, 4]} /> */}
            <planeGeometry args={[1, 1]} />
            {videoTexture && (
                <meshBasicMaterial
                    map={videoTexture}
                    depthTest={!ignoreDepth}
                    depthWrite={!ignoreDepth}
                />
            )}
            {/* {videoTexture && (
                <shaderMaterial
                    uniforms={swirlShaderUniforms}
                    uniforms-map-value={videoTexture}
                    uniforms-offset-value={[Math.sin(frame * 0.1) * 200, Math.cos(frame * 0.1) * 200]}
                    vertexShader={fullViewport ? vShaderFullViewport : vShaderDefault}
                    fragmentShader={fShaderDefault}
                    depthTest={!ignoreDepth}
                    depthWrite={!ignoreDepth}
                />
            )} */}
        </mesh>
    );
});

export default ThreeVideo;
