import type {PropsWithChildren} from 'react';
import React, {useCallback, useMemo} from 'react';
import {
	BLACK_ALPHA_60,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
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
	appearance: 'none',
	cursor: 'default',
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
	onClick: (() => void) | null;
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

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (
				!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
			) {
				return;
			}

			const buttons = Array.from(
				event.currentTarget.querySelectorAll<HTMLButtonElement>(
					'button:not(:disabled)',
				),
			);
			const index = buttons.indexOf(event.target as HTMLButtonElement);
			if (index === -1) {
				return;
			}

			event.preventDefault();
			const direction =
				event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
			const next =
				buttons[(index + direction + buttons.length) % buttons.length];
			next.click();
			requestAnimationFrame(() => next.focus());
		},
		[],
	);

	return (
		<div style={controlStyle} onKeyDown={onKeyDown}>
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
		readonly onClick: (() => void) | null;
		readonly size: SegmentedControlSize;
	}>
> = ({selected, onClick, children, size}) => {
	const {tabIndex} = useZIndex();

	const itemStyle: React.CSSProperties = useMemo(() => {
		return {
			...(size === 'compact' ? compactItem : item),
			opacity: onClick === null ? 0.5 : 1,
			...hoverableStyle({
				idleBackground: selected ? INPUT_BACKGROUND : TRANSPARENT,
				hoverBackground: selected ? INPUT_BACKGROUND : TRANSPARENT,
				idleColor: selected ? WHITE : LIGHT_TEXT,
				hoverColor: onClick === null ? LIGHT_TEXT : WHITE,
			}),
		};
	}, [onClick, selected, size]);

	return (
		<button
			type="button"
			aria-pressed={selected}
			disabled={onClick === null}
			className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
			style={itemStyle}
			tabIndex={tabIndex}
			onClick={onClick ?? undefined}
		>
			{children}
		</button>
	);
};
