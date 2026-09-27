import React, {useContext, useMemo} from 'react';
import {useKeyboardShortcutLabel} from '../helpers/use-keyboard-shortcut-label';
import {
	getFileMenu,
	getRenderMenuItems,
	useCurrentCompositionMenuData,
	useMenuStructure,
} from '../helpers/use-menu-structure';
import {SetSelectedModalContext} from '../state/modals';
import {getCompositionMenuItems} from './composition-menu-items';
import type {Menu} from './Menu/MenuItem';
import {MenuItem} from './Menu/MenuItem';
import {useOpenInMenuApps} from './use-open-in-menu-apps';

type ToolbarMenuItemProps = Omit<
	React.ComponentProps<typeof MenuItem>,
	'menu' | 'label' | 'id' | 'leaveLeftPadding'
> & {
	readonly closeMenu: () => void;
	readonly readOnlyStudio: boolean;
};

export const FileToolbarMenuItem: React.FC<ToolbarMenuItemProps> = React.memo(
	({closeMenu, readOnlyStudio, ...menuItemProps}) => {
		const {setSelectedModal} = useContext(SetSelectedModalContext);
		const {connectionStatus, openInApps} = useOpenInMenuApps();
		const menu = useMemo(
			() =>
				getFileMenu({
					readOnlyStudio,
					closeMenu,
					editorId: openInApps.defaultEditorId,
					editorName: openInApps.defaultEditorName,
					previewServerState: connectionStatus,
					setSelectedModal,
				}),
			[
				readOnlyStudio,
				closeMenu,
				openInApps.defaultEditorId,
				openInApps.defaultEditorName,
				connectionStatus,
				setSelectedModal,
			],
		);

		if (menu === null) {
			return null;
		}

		return (
			<MenuItem
				{...menuItemProps}
				id={menu.id}
				label={menu.label}
				leaveLeftPadding={menu.leaveLeftPadding}
				menu={menu}
			/>
		);
	},
);

export const CompositionToolbarMenuItem: React.FC<ToolbarMenuItemProps> =
	React.memo(({closeMenu, readOnlyStudio, ...menuItemProps}) => {
		const {currentComposition, resolvedCompositionLocation} =
			useCurrentCompositionMenuData();
		const {connectionStatus, openInApps} = useOpenInMenuApps();
		const {setSelectedModal} = useContext(SetSelectedModalContext);
		const renderShortcut = useKeyboardShortcutLabel('render');
		const menu = useMemo(
			(): Menu => ({
				id: 'composition',
				label: 'Composition',
				leaveLeftPadding: false,
				items: [
					...getRenderMenuItems({
						closeMenu,
						previewServerState: connectionStatus,
						readOnlyStudio,
						renderShortcut,
						compositionSelected: currentComposition !== null,
					}),
					...getCompositionMenuItems({
						closeMenu,
						composition: currentComposition,
						connectionStatus,
						includeCompositionManagementItems: true,
						openInApps,
						resolvedLocation: resolvedCompositionLocation,
						setSelectedModal,
						readOnlyStudio,
					}),
				],
			}),
			[
				closeMenu,
				connectionStatus,
				readOnlyStudio,
				renderShortcut,
				currentComposition,
				openInApps,
				resolvedCompositionLocation,
				setSelectedModal,
			],
		);

		return (
			<MenuItem
				{...menuItemProps}
				id={menu.id}
				label={menu.label}
				leaveLeftPadding={menu.leaveLeftPadding}
				menu={menu}
			/>
		);
	});

export const MobileToolbarMenuItem: React.FC<ToolbarMenuItemProps> = React.memo(
	({closeMenu, readOnlyStudio, ...menuItemProps}) => {
		const structure = useMenuStructure(closeMenu, readOnlyStudio);
		const menu = structure[0];

		return (
			<MenuItem
				{...menuItemProps}
				id={menu.id}
				label={menu.label}
				leaveLeftPadding={menu.leaveLeftPadding}
				menu={menu}
			/>
		);
	},
);
