import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {Orb} from './Orb';

export const OrbScene: React.FC = () => {
	return (
		<ThreeCanvas
			width={2000}
			height={2000}
			gl={{
				alpha: false,
				antialias: false,
				stencil: false,
				depth: false,
			}}
			onCreated={(state) => state.gl.setClearColor('white')}
		>
			<ambientLight intensity={1.5} color={0xffffff} />
			<pointLight position={[10, 10, 0]} />
			<Orb />
		</ThreeCanvas>
	);
};
