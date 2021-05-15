import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {Mesh} from './Mesh';

const ThreeBasic: React.FC = () => {
	return (
		<div style={{display: 'flex', width: '100%', backgroundColor: 'white'}}>
			<ThreeCanvas
				orthographic={false}
				camera={{fov: 75, position: [0, 0, 470]}}
			>
				<Mesh />
			</ThreeCanvas>
		</div>
	);
};

export default ThreeBasic;
