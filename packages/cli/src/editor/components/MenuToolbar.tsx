import React, {useCallback, useState} from 'react';
import {FONT_FAMILY} from '../helpers/font';
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

export const MenuToolbar: React.FC = () => {
	const [selected, setSelected] = useState<MenuId | null>(null);

	const itemClicked = useCallback((itemId: MenuId) => {
		setSelected((currentItem) => {
			if (currentItem === itemId) {
				return null;
			}

			return itemId;
		});
	}, []);

	const itemHovered = useCallback(
		(itemId: MenuId) => {
			if (selected) {
				setSelected(itemId);
			}
		},
		[selected]
	);

	return (
		<div style={row}>
			<MenuItem
				selected={selected === 'remotion'}
				onItemSelected={itemClicked}
				onItemHovered={itemHovered}
				id="remotion"
				label="Remotion"
			>
				<MenuSubItem label="About Remotion" />
				<MenuSubItem label="hi there" />
			</MenuItem>
			<MenuItem
				selected={selected === 'file'}
				onItemSelected={itemClicked}
				onItemHovered={itemHovered}
				id="file"
				label="Video"
			>
				<MenuSubItem label="New composition" />
				<MenuSubItem label="Render..." />
			</MenuItem>
			<MenuItem
				selected={selected === 'help'}
				onItemSelected={itemClicked}
				onItemHovered={itemHovered}
				id="help"
				label="Help"
			>
				<MenuSubItem label="Documentation" />
				<MenuSubItem label="File an issue" />
				<MenuSubItem label="Join Discord community" />
				<hr />
				<MenuSubItem label="Instagram" />
				<MenuSubItem label="Twitter" />
				<MenuSubItem label="TikTok" />
			</MenuItem>
		</div>
	);
};
