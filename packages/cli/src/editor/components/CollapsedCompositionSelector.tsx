import type {KeyboardEvent} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {getBackgroundFromHoverState} from '../helpers/colors';
import {CaretRight} from '../icons/caret';
import {useZIndex} from '../state/z-index';

export const CollapsedCompositionSelector: React.FC<{
	onExpand: () => void;
}> = ({onExpand}) => {
	const [hovered, setHovered] = useState(false);

	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onKeyDown = useCallback(
		(evt: KeyboardEvent) => {
			if (evt.key === 'Enter') {
				evt.preventDefault();
				onExpand();
			}
		},
		[onExpand]
	);

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: 'none',
			borderRight: '2px solid black',
			cursor: 'pointer',
			color: 'white',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			paddingLeft: 7,
			paddingRight: 4,
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected: false,
			}),
			appearance: 'none',
			WebkitAppearance: 'none',
		};
	}, [hovered]);

	return (
		<button
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
			role="button"
			tabIndex={tabIndex}
			onClick={onExpand}
			onKeyDown={onKeyDown}
		>
			<CaretRight />
		</button>
	);
};
