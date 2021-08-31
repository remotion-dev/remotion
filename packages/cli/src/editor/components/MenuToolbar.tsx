import React, {useCallback, useContext, useEffect} from 'react';
import {FONT_FAMILY} from '../helpers/font';
import {MenuToolbarSelectionContext} from '../state/menu-selection';
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
	const {selected, setSelected} = useContext(MenuToolbarSelectionContext);

	const itemClicked = useCallback(
		(itemId: MenuId) => {
			setSelected((currentItem) => {
				if (currentItem === itemId) {
					return null;
				}

				return itemId;
			});
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
				return setSelected(null);
			}
		},
		[setSelected]
	);

	useEffect(() => {
		if (selected === null) {
			return;
		}

		window.addEventListener('keydown', onKeyPress);
		return () => window.removeEventListener('keydown', onKeyPress);
	}, [onKeyPress, selected]);

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

	return (
		<div style={row}>
			{menus.map((mId) => {
				return (
					<MenuItem
						key={mId}
						selected={selected === mId}
						onItemSelected={itemClicked}
						onItemHovered={itemHovered}
						id={mId}
						label={renderLabel(mId)}
						onKeyboardUnfocused={onKeyboardUnfocused}
					>
						{renderMenu(mId)}
					</MenuItem>
				);
			})}
		</div>
	);
};
