import React, {useMemo} from 'react';
import {BLACK_HEX, WHITE} from '../../helpers/colors';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {SHADOW_TOWARDS_BOTTOM, SHADOW_TOWARDS_TOP} from '../Menu/styles';

const arrow: React.CSSProperties = {
	height: 7,
	display: 'block',
	overflow: 'visible',
};

export const InfoTooltip: React.FC<{
	readonly children: React.ReactNode;
	readonly arrowDirection: 'up' | 'down';
	readonly backgroundColor: string;
	readonly horizontalAlignment: 'left' | 'right';
}> = ({children, arrowDirection, backgroundColor, horizontalAlignment}) => {
	const container: React.CSSProperties = useMemo(() => {
		return {
			boxShadow:
				arrowDirection === 'down' ? SHADOW_TOWARDS_TOP : SHADOW_TOWARDS_BOTTOM,
			background: backgroundColor,
			color: WHITE,
			border: '0.5px solid ' + BLACK_HEX,
			maxHeight: 200,
			overflow: 'auto',
			borderRadius: '4px',
		};
	}, [arrowDirection, backgroundColor]);
	const arrowStyle: React.CSSProperties = useMemo(() => {
		return {
			...arrow,
			...(horizontalAlignment === 'left' ? {marginLeft: 7} : {marginRight: 7}),
			...(arrowDirection === 'up'
				? {transform: `translateY(1px)`}
				: {marginTop: -1}),
		};
	}, [arrowDirection, horizontalAlignment]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: arrowDirection === 'up' ? 'column-reverse' : 'column',
				alignItems: horizontalAlignment === 'left' ? 'flex-start' : 'flex-end',
			}}
		>
			<div style={container} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				{children}
			</div>
			{arrowDirection === 'down' ? (
				<svg viewBox="0 0 14 7" style={arrowStyle}>
					<path
						d={`M 14 0 L 7 7 L 0 0`}
						fill={backgroundColor}
						strokeLinecap="butt"
						stroke={BLACK_HEX}
						strokeWidth={0.5}
					/>
				</svg>
			) : null}
			{arrowDirection === 'up' ? (
				<svg viewBox="0 0 14 7" style={arrowStyle}>
					<path
						d={`M 0 7 L 7 0 L 14 7`}
						fill={backgroundColor}
						strokeLinecap="butt"
						stroke={BLACK_HEX}
						strokeWidth={0.5}
					/>
				</svg>
			) : null}
		</div>
	);
};
