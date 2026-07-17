import type {SVGProps} from 'react';
import React from 'react';
import {AlignCenterHorizontalIcon} from './align-center-horizontal';

export const AlignCenterVerticalIcon: React.FC<SVGProps<SVGSVGElement>> = (
	props,
) => {
	return (
		<AlignCenterHorizontalIcon
			{...props}
			style={{
				...props.style,
				transform: 'rotate(90deg)',
			}}
		/>
	);
};
