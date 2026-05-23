import type {KeyboardEvent, MouseEvent} from 'react';
import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {type _InternalTypes} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	BACKGROUND,
	LIGHT_TEXT,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {noop} from '../helpers/noop';
import {
	markCompositionSidebarScrollFromRowClick,
	maybeScrollCompositionSidebarRowIntoView,
} from '../helpers/sidebar-scroll-into-view';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {StillIcon} from '../icons/still';
import {FilmIcon} from '../icons/video';
import {ModalsContext} from '../state/modals';
import {getCompositionMenuItems} from './composition-menu-items';
import {CompositionContextButton} from './CompositionContextButton';
import {ContextMenu} from './ContextMenu';
import {Row, Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {SidebarRenderButton} from './SidebarRenderButton';
import {useResolvedStack} from './Timeline/use-resolved-stack';

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
	userSelect: 'none',
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
			composition: _InternalTypes['AnyComposition'];
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
	readonly selectComposition: (
		c: _InternalTypes['AnyComposition'],
		push: boolean,
	) => void;
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

	const compositionRowRef = useRef<HTMLAnchorElement>(null);
	const compositionId =
		item.type === 'composition' ? item.composition.id : null;
	useLayoutEffect(() => {
		if (compositionId === null) {
			return;
		}

		maybeScrollCompositionSidebarRowIntoView({
			element: compositionRowRef.current,
			compositionId,
			selected,
		});
	}, [compositionId, selected]);

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
				markCompositionSidebarScrollFromRowClick(item.composition.id);
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
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const resolvedLocation = useResolvedStack(
		item.type === 'composition' ? item.composition.stack : null,
	);

	const contextMenu = useMemo((): ComboboxValue[] => {
		if (item.type === 'composition') {
			return getCompositionMenuItems({
				closeMenu: noop,
				composition: item.composition,
				connectionStatus,
				resolvedLocation,
				setSelectedModal,
				readOnlyStudio: Boolean(window.remotion_isReadOnlyStudio),
			});
		}

		return [];
	}, [connectionStatus, item, resolvedLocation, setSelectedModal]);

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
					ref={compositionRowRef}
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
