import {
	COMPOSITION_DRAG_MIME_TYPE,
	makeCompositionDragData,
	parseCompositionDragData,
	setDragPreviewMetadata,
} from '@remotion/drag-and-drop';
import {compositionDragDataToSymbolicatedStack} from '@remotion/studio-shared';
import type {DragEvent, KeyboardEvent, MouseEvent} from 'react';
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
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
	WHITE_ALPHA_12,
} from '../helpers/colors';
import {getFolderId} from '../helpers/get-folder-id';
import {noop} from '../helpers/noop';
import {
	markCompositionSidebarScrollFromRowClick,
	maybeScrollCompositionSidebarRowIntoView,
} from '../helpers/sidebar-scroll-into-view';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {ModalsContext} from '../state/modals';
import {getCompositionContextMenuItems} from './composition-menu-items';
import {CompositionContextButton} from './CompositionContextButton';
import {CompositionOrStillIcon} from './CompositionOrStillIcon';
import {ContextMenu} from './ContextMenu';
import {getFolderMenuItems} from './folder-menu-items';
import {COMPACT_CONTROL_ROW_HEIGHT, Row, Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {applyCodemod} from './RenderQueue/actions';
import {SidebarRenderButton} from './SidebarRenderButton';
import {useResolvedStack} from './Timeline/use-resolved-stack';

const itemStyle: React.CSSProperties = {
	paddingRight: 10,
	paddingTop: 5,
	paddingBottom: 5,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
	marginLeft: 4,
	marginRight: 4,
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	width: 'calc(100% - 8px)',
	textAlign: 'left',
	backgroundColor: BACKGROUND,
	height: COMPACT_CONTROL_ROW_HEIGHT,
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
			folder: _InternalTypes['TFolder'];
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
	readonly clearRootDragHover: () => void;
	readonly level: number;
}> = ({
	item,
	level,
	currentComposition,
	tabIndex,
	selectComposition,
	toggleFolder,
	clearRootDragHover,
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
	const [isDragging, setIsDragging] = useState(false);
	const [dragHovered, setDragHovered] = useState(false);

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
			backgroundColor: dragHovered
				? WHITE_ALPHA_12
				: hovered || selected
					? WHITE_ALPHA_06
					: TRANSPARENT,
			paddingLeft: 12 + level * 8,
		};
	}, [dragHovered, hovered, level, selected]);

	const label = useMemo(() => {
		return {
			...labelStyle,
			color: selected || hovered ? WHITE : LIGHT_TEXT,
		};
	}, [hovered, selected]);

	const onClick = useCallback(
		(evt: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
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

	const onKeyDown = useCallback(
		(evt: React.KeyboardEvent<HTMLElement>) => {
			if (evt.key === 'Enter' || evt.key === ' ') {
				onClick(evt);
			}
		},
		[onClick],
	);

	const {setSelectedModal} = useContext(ModalsContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const resolvedLocation = useResolvedStack(
		item.type === 'composition' ? item.composition.stack : item.folder.stack,
	);

	const contextMenu = useMemo((): ComboboxValue[] => {
		if (item.type === 'composition') {
			return getCompositionContextMenuItems({
				closeMenu: noop,
				composition: item.composition,
				connectionStatus,
				includeCompositionManagementItems: true,
				resolvedLocation,
				setSelectedModal,
				readOnlyStudio: window.remotion_isReadOnlyStudio,
			});
		}

		return getFolderMenuItems({
			closeMenu: noop,
			connectionStatus,
			folder: item.folder,
			resolvedLocation,
			setSelectedModal,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	}, [connectionStatus, item, resolvedLocation, setSelectedModal]);

	const onCompositionDragStart = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (item.type !== 'composition' || window.remotion_isReadOnlyStudio) {
				event.preventDefault();
				return;
			}

			setIsDragging(true);
			event.dataTransfer.effectAllowed = 'copyMove';
			const dragData = makeCompositionDragData({
				compositionFile: resolvedLocation?.source ?? null,
				compositionId: item.composition.id,
				width: item.composition.width,
				height: item.composition.height,
				durationInFrames: item.composition.durationInFrames,
			});
			event.dataTransfer.setData(
				COMPOSITION_DRAG_MIME_TYPE,
				JSON.stringify(dragData),
			);
			setDragPreviewMetadata(event.dataTransfer, dragData.preview);
		},
		[item, resolvedLocation?.source],
	);
	const onCompositionDragEnd = useCallback(() => {
		setIsDragging(false);
	}, []);

	const onFolderDragOver = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (
				item.type !== 'folder' ||
				window.remotion_isReadOnlyStudio ||
				!Array.from(event.dataTransfer.types).includes(
					COMPOSITION_DRAG_MIME_TYPE,
				)
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			clearRootDragHover();
			setDragHovered(true);
		},
		[clearRootDragHover, item],
	);

	const onFolderDragLeave = useCallback(() => {
		setDragHovered(false);
	}, []);

	const onFolderChildListDragOver = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (
				item.type !== 'folder' ||
				window.remotion_isReadOnlyStudio ||
				!Array.from(event.dataTransfer.types).includes(
					COMPOSITION_DRAG_MIME_TYPE,
				)
			) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			clearRootDragHover();
		},
		[clearRootDragHover, item],
	);

	const onFolderDrop = useCallback(
		async (event: DragEvent<HTMLElement>) => {
			if (item.type !== 'folder' || window.remotion_isReadOnlyStudio) {
				return;
			}

			const raw = event.dataTransfer.getData(COMPOSITION_DRAG_MIME_TYPE);
			const parsed = raw ? parseCompositionDragData(raw) : null;
			if (parsed === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			clearRootDragHover();
			setDragHovered(false);

			const isAlreadyDirectChild = item.items.some((child) => {
				return (
					child.type === 'composition' &&
					child.composition.id === parsed.compositionId
				);
			});
			if (isAlreadyDirectChild) {
				return;
			}

			const folderId = getFolderId({
				folderName: item.folderName,
				parentName: item.parentName,
			});
			const notification = showNotification(
				`Moving ${parsed.compositionId}...`,
				null,
			);
			const controller = new AbortController();

			try {
				const result = await applyCodemod({
					codemod: {
						type: 'move-composition-to-folder',
						idToMove: parsed.compositionId,
						folderName: item.folderName,
						parentName: item.parentName,
					},
					dryRun: false,
					signal: controller.signal,
					symbolicatedStack: compositionDragDataToSymbolicatedStack(parsed),
				});

				notification.replaceContent(
					result.success
						? `Moved ${parsed.compositionId} to ${folderId}`
						: result.reason,
					result.success ? 2000 : 4000,
				);
				if (result.success && !item.expanded) {
					toggleFolder(item.folderName, item.parentName);
				}
			} catch (err) {
				notification.replaceContent(
					err instanceof Error ? err.message : String(err),
					4000,
				);
			}
		},
		[clearRootDragHover, item, toggleFolder],
	);

	if (item.type === 'folder') {
		return (
			<>
				<ContextMenu values={contextMenu} onOpen={null}>
					<Row align="center">
						<div
							style={style}
							className="__remotion-composition-selector-item"
							onPointerEnter={onPointerEnter}
							onPointerLeave={onPointerLeave}
							tabIndex={tabIndex}
							onClick={onClick}
							onKeyDown={onKeyDown}
							onDragOver={onFolderDragOver}
							onDragLeave={onFolderDragLeave}
							onDrop={onFolderDrop}
							title={item.folderName}
							role="button"
						>
							{item.expanded ? (
								<ExpandedFolderIcon
									style={iconStyle}
									color={hovered || selected ? WHITE : LIGHT_TEXT}
								/>
							) : (
								<CollapsedFolderIcon
									color={hovered || selected ? WHITE : LIGHT_TEXT}
									style={iconStyle}
								/>
							)}
							<Spacing x={1} />
							<div style={label}>{item.folderName}</div>
							<Spacing x={0.5} />
							<CompositionContextButton
								values={contextMenu}
								visible={hovered}
							/>
						</div>
					</Row>
				</ContextMenu>
				{item.expanded ? (
					<div onDragOver={onFolderChildListDragOver} onDrop={onFolderDrop}>
						{item.items.map((childItem) => {
							return (
								<CompositionSelectorItem
									key={childItem.key + childItem.type}
									currentComposition={currentComposition}
									selectComposition={selectComposition}
									item={childItem}
									tabIndex={tabIndex}
									level={level + 1}
									toggleFolder={toggleFolder}
									clearRootDragHover={clearRootDragHover}
								/>
							);
						})}
					</div>
				) : null}
			</>
		);
	}

	return (
		<ContextMenu values={contextMenu} onOpen={null}>
			<Row align="center">
				<a
					ref={compositionRowRef}
					style={style}
					onPointerEnter={onPointerEnter}
					onPointerLeave={onPointerLeave}
					tabIndex={tabIndex}
					onClick={onClick}
					onKeyDown={onKeyDown}
					draggable={!window.remotion_isReadOnlyStudio}
					onDragStart={onCompositionDragStart}
					onDragEnd={onCompositionDragEnd}
					type="button"
					title={item.composition.id}
					className="__remotion-composition __remotion-composition-selector-item"
					data-compname={item.composition.id}
				>
					<CompositionOrStillIcon
						composition={item.composition}
						color={hovered || selected ? WHITE : LIGHT_TEXT}
						style={iconStyle}
					/>
					<Spacing x={1} />
					<div style={label}>{item.composition.id}</div>
					<Spacing x={0.5} />
					<CompositionContextButton
						values={contextMenu}
						visible={hovered && !isDragging}
					/>
					<SidebarRenderButton
						visible={hovered && !isDragging}
						composition={item.composition}
					/>
				</a>
			</Row>
		</ContextMenu>
	);
};
