import React from 'react';
import {AbsoluteFill} from 'remotion';
import Hi from './hmm.mdx';

const MdxTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				fontSize: 40,
				fontFamily: 'Helvetica',
				padding: 30,
			}}
		>
			<Hi />
		</AbsoluteFill>
	);
};

export default MdxTest;
