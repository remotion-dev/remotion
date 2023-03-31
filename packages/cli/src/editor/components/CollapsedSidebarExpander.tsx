import React, {useCallback, useMemo, useState} from 'react';
import {getBackgroundFromHoverState} from '../helpers/colors';
import {CaretLeft, CaretRight} from '../icons/caret';
import {useZIndex} from '../state/z-index';

// TODO: Add shortcut to toggle both sidebars (similar to zen mode in vs code)
export const CollapsedSidebarExpander: React.FC<{
	onExpand: () => void;
	direction: 'left' | 'right';
}> = ({onExpand, direction}) => {
	const [hovered, setHovered] = useState(false);

	const {tabIndex} = useZIndex();

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: 'none',
			borderRight: `${direction === 'right' ? 1 : 0}px solid black`,
			borderLeft: `${direction === 'left' ? 1 : 0}px solid black`,
			cursor: 'pointer',
			color: 'white',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			paddingLeft: direction === 'right' ? 7 : 5,
			paddingRight: direction === 'right' ? 4 : 5,
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected: false,
			}),
			appearance: 'none',
			WebkitAppearance: 'none',
		};
	}, [direction, hovered]);

	return (
		<button
			style={style}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
			role="button"
			tabIndex={tabIndex}
			onClick={onExpand}
		>
			{direction === 'right' ? <CaretRight /> : <CaretLeft />}
		</button>
	);
};
