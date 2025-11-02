import React from 'react';
import {
	CLEAR_HOVER,
	SELECTED_BACKGROUND,
	TEXT_COLOR,
} from '../../helpers/colors';

export const listItemStyle: React.CSSProperties = {
	padding: 8,
	cursor: 'pointer',
	borderRadius: 4,
	lineHeight: 1.4,
	color: TEXT_COLOR,
	fontFamily: 'inherit',
	fontSize: 14,
};

export const listItemActiveStyle: React.CSSProperties = {
	backgroundColor: SELECTED_BACKGROUND,
};

export const listItemHoverStyle: React.CSSProperties = {
	backgroundColor: CLEAR_HOVER,
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
