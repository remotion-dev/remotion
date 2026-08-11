import type {SVGProps} from 'react';
import React from 'react';
import {AlignRightIcon} from './align-right';

export const AlignBottomIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<AlignRightIcon
			{...props}
			style={{
				...props.style,
				transform: 'rotate(90deg)',
			}}
		/>
	);
};
