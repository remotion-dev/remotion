import React from 'react';
import {LowerThird} from './lower-third.element';
import {Sequence} from 'remotion';

export const TestPleaseDontCommit: React.FC = () => {
	return (
		<Sequence
			name="Lower Third"
			width={680}
			height={138}
			style={{
				position: 'absolute',
				translate: '440.6px 152.3px',
			}}
		>
			<LowerThird />
		</Sequence>
	);
};
