import React from 'react';
import {Circle} from './Circle';

const ShadowCircles: React.FC = () => {
	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<Circle size={2400} />
			<Circle size={2000} />
			<Circle size={1800} />
			<Circle size={1600} />
			<Circle size={1400} />
			<Circle size={1200} />
			<Circle size={1000} />
			<Circle size={800} />
			<Circle size={600} />
			<Circle size={400} />
			<Circle size={200} />
		</div>
	);
};

export default ShadowCircles;
