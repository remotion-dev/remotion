import {Star} from '@remotion/shapes';
import {visualControl} from '@remotion/studio';
import {zColor} from '@remotion/zod-types';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const NewSticker: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: visualControl('color', '#fff9bd', zColor()),
				position: 'absolute',
				width: '100%',
				height: '100%',
			}}
		>
			<Star points={20} innerRadius={174} outerRadius={207} fill={'#f2be0a'} />
		</AbsoluteFill>
	);
};

export default NewSticker;
