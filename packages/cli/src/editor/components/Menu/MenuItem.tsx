import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {FONT_FAMILY} from '../../helpers/font';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {ComboboxValue} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
import {getPortal} from './portals';
import {menuContainer, outerPortal} from './styles';

const container: React.CSSProperties = {
	fontSize: 13,
	fontFamily: FONT_FAMILY,
	color: 'white',
	paddingLeft: 10,
	paddingRight: 10,
	cursor: 'default',
	paddingTop: 8,
	paddingBottom: 8,
	userSelect: 'none',
	border: 'none',
};

export type MenuId = 'remotion' | 'file' | 'view' | 'help';

export type Menu = {
	id: MenuId;
	label: string;
	items: ComboboxValue[];
	leaveLeftPadding: boolean;
};

export const MenuItem: React.FC<{
	label: string;
	id: MenuId;
	selected: boolean;
	onItemSelected: (id: MenuId) => void;
	onItemHovered: (id: MenuId) => void;
	onItemQuit: () => void;
	onArrowLeft: () => void;
	onArrowRight: () => void;
	menu: Menu;
	leaveLeftPadding: boolean;
}> = ({
	label: itemName,
	selected,
	id,
	onItemSelected,
	onItemHovered,
	onItemQuit,
	onArrowLeft,
	onArrowRight,
	menu,
}) => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
	});
	const {tabIndex, currentZIndex} = useZIndex();

	const containerStyle = useMemo((): React.CSSProperties => {
		return {
			...container,
			backgroundColor: getBackgroundFromHoverState({
				hovered,
				selected,
			}),
		};
	}, [hovered, selected]);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!selected || !size) {
			return null;
		}

		return {
			...menuContainer,
			left: size.left,
			top: size.top + size.height,
		};
	}, [selected, size]);

	const onPointerEnter = useCallback(() => {
		onItemHovered(id);
		setHovered(true);
	}, [id, onItemHovered]);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const onClick = useCallback(() => {
		onItemSelected(id);
		(document.activeElement as HTMLDivElement).blur();
	}, [id, onItemSelected]);

	const outerStyle = useMemo(() => {
		return {
			...outerPortal,
			top: (size?.top ?? 0) + (size?.height ?? 0),
		};
	}, [size]);

	return (
		<>
			<button
				ref={ref}
				role="button"
				tabIndex={tabIndex}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				onClick={onClick}
				style={containerStyle}
				type="button"
			>
				{itemName}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={outerStyle}>
							<HigherZIndex onEscape={onItemQuit} onOutsideClick={onItemQuit}>
								<div style={portalStyle}>
									<MenuContent
										onArrowLeft={onArrowLeft}
										onArrowRight={onArrowRight}
										values={menu.items}
										onHide={onItemQuit}
										leaveLeftSpace={menu.leaveLeftPadding}
									/>
								</div>
							</HigherZIndex>
						</div>,
						getPortal(currentZIndex)
				  )
				: null}
		</>
	);
};
