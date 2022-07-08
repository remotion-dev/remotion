import type {SVGProps} from 'react';
import React from 'react';
import {LIGHT_COLOR} from '../../helpers/colors';

const container: React.CSSProperties = {
	height: 10,
	width: 10,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const Icon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg viewBox="0 0 8 10" {...props} style={{height: 10, width: 8}}>
			<path d="M 0 0 L 8 5 L 0 10 z" fill={LIGHT_COLOR} />
		</svg>
	);
};

export const TimelineCollapseToggle: React.FC<{
	collapsed: boolean;
}> = ({collapsed}) => {
	return (
		<div
			style={collapsed ? container : {...container, transform: 'rotate(90deg)'}}
		>
			<Icon />
		</div>
	);
};
