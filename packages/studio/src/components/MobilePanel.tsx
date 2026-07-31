import React from 'react';
import ReactDOM from 'react-dom';
import {BACKGROUND, SHADOW_BLACK} from '../helpers/colors';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {MENU_TOOLBAR_HEIGHT} from './menu-toolbar-height';
import {getPortal} from './Menu/portals';

const overlay: React.CSSProperties = {
	position: 'fixed',
	top: MENU_TOOLBAR_HEIGHT,
	left: 0,
	width: '100%',
	height: `calc(100% - ${MENU_TOOLBAR_HEIGHT}px)`,
};

const panel: React.CSSProperties = {
	position: 'fixed',
	top: MENU_TOOLBAR_HEIGHT,
	height: `calc(100% - ${MENU_TOOLBAR_HEIGHT}px)`,
	overflow: 'hidden',
	background: BACKGROUND,
	boxShadow: SHADOW_BLACK,
};

const sidebarWidth = {
	left: 'min(210px, calc(100% - 50px))',
	right: 'min(245px, calc(100% - 50px))',
} satisfies Record<'left' | 'right', React.CSSProperties['width']>;

export default function MobilePanel({
	children,
	onClose,
	side,
}: {
	children: React.ReactNode;
	onClose: () => void;
	side: 'left' | 'right';
}) {
	const {currentZIndex} = useZIndex();
	const onOutsideClick = React.useCallback(
		(target: Node) => {
			const element = target instanceof Element ? target : null;
			const toggleSelector = `[data-sidebar-toggle="${side}"]`;
			if (
				element?.closest(toggleSelector) ||
				element?.closest('button')?.querySelector(toggleSelector)
			) {
				return;
			}

			onClose();
		},
		[onClose, side],
	);

	return ReactDOM.createPortal(
		<div style={overlay}>
			<HigherZIndex onEscape={onClose} onOutsideClick={onOutsideClick}>
				<div
					style={{
						...panel,
						width: sidebarWidth[side],
						left: side === 'left' ? 0 : undefined,
						right: side === 'right' ? 0 : undefined,
					}}
				>
					{children}
				</div>
			</HigherZIndex>
		</div>,
		getPortal(currentZIndex),
	);
}
