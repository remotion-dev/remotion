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
	outline: 'none',
	background: BACKGROUND,
	boxShadow: SHADOW_BLACK,
};

const sidebarWidth = 'min(290px, calc(100% - 50px))';

export default function MobilePanel({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: () => void;
}) {
	const {currentZIndex} = useZIndex();
	const panelRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const panelElement = panelRef.current;
		const trigger = document
			.querySelector('[data-sidebar-toggle="left"]')
			?.closest('button');
		panelElement?.focus();

		return () => {
			if (
				document.activeElement === document.body ||
				panelElement?.contains(document.activeElement)
			) {
				trigger?.focus();
			}
		};
	}, []);

	const onPointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			event.stopPropagation();
		},
		[],
	);

	const onOutsideClick = React.useCallback(
		(target: Node) => {
			const element = target instanceof Element ? target : null;
			const toggleSelector = '[data-sidebar-toggle="left"]';
			if (
				element?.closest(toggleSelector) ||
				element?.closest('button')?.querySelector(toggleSelector)
			) {
				return;
			}

			onClose();
		},
		[onClose],
	);

	return ReactDOM.createPortal(
		<div style={overlay} className="css-reset" onPointerDown={onPointerDown}>
			<HigherZIndex onEscape={onClose} onOutsideClick={onOutsideClick}>
				<div
					ref={panelRef}
					role="dialog"
					aria-label="Composition browser"
					aria-modal="true"
					tabIndex={-1}
					style={{
						...panel,
						width: sidebarWidth,
						left: 0,
					}}
				>
					{children}
				</div>
			</HigherZIndex>
		</div>,
		getPortal(currentZIndex),
	);
}
