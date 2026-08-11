import React from 'react';
import {
	WHITE_ALPHA_06,
	SELECTED_BACKGROUND,
	WHITE_HEX,
} from '../../helpers/colors';

export const listItemStyle: React.CSSProperties = {
	padding: 8,
	cursor: 'pointer',
	borderRadius: 4,
	lineHeight: 1.4,
	color: WHITE_HEX,
	fontFamily: 'inherit',
	fontSize: 14,
};

export const listItemActiveStyle: React.CSSProperties = {
	backgroundColor: SELECTED_BACKGROUND,
};

export const listItemHoverStyle: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_06,
};

export const CompositionIdListItem: React.FC<{
	readonly id: string;
	readonly isActive?: boolean;
	readonly onSelect: (id: string) => void;
}> = ({id, isActive, onSelect}) => {
	const [hover, setHover] = React.useState(false);

	return (
		<div
			role="button"
			onPointerEnter={() => setHover(true)}
			onPointerLeave={() => setHover(false)}
			onClick={() => onSelect(id)}
			style={{
				...listItemStyle,
				...(hover ? listItemHoverStyle : {}),
				...(isActive ? listItemActiveStyle : {}),
			}}
			title={id}
		>
			{id}
		</div>
	);
};
