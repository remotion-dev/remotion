import React, {useCallback, useMemo, useState} from 'react';
import {BACKGROUND} from '../helpers/colors';
import {useMenuStructure} from '../helpers/use-menu-structure';
import {Row} from './layout';
import type {MenuId} from './Menu/MenuItem';
import {MenuItem} from './Menu/MenuItem';
import {MenuBuildIndicator} from './MenuBuildIndicator';
import {UpdateCheck} from './UpdateCheck';

const row: React.CSSProperties = {
	alignItems: 'center',
	flexDirection: 'row',
	display: 'flex',
	color: 'white',
	borderBottom: '1px solid black',
	fontSize: 13,
	paddingLeft: 6,
	paddingRight: 10,
	backgroundColor: BACKGROUND,
};

const flex: React.CSSProperties = {
	flex: 1,
};

export const MenuToolbar: React.FC = () => {
	const [selected, setSelected] = useState<MenuId | null>(null);

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

	const closeMenu = useCallback(() => {
		setSelected(null);
	}, []);

	const structure = useMenuStructure(closeMenu);

	const menus = useMemo(() => {
		return structure.map((s) => s.id);
	}, [structure]);

	const onPreviousMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			return menus[(menus.indexOf(s) + 1) % menus.length];
		});
	}, [menus]);

	const onNextMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			if (menus.indexOf(s) === 0) {
				return menus[menus.length - 1];
			}

			return menus[(menus.indexOf(s) - 1) % menus.length];
		});
	}, [menus]);

	const onItemQuit = useCallback(() => {
		setSelected(null);
	}, [setSelected]);

	return (
		<Row align="center" className="css-reset" style={row}>
			{structure.map((s) => {
				return (
					<MenuItem
						key={s.id}
						selected={selected === s.id}
						onItemSelected={itemClicked}
						onItemHovered={itemHovered}
						id={s.id}
						label={s.label}
						onItemQuit={onItemQuit}
						menu={s}
						onPreviousMenu={onPreviousMenu}
						onNextMenu={onNextMenu}
						leaveLeftPadding={s.leaveLeftPadding}
					/>
				);
			})}
			<UpdateCheck />
			<div style={flex} />
			<MenuBuildIndicator />
		</Row>
	);
};
