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

	return (
		<div style={row}>
			<MenuItem
				selected={selected === 'file'}
				onItemSelected={itemClicked}
				id="file"
				label="File"
			>
				<MenuSubItem label="Hi there" />
				<MenuSubItem label="hi there" />
			</MenuItem>
			<MenuItem
				selected={selected === 'help'}
				onItemSelected={itemClicked}
				id="help"
				label="Help"
			>
				<MenuSubItem label="Hi there" />
				<MenuSubItem label="hi there" />
			</MenuItem>
		</div>
	);
};
