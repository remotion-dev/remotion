import type {KeyboardEvent, MouseEvent} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {type AnyComposition} from 'remotion';
import {
	BACKGROUND,
	LIGHT_TEXT,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';
import {ModalsContext} from '../state/modals';
import {CompositionContextButton} from './CompositionContextButton';
import {ContextMenu} from './ContextMenu';
import {Row, Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {SidebarRenderButton} from './SidebarRenderButton';

const COMPOSITION_ITEM_HEIGHT = 32;

const itemStyle: React.CSSProperties = {
	paddingRight: 10,
	paddingTop: 6,
	paddingBottom: 6,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
	appearance: 'none',
	border: 'none',
	width: '100%',
	textAlign: 'left',
	backgroundColor: BACKGROUND,
	height: COMPOSITION_ITEM_HEIGHT,
};

const labelStyle: React.CSSProperties = {
	textAlign: 'left',
	textDecoration: 'none',
	fontSize: 13,
	flex: 1,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const iconStyle: React.CSSProperties = {
	width: 18,
	height: 18,
	flexShrink: 0,
};

export type CompositionSelectorItemType =
	| {
			key: string;
			type: 'composition';
			composition: AnyComposition;
	  }
	| {
			key: string;
			type: 'folder';
			folderName: string;
			parentName: string | null;
			items: CompositionSelectorItemType[];
			expanded: boolean;
	  };

export const CompositionSelectorItem: React.FC<{
	readonly item: CompositionSelectorItemType;
	readonly currentComposition: string | null;
	readonly tabIndex: number;
	readonly selectComposition: (c: AnyComposition, push: boolean) => void;
	readonly toggleFolder: (
		folderName: string,
		parentName: string | null,
	) => void;
	readonly level: number;
}> = ({
	item,
	level,
	currentComposition,
	tabIndex,
	selectComposition,
	toggleFolder,
}) => {
	const selected = useMemo(() => {
		if (item.type === 'composition') {
			return currentComposition === item.composition.id;
		}

		return false;
	}, [item, currentComposition]);
	const [hovered, setHovered] = useState(false);
	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...itemStyle,
			backgroundColor: getBackgroundFromHoverState({hovered, selected}),
			paddingLeft: 12 + level * 8,
		};
	}, [hovered, level, selected]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: selected || hovered ? 'white' : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const onClick = useCallback(
		(evt: MouseEvent | KeyboardEvent<HTMLAnchorElement>) => {
			evt.preventDefault();
			if (item.type === 'composition') {
				selectComposition(item.composition, true);
			} else {
				toggleFolder(item.folderName, item.parentName);
			}
		},
		[item, selectComposition, toggleFolder],
	);

	const onKeyPress = useCallback(
		(evt: React.KeyboardEvent<HTMLAnchorElement>) => {
			if (evt.key === 'Enter') {
				onClick(evt);
			}
		},
		[onClick],
	);

	const {setSelectedModal} = useContext(ModalsContext);

	const contextMenu = useMemo((): ComboboxValue[] => {
		if (item.type === 'composition') {
			return [
				{
					id: 'duplicate',
					keyHint: null,
					label: `Duplicate...`,
					leftItem: null,
					onClick: () => {
						setSelectedModal({
							type: 'duplicate-comp',
							compositionId: item.composition.id,
							compositionType:
								item.composition.durationInFrames === 1
									? 'still'
									: 'composition',
						});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: 'duplicate',
				},
				{
					id: 'rename',
					keyHint: null,
					label: `Rename...`,
					leftItem: null,
					onClick: () => {
						setSelectedModal({
							type: 'rename-comp',
							compositionId: item.composition.id,
						});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: 'rename',
				},
				{
					id: 'delete',
					keyHint: null,
					label: `Delete...`,
					leftItem: null,
					onClick: () => {
						setSelectedModal({
							type: 'delete-comp',
							compositionId: item.composition.id,
						});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: 'delete',
				},
				{
					type: 'divider',
					id: 'copy-id-divider',
				},
				{
					id: 'copy-id',
					keyHint: null,
					label: `Copy ID`,
					leftItem: null,
					onClick: () => {
						navigator.clipboard
							.writeText(item.composition.id)
							.catch((err) => {
								showNotification(
									`Could not copy to clipboard: ${err.message}`,
									1000,
								);
							})
							.then(() => {
								showNotification('Copied to clipboard', 1000);
							});
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: 'remove',
				},
			];
		}

		return [];
	}, [item, setSelectedModal]);

	if (item.type === 'folder') {
		return (
			<>
				<button
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					tabIndex={tabIndex}
					onClick={onClick}
					type="button"
					title={item.folderName}
				>
					{item.expanded ? (
						<ExpandedFolderIcon
							style={iconStyle}
							color={hovered || selected ? 'white' : LIGHT_TEXT}
						/>
					) : (
						<CollapsedFolderIcon
							color={hovered || selected ? 'white' : LIGHT_TEXT}
							style={iconStyle}
						/>
					)}
					<Spacing x={1} />
					<div style={label}>{item.folderName}</div>
				</button>
				{item.expanded
					? item.items.map((childItem) => {
							return (
								<CompositionSelectorItem
									key={childItem.key + childItem.type}
									currentComposition={currentComposition}
									selectComposition={selectComposition}
									item={childItem}
									tabIndex={tabIndex}
									level={level + 1}
									toggleFolder={toggleFolder}
								/>
							);
						})
					: null}
			</>
		);
	}

	return (
		<ContextMenu values={contextMenu}>
			<Row align="center">
				<a
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					tabIndex={tabIndex}
					onClick={onClick}
					onKeyPress={onKeyPress}
					type="button"
					title={item.composition.id}
					className="__remotion-composition"
					data-compname={item.composition.id}
				>
					{isCompositionStill(item.composition) ? (
						<StillIcon
							color={hovered || selected ? 'white' : LIGHT_TEXT}
							style={iconStyle}
						/>
					) : (
						<FilmIcon
							color={hovered || selected ? 'white' : LIGHT_TEXT}
							style={iconStyle}
						/>
					)}
					<Spacing x={1} />
					<div style={label}>{item.composition.id}</div>
					<Spacing x={0.5} />
					<CompositionContextButton values={contextMenu} visible={hovered} />
					<SidebarRenderButton
						visible={hovered}
						composition={item.composition}
					/>
				</a>
			</Row>
		</ContextMenu>
	);
};
