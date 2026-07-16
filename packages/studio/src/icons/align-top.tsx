import type {SVGProps} from 'react';
import React from 'react';
import {AlignLeftIcon} from './align-left';

export const AlignTopIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<AlignLeftIcon
			{...props}
			style={{
				...props.style,
				transform: 'rotate(90deg)',
			}}
		/>
	);
};
