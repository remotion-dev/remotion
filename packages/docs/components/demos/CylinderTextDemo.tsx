import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CylinderText} from '../../elements/text/cylinder-text/cylinder-text';

export const CylinderTextDemo: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#eef1f4',
			}}
		>
			<CylinderText />
		</AbsoluteFill>
	);
};
