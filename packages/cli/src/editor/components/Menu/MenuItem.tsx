import {PlayerInternals} from '@remotion/player';
import type {SetStateAction} from 'react';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {getBackgroundFromHoverState} from '../../helpers/colors';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
import {isMenuItem, MENU_INITIATOR_CLASSNAME} from './is-menu-item';
import {getPortal} from './portals';
import {menuContainerTowardsBottom, outerPortal} from './styles';

const container: React.CSSProperties = {
	fontSize: 13,
	color: 'white',
	paddingLeft: 10,
	paddingRight: 10,
	cursor: 'default',
	paddingTop: 8,
	paddingBottom: 8,
	userSelect: 'none',
	border: 'none',
};

export type MenuId = 'remotion' | 'file' | 'view' | 'tools' | 'help';

export type Menu = {
	id: MenuId;
	label: React.ReactNode;
	items: ComboboxValue[];
	leaveLeftPadding: boolean;
};

export const MenuItem: React.FC<{
	label: React.ReactNode;
	id: MenuId;
	selected: boolean;
	onItemSelected: (s: SetStateAction<string | null>) => void;
	onItemHovered: (id: MenuId) => void;
	onItemQuit: () => void;
	onPreviousMenu: () => void;
	onNextMenu: () => void;
	menu: Menu;
	leaveLeftPadding: boolean;
}> = ({
	label: itemName,
	selected,
	id,
	onItemSelected,
	onItemHovered,
	onItemQuit,
	onPreviousMenu,
	onNextMenu,
	menu,
}) => {
	const [hovered, setHovered] = useState(false);
	const ref = useRef<HTMLButtonElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
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
			...menuContainerTowardsBottom,
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

	const onPointerDown = useCallback(() => {
		onItemSelected(id);

		window.addEventListener(
			'pointerup',
			(e) => {
				if (!isMenuItem(e.target as HTMLElement)) {
					onItemQuit();
				}
			},
			{
				once: true,
			}
		);
	}, [id, onItemQuit, onItemSelected]);

	const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			e.stopPropagation();
			const isKeyboardInitiated = e.detail === 0;

			if (!isKeyboardInitiated) {
				return;
			}

			onItemSelected((p) => {
				return p === null ? id : null;
			});
		},
		[id, onItemSelected]
	);

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
				onPointerDown={onPointerDown}
				onClick={onClick}
				style={containerStyle}
				type="button"
				className={MENU_INITIATOR_CLASSNAME}
			>
				{itemName}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div className="css-reset" style={outerStyle}>
							<HigherZIndex onEscape={onItemQuit} onOutsideClick={onItemQuit}>
								<div style={portalStyle}>
									<MenuContent
										onNextMenu={onPreviousMenu}
										onPreviousMenu={onNextMenu}
										values={menu.items}
										onHide={onItemQuit}
										leaveLeftSpace={menu.leaveLeftPadding}
										preselectIndex={false}
										topItemCanBeUnselected
										fixedHeight={null}
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
