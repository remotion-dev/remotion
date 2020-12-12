import React from 'react';
import {TextComp} from './Text';

export const Comp: React.FC = () => {
	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				backgroundColor: 'blue',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<TextComp />
		</div>
	);
};
