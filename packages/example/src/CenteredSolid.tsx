import {starburst} from '@remotion/starburst';
import React from 'react';
import {AbsoluteFill, Solid} from 'remotion';

const CenteredSolid: React.FC = () => {
	return (
		<AbsoluteFill style={{perspective: 300}}>
			<Solid
				width={240}
				height={240}
				color={'#d8d8d8'}
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate(-50%, -50%) rotateX(40deg)',
					rotate: '40deg',
					scale: 2.42,
					translate: '0px 191px',
				}}
				effects={[starburst({rays: 10, colors: ['#eeeeee', '#bbbbbb']})]}
			/>
		</AbsoluteFill>
	);
};

export default CenteredSolid;
