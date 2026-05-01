import React, {useMemo} from 'react';

const arrowButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	color: 'white',
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

const svgStyle: React.CSSProperties = {display: 'block'};

export const TimelineExpandArrowButton: React.FC<{
	readonly isExpanded: boolean;
	readonly onClick: () => void;
	readonly label: string;
	readonly hasExpandableContent: boolean;
}> = ({isExpanded, onClick, label, hasExpandableContent}) => {
	const style: React.CSSProperties = useMemo(() => {
		return {
			...arrowButton,
			transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
			opacity: hasExpandableContent ? 1 : 0.2,
		};
	}, [isExpanded, hasExpandableContent]);

	return (
		<button
			type="button"
			style={style}
			onClick={onClick}
			disabled={!hasExpandableContent}
			aria-expanded={isExpanded}
			aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
		>
			<svg width="12" height="12" viewBox="0 0 8 8" style={svgStyle}>
				<path d="M2 1L6 4L2 7Z" fill="white" />
			</svg>
		</button>
	);
};

export const TimelineExpandArrowSpacer: React.FC = () => {
	return <div style={arrowButton} />;
};
