import React from 'react';
import {Solid} from 'remotion';

const CenteredSolid: React.FC = () => {
	return (
		<Solid
			width={240}
			height={240}
			color={'#d8d8d8'}
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				transform: 'translate(-50%, -50%)',
				rotate: '40deg',
			}}
		/>
	);
};

export default CenteredSolid;
