import {PlayerInternals} from '@remotion/player';
import type {SetStateAction} from 'react';
import React, {useCallback, useMemo, useRef} from 'react';
import ReactDOM from 'react-dom';
import {
	WHITE,
	WHITE_ALPHA_80,
	getBackgroundFromHoverState,
} from '../../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../../helpers/hoverable';
import {startPointerSession} from '../../helpers/pointer-session';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {MenuContent} from '../NewComposition/MenuContent';
import {MENU_INITIATOR_CLASSNAME, isMenuItem} from './is-menu-item';
import {getPortal} from './portals';
import {menuContainerTowardsBottom, outerPortal} from './styles';

const container: React.CSSProperties = {
	fontSize: 13,
	paddingLeft: 10,
	paddingRight: 10,
	cursor: 'default',
	paddingTop: 6,
	paddingBottom: 6,
	userSelect: 'none',
	WebkitUserSelect: 'none',
	border: 'none',
};

export type MenuId =
	| 'remotion'
	| 'file'
	| 'view'
	| 'composition'
	| 'tools'
	| 'help';

export type Menu = {
	id: MenuId;
	label: React.ReactNode;
	items: ComboboxValue[];
	leaveLeftPadding: boolean;
};

export const MenuItem: React.FC<{
	readonly label: React.ReactNode;
	readonly id: MenuId;
	readonly selected: boolean;
	readonly onItemSelected: (s: SetStateAction<string | null>) => void;
	readonly onItemHovered: (id: MenuId) => void;
	readonly onItemQuit: () => void;
	readonly onPreviousMenu: () => void;
	readonly onNextMenu: () => void;
	readonly menu: Menu;
	readonly leaveLeftPadding: boolean;
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
	const ref = useRef<HTMLButtonElement>(null);
	const size = PlayerInternals.useElementSize(ref, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const {tabIndex, currentZIndex} = useZIndex();

	const containerStyle = useMemo((): React.CSSProperties => {
		return {
			...container,
			...hoverableStyle({
				idleBackground: getBackgroundFromHoverState({
					hovered: false,
					selected,
				}),
				hoverBackground: getBackgroundFromHoverState({
					hovered: true,
					selected,
				}),
				idleColor: selected ? WHITE : WHITE_ALPHA_80,
				hoverColor: WHITE,
			}),
		};
	}, [selected]);

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

	// Not for styling (which is done via CSS :hover), but for switching
	// between menus when a menu is already open.
	const onPointerEnter = useCallback(() => {
		onItemHovered(id);
	}, [id, onItemHovered]);

	const onPointerDown: React.PointerEventHandler<HTMLButtonElement> =
		useCallback(
			(e) => {
				// Prevent deselection of currently selected items
				e.stopPropagation();
				if (e.button !== 0) {
					return;
				}

				onItemSelected(id);

				startPointerSession({
					event: e.nativeEvent,
					target: e.currentTarget,
					onEnd: (reason, evt) => {
						if (
							(reason === 'pointerup' || reason === 'buttons-released') &&
							evt
						) {
							const target = document.elementFromPoint(
								evt.clientX,
								evt.clientY,
							);
							if (!target || !isMenuItem(target as HTMLElement)) {
								onItemQuit();
							}
						}
					},
				});
			},
			[id, onItemQuit, onItemSelected],
		);

	const onMenuPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			// Prevent deselection of currently selected items
			e.stopPropagation();
		},
		[],
	);

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
		[id, onItemSelected],
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
				onPointerDown={onPointerDown}
				onClick={onClick}
				style={containerStyle}
				type="button"
				className={`${MENU_INITIATOR_CLASSNAME} ${HOVERABLE_CLASS_NAME}`}
			>
				{itemName}
			</button>
			{portalStyle
				? ReactDOM.createPortal(
						<div className="css-reset" style={outerStyle}>
							<HigherZIndex onEscape={onItemQuit} onOutsideClick={onItemQuit}>
								<div style={portalStyle} onPointerDown={onMenuPointerDown}>
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
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
