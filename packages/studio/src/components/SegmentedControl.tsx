import type {PropsWithChildren} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {
	INPUT_BACKGROUND,
	BLACK_ALPHA_60,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {useZIndex} from '../state/z-index';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	overflow: 'hidden',
	border: '1px solid ' + BLACK_ALPHA_60,
	flexWrap: 'wrap',
	maxWidth: 350,
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
	whiteSpace: 'nowrap',
};

const compactItem: React.CSSProperties = {
	...item,
	fontSize: 11,
	fontWeight: 400,
	padding: '2px 7px',
};

export type SegmentedControlItem = {
	label: React.ReactNode;
	onClick: () => void;
	key: string;
	selected: boolean;
};

type SegmentedControlSize = 'default' | 'compact';

export const SegmentedControl: React.FC<{
	readonly items: SegmentedControlItem[];
	readonly needsWrapping: boolean;
	readonly size?: SegmentedControlSize;
}> = ({items, needsWrapping, size = 'default'}) => {
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
					<Item
						key={i.key}
						onClick={i.onClick}
						selected={i.selected}
						size={size}
					>
						{i.label}
					</Item>
				);
			})}
		</div>
	);
};

const Item: React.FC<
	PropsWithChildren<{
		readonly selected: boolean;
		readonly onClick: () => void;
		readonly size: SegmentedControlSize;
	}>
> = ({selected, onClick, children, size}) => {
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
			...(size === 'compact' ? compactItem : item),
			backgroundColor: selected ? INPUT_BACKGROUND : TRANSPARENT,
			color: selected ? WHITE : hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered, selected, size]);

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
