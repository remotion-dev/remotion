import type {PropsWithChildren} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {
	INPUT_BACKGROUND,
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflow: 'hidden',
	border: '1px solid ' + INPUT_BORDER_COLOR_UNHOVERED,
	flexWrap: 'wrap',
	maxWidth: '295px',
	justifyContent: 'flex-end',
};

const item: React.CSSProperties = {
	display: 'flex',
	fontSize: 15,
	padding: '4px 12px',
	cursor: 'pointer',
	appearance: 'none',
	border: 'none',
	flex: 1,
	justifyContent: 'center',
};

export type SegmentedControlItem = {
	label: React.ReactNode;
	onClick: () => void;
	key: string;
	selected: boolean;
};

export const SegmentedControl: React.FC<{
	items: SegmentedControlItem[];
	needsWrapping: boolean;
}> = ({items, needsWrapping}) => {
	const controlStyle: React.CSSProperties = useMemo(() => {
		if (needsWrapping) {
			return {
				...container,
				flexWrap: 'wrap',
				maxWidth: '248px',
				justifyContent: 'flex-end',
				marginBottom: '8px',
			};
		}

		return {
			...container,
		};
	}, [needsWrapping]);

	return (
		<div style={controlStyle}>
			{items.map((i) => {
				return (
					<Item key={i.key} onClick={i.onClick} selected={i.selected}>
						{i.label}
					</Item>
				);
			})}
		</div>
	);
};

const Item: React.FC<
	PropsWithChildren<{
		selected: boolean;
		onClick: () => void;
	}>
> = ({selected, onClick, children}) => {
	const [hovered, setHovered] = useState(false);

	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const itemStyle: React.CSSProperties = useMemo(() => {
		return {
			...item,
			backgroundColor: selected ? INPUT_BACKGROUND : 'transparent',
			color: selected ? 'white' : hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	return (
		<button
			type="button"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={itemStyle}
			tabIndex={tabIndex}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
