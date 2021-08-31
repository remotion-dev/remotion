import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {FONT_FAMILY} from '../helpers/font';
import {setGlobalMenuId} from '../state/global-menu-id';
import {
	isClickInsideMenuStructure,
	MENU_ITEMS_CONTAINER,
} from './Menu/is-menu-click';
import {MenuId, MenuItem} from './Menu/MenuItem';
import {MenuSubItem} from './Menu/MenuSubItem';

const row: React.CSSProperties = {
	alignItems: 'center',
	flexDirection: 'row',
	display: 'flex',
	color: 'white',
	borderBottom: '1px solid black',

	fontFamily: FONT_FAMILY,
	fontSize: 13,
	paddingLeft: 6,
};

const menus: MenuId[] = ['remotion', 'file', 'help'];

export const MenuToolbar: React.FC = () => {
	const [selected, setSelected] = useState<MenuId | null>(null);

	useLayoutEffect(() => {
		setGlobalMenuId(selected);
	}, [selected]);

	const itemClicked = useCallback(
		(itemId: MenuId) => {
			setSelected(itemId);
		},
		[setSelected]
	);

	const itemHovered = useCallback(
		(itemId: MenuId) => {
			if (selected) {
				setSelected(itemId);
			}
		},
		[selected, setSelected]
	);

	const onKeyPress = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') {
				setSelected((s) => {
					if (s === null) {
						return null;
					}

					return menus[(menus.indexOf(s) + 1) % menus.length];
				});
			}

			if (e.key === 'ArrowLeft') {
				setSelected((s) => {
					if (s === null) {
						return null;
					}

					if (menus.indexOf(s) === 0) {
						return menus[menus.length - 1];
					}

					return menus[(menus.indexOf(s) - 1) % menus.length];
				});
			}

			if (e.key === 'Escape') {
				setSelected(null);
				(document.activeElement as HTMLElement).blur();
			}
		},
		[setSelected]
	);

	const onPointerDown: EventListenerOrEventListenerObject = useCallback(
		(e) => {
			const {target} = e;
			if (selected === null || !target) {
				return;
			}

			if (isClickInsideMenuStructure(target as HTMLElement)) {
				return;
			}

			setSelected(null);
		},
		[selected]
	);

	useEffect(() => {
		if (selected === null) {
			return;
		}

		window.addEventListener('keydown', onKeyPress);
		window.addEventListener('pointerdown', onPointerDown);
		return () => {
			window.removeEventListener('keydown', onKeyPress);
			window.removeEventListener('pointerdown', onPointerDown);
		};
	}, [onKeyPress, onPointerDown, selected]);

	const renderMenu = useCallback((id: MenuId) => {
		if (id === 'remotion') {
			return (
				<>
					<MenuSubItem label="About Remotion" />
					<MenuSubItem label="License" />
				</>
			);
		}

		if (id === 'file') {
			return (
				<>
					<MenuSubItem label="New composition" />
					<MenuSubItem label="Render..." />
				</>
			);
		}

		if (id === 'help') {
			return (
				<>
					<MenuSubItem label="Documentation" />
					<MenuSubItem label="File an issue" />
					<MenuSubItem label="Join Discord community" />
					<hr />
					<MenuSubItem label="Instagram" />
					<MenuSubItem label="Twitter" />
					<MenuSubItem label="TikTok" />
				</>
			);
		}

		throw new Error('menu item not implemented');
	}, []);

	const renderLabel = useCallback((id: MenuId) => {
		if (id === 'file') {
			return 'File';
		}

		if (id === 'help') {
			return 'Help';
		}

		if (id === 'remotion') {
			return 'Remotion';
		}

		throw new Error('menu item not implemented');
	}, []);

	const onKeyboardUnfocused = useCallback(() => {
		setSelected(null);
	}, [setSelected]);

	const onItemFocused = useCallback(
		(item: MenuId) => {
			setSelected(item);
		},
		[setSelected]
	);

	const onKeyboardTabEndReached = useCallback(() => {
		setSelected(null);
	}, []);

	return (
		<div style={row}>
			<div className={MENU_ITEMS_CONTAINER}>
				{menus.map((mId) => {
					return (
						<MenuItem
							key={mId}
							selected={selected === mId}
							onItemSelected={itemClicked}
							onItemHovered={itemHovered}
							id={mId}
							label={renderLabel(mId)}
							onItemFocused={onItemFocused}
							onItemQuit={onKeyboardUnfocused}
						>
							{renderMenu(mId)}
						</MenuItem>
					);
				})}
			</div>
			{selected === null ? null : (
				// If this element gets focused, the user has tabbed through all menus,
				// unfocusing the menu
				<div tabIndex={0} onFocus={onKeyboardTabEndReached} />
			)}
		</div>
	);
};
