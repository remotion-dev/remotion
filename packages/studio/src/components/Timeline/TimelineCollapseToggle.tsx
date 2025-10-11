import type {SVGProps} from 'react';
import React from 'react';

const container: React.CSSProperties = {
	height: 10,
	width: 10,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
};

const Icon: React.FC<
	SVGProps<SVGSVGElement> & {
		readonly color: string;
	}
> = ({color, ...props}) => {
	return (
		<svg viewBox="0 0 8 10" {...props} style={{height: 10, width: 8}}>
			<path d="M 0 0 L 8 5 L 0 10 z" fill={color} />
		</svg>
	);
};

export const TimelineCollapseToggle: React.FC<{
	readonly collapsed: boolean;
	readonly color: string;
}> = ({collapsed, color}) => {
	return (
		<div
			style={collapsed ? container : {...container, transform: 'rotate(90deg)'}}
		>
			<Icon color={color} />
		</div>
	);
};
