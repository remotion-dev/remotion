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
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
	WHITE_ALPHA_12,
} from '../helpers/colors';
import {
	HOVERABLE_CLASS_NAME,
	HOVER_GROUP_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {noop} from '../helpers/noop';
import {
	markCompositionSidebarScrollFromRowClick,
	maybeScrollCompositionSidebarRowIntoView,
} from '../helpers/sidebar-scroll-into-view';
import {CollapsedFolderIcon, ExpandedFolderIcon} from '../icons/folder';
import {SetSelectedModalContext} from '../state/modals';
import {
	compositionDragDataToSymbolicatedStack,
	getCompositionDragPreviewMetadata,
	makeCompositionDragData,
	parseCompositionDragData,
} from './composition-drag-data';
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
import {useEditorOpening} from './use-default-editor-info';

const itemStyle: React.CSSProperties = {
	paddingRight: 2,
	paddingTop: 5,
	paddingBottom: 5,
	fontSize: 13,
	display: 'flex',
	textDecoration: 'none',
	cursor: 'default',
	alignItems: 'center',
	marginBottom: 1,
	marginLeft: 8,
	marginRight: 4,
	appearance: 'none',
	border: 'none',
	borderRadius: 4,
	width: 'calc(100% - 12px)',
	textAlign: 'left',
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
		const idleBackground = dragHovered
			? WHITE_ALPHA_12
			: selected
				? WHITE_ALPHA_06
				: TRANSPARENT;
		return {
			...itemStyle,
			...hoverableStyle({
				idleBackground,
				hoverBackground: dragHovered ? WHITE_ALPHA_12 : WHITE_ALPHA_06,
				idleColor: selected ? WHITE : LIGHT_TEXT,
				hoverColor: WHITE,
			}),
			paddingLeft: 12 + level * 8,
		};
	}, [dragHovered, level, selected]);

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
			if (evt.key === 'Enter') {
				onClick(evt);
			}
		},
		[onClick],
	);

	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const connectionStatus = useContext(StudioServerConnectionCtx)
		.previewServerState.type;
	const {defaultEditorId, defaultEditorName} = useEditorOpening(
		connectionStatus === 'connected',
	);
	const resolvedLocation = useResolvedStack(
		item.type === 'composition' ? item.composition.stack : item.folder.stack,
	);

	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		if (item.type === 'composition') {
			return getCompositionContextMenuItems({
				closeMenu: noop,
				composition: item.composition,
				connectionStatus,
				editorId: defaultEditorId,
				editorName: defaultEditorName,
				includeCompositionManagementItems: true,
				resolvedLocation,
				setSelectedModal,
				readOnlyStudio: window.remotion_isReadOnlyStudio,
			});
		}

		return getFolderMenuItems({
			closeMenu: noop,
			connectionStatus,
			editorId: defaultEditorId,
			editorName: defaultEditorName,
			folder: item.folder,
			resolvedLocation,
			setSelectedModal,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	}, [
		connectionStatus,
		defaultEditorId,
		defaultEditorName,
		item,
		resolvedLocation,
		setSelectedModal,
	]);

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
				width: item.composition.width ?? null,
				height: item.composition.height ?? null,
				durationInFrames: item.composition.durationInFrames ?? null,
			});
			event.dataTransfer.setData(dragData.mimeType, dragData.payload);
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
				getCompositionDragPreviewMetadata(event.dataTransfer.types) === null
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
				getCompositionDragPreviewMetadata(event.dataTransfer.types) === null
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

			const compositionDragData = parseCompositionDragData(event.dataTransfer);
			if (compositionDragData === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			clearRootDragHover();
			setDragHovered(false);

			const isAlreadyDirectChild = item.items.some((child) => {
				return (
					child.type === 'composition' &&
					child.composition.id === compositionDragData.compositionId
				);
			});
			if (isAlreadyDirectChild) {
				return;
			}

			const notification = showNotification(
				`Moving ${compositionDragData.compositionId}...`,
				null,
			);
			const controller = new AbortController();

			try {
				const result = await applyCodemod({
					codemod: {
						type: 'move-composition-to-folder',
						idToMove: compositionDragData.compositionId,
						folderName: item.folderName,
						parentName: item.parentName,
					},
					dryRun: false,
					signal: controller.signal,
					symbolicatedStack:
						compositionDragDataToSymbolicatedStack(compositionDragData),
				});

				if (result.success) {
					notification.dismiss();
				} else {
					notification.replaceContent(result.reason, 4000);
				}

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
				<ContextMenu getItems={getContextMenuItems}>
					<Row align="center">
						<div
							style={style}
							className={`__remotion-composition-selector-item ${HOVERABLE_CLASS_NAME} ${HOVER_GROUP_CLASS_NAME}`}
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
								<ExpandedFolderIcon style={iconStyle} color={CURRENT_COLOR} />
							) : (
								<CollapsedFolderIcon color={CURRENT_COLOR} style={iconStyle} />
							)}
							<Spacing x={1} />
							<div style={labelStyle}>{item.folderName}</div>
							<Spacing x={0.5} />
							<CompositionContextButton
								getItems={getContextMenuItems}
								visible
								readOnlyStudio={window.remotion_isReadOnlyStudio}
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
		<ContextMenu getItems={getContextMenuItems}>
			<Row align="center">
				<a
					ref={compositionRowRef}
					style={style}
					tabIndex={tabIndex}
					onClick={onClick}
					onKeyDown={onKeyDown}
					draggable={!window.remotion_isReadOnlyStudio}
					onDragStart={onCompositionDragStart}
					onDragEnd={onCompositionDragEnd}
					type="button"
					title={item.composition.id}
					className={`__remotion-composition __remotion-composition-selector-item ${HOVERABLE_CLASS_NAME} ${HOVER_GROUP_CLASS_NAME}`}
					data-compname={item.composition.id}
				>
					<CompositionOrStillIcon
						composition={item.composition}
						color={CURRENT_COLOR}
						style={iconStyle}
					/>
					<Spacing x={1} />
					<div style={labelStyle}>{item.composition.id}</div>
					<Spacing x={0.5} />
					<CompositionContextButton
						getItems={getContextMenuItems}
						visible={!isDragging}
						readOnlyStudio={window.remotion_isReadOnlyStudio}
					/>
					<SidebarRenderButton
						visible={!isDragging}
						composition={item.composition}
						readOnlyStudio={window.remotion_isReadOnlyStudio}
					/>
				</a>
			</Row>
		</ContextMenu>
	);
};
