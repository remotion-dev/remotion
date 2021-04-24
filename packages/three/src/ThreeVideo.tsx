import { MeshProps, useThree } from '@react-three/fiber';
import React from 'react';
import { ShaderLib } from 'three';
import useVideoTexture, { UseVideoTextureOptions } from './useVideoTexture';
import './utils/TexturedShaderMaterial';

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

export interface ThreeVideoProps
	extends MeshProps,
		Pick<UseVideoTextureOptions, 'src' | 'startFrom'> {
	fullViewport?: boolean;
	ignoreDepth?: boolean;
	videoProps?: UseVideoTextureOptions;
}

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
		const [size] = useThree((s) => [s.size] as const);
		const videoTexture = useVideoTexture({ src, startFrom, ...videoProps });
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
						fragmentShader={ShaderLib.basic.fragmentShader}
						uniforms={ShaderLib.basic.uniforms}
						map={videoTexture}
						depthTest={!ignoreDepth}
						depthWrite={!ignoreDepth}
					/>
				)}
			</mesh>
		);
	}
);
