import React, {useCallback, useMemo, useState} from 'react';
import {CLEAR_HOVER, LIGHT_TEXT} from '../helpers/colors';
import {RenderIcon} from '../icons/render';
import {useZIndex} from '../state/z-index';

export const COMPOSITION_ITEM_HEIGHT = 32;

const itemStyle: React.CSSProperties = {
	display: 'flex',
	cursor: 'default',
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 1,
	appearance: 'none',
	border: 'none',
	height: COMPOSITION_ITEM_HEIGHT,
};

export const RenderButton: React.FC = () => {
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const {tabIndex} = useZIndex();

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			backgroundColor: hovered ? CLEAR_HOVER : 'transparent',
			color: hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered]);

	const iconStyle: React.CSSProperties = useMemo(() => {
		return {
			height: 14,
			color: hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered]);

	const onClick = useCallback(() => {
		console.log('tab index');
	}, []);

	return (
		<button
			style={style}
			tabIndex={tabIndex}
			onClick={onClick}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
		>
			<RenderIcon
				svgProps={{style: iconStyle}}
				color={hovered ? 'white' : LIGHT_TEXT}
			/>
		</button>
	);
};
