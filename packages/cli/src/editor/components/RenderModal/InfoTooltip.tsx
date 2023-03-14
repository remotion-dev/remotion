import React from 'react';
import {BACKGROUND, BORDER_COLOR} from '../../helpers/colors';
import {SHADOW_TOWARDS_TOP} from '../Menu/styles';

const container: React.CSSProperties = {
	padding: '10px 12px',
	// TODO: Depending on direction
	boxShadow: SHADOW_TOWARDS_TOP,
	background: BACKGROUND,
	color: 'white',
	border: '0.5px solid ' + BORDER_COLOR,
	maxHeight: 200,
	overflow: 'auto',
};

const arrow: React.CSSProperties = {
	height: 7,
	display: 'block',
	overflow: 'visible',
	marginTop: -0.5,
	marginLeft: 7,
};

export const InfoTooltip: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	return (
		// TODO: Down arrow
		// TODO: not scrolling with portal
		<>
			<div style={container}>{children}</div>
			<svg viewBox="0 0 14 7" style={arrow}>
				<path
					d={`M 14 0 L 7 7 L 0 0`}
					fill={BACKGROUND}
					strokeLinecap="butt"
					stroke={BORDER_COLOR}
					strokeWidth={0.5}
				/>
			</svg>
		</>
	);
};
