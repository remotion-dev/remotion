import type {SVGProps} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {TCompMetadata} from 'remotion';
import {CLEAR_HOVER, LIGHT_TEXT} from '../helpers/colors';
import {RenderIcon} from '../icons/render';
import {ModalsContext} from '../state/modals';
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

export const RenderButton: React.FC<{
	composition: TCompMetadata;
}> = ({composition}) => {
	const [hovered, setHovered] = useState(false);
	const {setSelectedModal} = useContext(ModalsContext);

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

	const iconStyle: SVGProps<SVGSVGElement> = useMemo(() => {
		return {
			style: {
				height: 14,
			},
		};
	}, []);

	const onClick = useCallback(() => {
		setSelectedModal({
			type: 'render',
			composition,
		});
	}, [composition, setSelectedModal]);

	return (
		<button
			style={style}
			tabIndex={tabIndex}
			onClick={onClick}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			type="button"
		>
			<RenderIcon svgProps={iconStyle} color={hovered ? 'white' : LIGHT_TEXT} />
		</button>
	);
};
