import type {SetStateAction} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
import {BACKGROUND} from '../helpers/colors';
import {useMobileLayout} from '../helpers/mobile-layout';
import {useMenuStructure} from '../helpers/use-menu-structure';
import type {MenuId} from './Menu/MenuItem';
import {MenuItem} from './Menu/MenuItem';
import {MenuBuildIndicator} from './MenuBuildIndicator';
import {SidebarCollapserControls} from './SidebarCollapserControls';
import {UpdateCheck} from './UpdateCheck';
import {Row, Spacing} from './layout';

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

export const MenuToolbar: React.FC<{
	readonly readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const [selected, setSelected] = useState<string | null>(null);

	const mobileLayout = useMobileLayout();

	const fixedWidthRight: React.CSSProperties = useMemo(() => {
		return {
			...(mobileLayout
				? {width: 'fit-content'}
				: {
						width: '330px',
					}),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-end',
		};
	}, [mobileLayout]);

	const fixedWidthLeft: React.CSSProperties = useMemo(() => {
		return {
			...(mobileLayout
				? {minWidth: '0px'}
				: {
						minWidth: '330px',
					}),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-start',
		};
	}, [mobileLayout]);

	const itemClicked = useCallback(
		(itemId: SetStateAction<string | null>) => {
			setSelected(itemId);
		},
		[setSelected],
	);

	const itemHovered = useCallback(
		(itemId: MenuId) => {
			if (selected) {
				setSelected(itemId);
			}
		},
		[selected, setSelected],
	);

	const closeMenu = useCallback(() => {
		setSelected(null);
	}, []);

	const structure = useMenuStructure(closeMenu, readOnlyStudio);

	const menus = useMemo(() => {
		return structure.map((s) => s.id);
	}, [structure]);

	const onPreviousMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			return menus[(menus.indexOf(s as MenuId) + 1) % menus.length];
		});
	}, [menus]);

	const onNextMenu = useCallback(() => {
		setSelected((s) => {
			if (s === null) {
				return null;
			}

			if (menus.indexOf(s as MenuId) === 0) {
				return menus[menus.length - 1];
			}

			return menus[(menus.indexOf(s as MenuId) - 1) % menus.length];
		});
	}, [menus]);

	const onItemQuit = useCallback(() => {
		setSelected(null);
	}, [setSelected]);

	return (
		<Row align="center" className="css-reset" style={row}>
			<div style={fixedWidthLeft}>
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
				{readOnlyStudio ? null : <UpdateCheck />}
			</div>
			<div style={flex} />
			<MenuBuildIndicator />
			<div style={flex} />
			<div style={fixedWidthRight}>
				<SidebarCollapserControls />
			</div>
			<Spacing x={1} />
		</Row>
	);
};
