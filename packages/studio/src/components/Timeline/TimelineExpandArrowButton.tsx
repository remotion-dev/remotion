import React, {useMemo} from 'react';
import {LIGHT_GRAY, WHITE} from '../../helpers/colors';

const arrowButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	color: WHITE,
	cursor: 'pointer',
	padding: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 12,
	height: 12,
	flexShrink: 0,
	fontSize: 8,
	marginRight: 4,
	userSelect: 'none',
	outline: 'none',
	lineHeight: 1,
};

const arrowSpacer: React.CSSProperties = {
	...arrowButton,
	cursor: 'default',
};

const svgStyle: React.CSSProperties = {display: 'block'};

export const TimelineExpandArrowButton: React.FC<{
	readonly isExpanded: boolean;
	readonly onClick: () => void;
	readonly label: string;
	readonly disabled: boolean;
}> = ({isExpanded, onClick, label, disabled = false}) => {
	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			onClick();
		},
		[onClick],
	);

	const stopPropagation = React.useCallback(
		(
			e:
				| React.MouseEvent<HTMLButtonElement>
				| React.PointerEvent<HTMLButtonElement>,
		) => {
			e.stopPropagation();
		},
		[],
	);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...arrowButton,
			transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
			cursor: disabled ? 'default' : 'pointer',
			opacity: disabled ? 0.5 : 1,
		};
	}, [isExpanded, disabled]);

	return (
		<button
			type="button"
			style={style}
			onClick={handleClick}
			onDoubleClick={stopPropagation}
			onPointerDown={stopPropagation}
			disabled={disabled}
			aria-expanded={isExpanded}
			aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
		>
			<svg width="12" height="12" viewBox="0 0 8 8" style={svgStyle}>
				<path d="M2 1L6 4L2 7Z" fill={LIGHT_GRAY} />
			</svg>
		</button>
	);
};

export const TimelineExpandArrowSpacer: React.FC = () => {
	return <div style={arrowSpacer} />;
};
