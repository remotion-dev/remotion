import type {CompositionOrFolder, RecastCodemod} from '@remotion/studio-shared';
import type {
	DragEvent,
	KeyboardEvent,
	MouseEvent,
	MutableRefObject,
} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {type _InternalTypes} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TIMELINE_BLUE,
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
import {makeCompositionDragData} from './composition-drag-data';
import {getCompositionContextMenuItems} from './composition-menu-items';
import {
	type CompositionSelectorActiveDrag,
	compositionSelectorDragDataToSymbolicatedStack,
	hasCompositionSelectorDragData,
	makeCompositionSelectorDragData,
	parseCompositionSelectorDragData,
	type CompositionSelectorDragData,
} from './composition-selector-drag-data';
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

const reorderWrapper: React.CSSProperties = {
	position: 'relative',
};

const reorderLineBase: React.CSSProperties = {
	backgroundColor: TIMELINE_BLUE,
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const folderAutoExpansionDelay = 700;

type DropPosition = 'before' | 'inside' | 'after';

const itemToDescriptor = (
	item: CompositionSelectorItemType,
): CompositionOrFolder => {
	return item.type === 'composition'
		? {type: 'composition', compositionId: item.composition.id}
		: {
				type: 'folder',
				folderName: item.folderName,
				parentName: item.parentName,
			};
};

const itemsAreEqual = (
	left: CompositionOrFolder,
	right: CompositionOrFolder,
) => {
	if (left.type === 'composition') {
		return (
			right.type === 'composition' && left.compositionId === right.compositionId
		);
	}

	return (
		right.type === 'folder' &&
		left.folderName === right.folderName &&
		left.parentName === right.parentName
	);
};

const getFolderPath = ({
	folderName,
	parentName,
}: {
	readonly folderName: string;
	readonly parentName: string | null;
}) => {
	return [parentName, folderName].filter(Boolean).join('/');
};

const wouldMoveFolderIntoItself = ({
	activeDrag,
	destinationParentFolderPath,
}: {
	readonly activeDrag: CompositionSelectorActiveDrag;
	readonly destinationParentFolderPath: string | null;
}) => {
	if (
		activeDrag.item.type !== 'folder' ||
		destinationParentFolderPath === null
	) {
		return false;
	}

	const sourceFolderPath = getFolderPath(activeDrag.item);
	return (
		destinationParentFolderPath === sourceFolderPath ||
		destinationParentFolderPath.startsWith(`${sourceFolderPath}/`)
	);
};

const canMoveIntoFolder = ({
	activeDrag,
	destinationFolderPath,
}: {
	readonly activeDrag: CompositionSelectorActiveDrag;
	readonly destinationFolderPath: string;
}) => {
	return (
		activeDrag.parentFolderPath !== destinationFolderPath &&
		!wouldMoveFolderIntoItself({
			activeDrag,
			destinationParentFolderPath: destinationFolderPath,
		})
	);
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
	readonly canReorder: boolean;
	readonly level: number;
	readonly activeDragRef: MutableRefObject<CompositionSelectorActiveDrag | null>;
	readonly parentFolderPath: string | null;
	readonly previousSibling: CompositionSelectorItemType | null;
	readonly nextSibling: CompositionSelectorItemType | null;
}> = ({
	item,
	level,
	currentComposition,
	tabIndex,
	selectComposition,
	toggleFolder,
	clearRootDragHover,
	canReorder,
	activeDragRef,
	parentFolderPath,
	previousSibling,
	nextSibling,
}) => {
	const selected = useMemo(() => {
		if (item.type === 'composition') {
			return currentComposition === item.composition.id;
		}

		return false;
	}, [item, currentComposition]);
	const [isDragging, setIsDragging] = useState(false);
	const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
	const dropPositionRef = useRef<DropPosition | null>(null);
	const folderExpansionTimer = useRef<number | null>(null);
	const folderExpansionRequested = useRef(false);

	const cancelFolderExpansion = useCallback(() => {
		if (folderExpansionTimer.current !== null) {
			window.clearTimeout(folderExpansionTimer.current);
			folderExpansionTimer.current = null;
		}
	}, []);
	const updateDropPosition = useCallback((position: DropPosition | null) => {
		dropPositionRef.current = position;
		setDropPosition(position);
	}, []);

	useEffect(() => {
		return cancelFolderExpansion;
	}, [cancelFolderExpansion]);

	const folderIsExpanded = item.type === 'folder' && item.expanded;
	useEffect(() => {
		if (folderIsExpanded) {
			folderExpansionRequested.current = false;
			cancelFolderExpansion();
		}
	}, [cancelFolderExpansion, folderIsExpanded]);

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
		const idleBackground =
			dropPosition === 'inside'
				? WHITE_ALPHA_12
				: selected
					? WHITE_ALPHA_06
					: TRANSPARENT;
		return {
			...itemStyle,
			...hoverableStyle({
				idleBackground,
				hoverBackground:
					dropPosition === 'inside' ? WHITE_ALPHA_12 : WHITE_ALPHA_06,
				idleColor: selected ? WHITE : LIGHT_TEXT,
				hoverColor: WHITE,
			}),
			paddingLeft: 12 + level * 8,
		};
	}, [dropPosition, level, selected]);

	const reorderLineStyle = useMemo((): React.CSSProperties | null => {
		if (dropPosition !== 'before' && dropPosition !== 'after') {
			return null;
		}

		return {
			...reorderLineBase,
			...(dropPosition === 'before' ? {top: -1} : {bottom: -1}),
		};
	}, [dropPosition]);

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

	const onItemDragStart = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (window.remotion_isReadOnlyStudio) {
				event.preventDefault();
				return;
			}

			const itemDescriptor = itemToDescriptor(item);
			activeDragRef.current = {
				item: itemDescriptor,
				parentFolderPath,
			};
			setIsDragging(true);
			event.dataTransfer.effectAllowed = 'copyMove';
			const selectorDragData = makeCompositionSelectorDragData({
				item: itemDescriptor,
				sourceFile: resolvedLocation?.source ?? null,
			});
			event.dataTransfer.setData(
				selectorDragData.mimeType,
				selectorDragData.payload,
			);

			if (item.type === 'composition') {
				const browserStudioOperations = getBrowserStudioOperations();
				const compositionDragData = makeCompositionDragData({
					compositionFile:
						browserStudioOperations === null
							? (resolvedLocation?.source ?? null)
							: browserStudioOperations.getCompositionFile(item.composition.id),
					compositionId: item.composition.id,
					width: item.composition.width ?? null,
					height: item.composition.height ?? null,
					durationInFrames: item.composition.durationInFrames ?? null,
				});
				event.dataTransfer.setData(
					compositionDragData.mimeType,
					compositionDragData.payload,
				);
			}
		},
		[activeDragRef, item, parentFolderPath, resolvedLocation?.source],
	);
	const onItemDragEnd = useCallback(() => {
		activeDragRef.current = null;
		cancelFolderExpansion();
		setIsDragging(false);
		updateDropPosition(null);
	}, [activeDragRef, cancelFolderExpansion, updateDropPosition]);

	const getDropPosition = useCallback(
		(event: DragEvent<HTMLElement>): DropPosition | null => {
			const activeDrag = activeDragRef.current;
			if (activeDrag === null) {
				return null;
			}

			if (!canReorder) {
				if (item.type !== 'folder') {
					return null;
				}

				return canMoveIntoFolder({
					activeDrag,
					destinationFolderPath: getFolderPath(item),
				})
					? 'inside'
					: null;
			}

			const {top, height} = event.currentTarget.getBoundingClientRect();
			const progress = height === 0 ? 0.5 : (event.clientY - top) / height;
			const position =
				item.type === 'composition'
					? progress < 0.5
						? 'before'
						: 'after'
					: progress < 0.25
						? 'before'
						: progress > 0.75
							? 'after'
							: 'inside';
			const target = itemToDescriptor(item);
			if (itemsAreEqual(activeDrag.item, target)) {
				return null;
			}

			if (
				position === 'before' &&
				previousSibling !== null &&
				itemsAreEqual(activeDrag.item, itemToDescriptor(previousSibling))
			) {
				return null;
			}

			if (
				position === 'after' &&
				nextSibling !== null &&
				itemsAreEqual(activeDrag.item, itemToDescriptor(nextSibling))
			) {
				return null;
			}

			if (position === 'inside' && item.type === 'folder') {
				return canMoveIntoFolder({
					activeDrag,
					destinationFolderPath: getFolderPath(item),
				})
					? position
					: null;
			}

			return wouldMoveFolderIntoItself({
				activeDrag,
				destinationParentFolderPath: parentFolderPath,
			})
				? null
				: position;
		},
		[
			activeDragRef,
			canReorder,
			item,
			nextSibling,
			parentFolderPath,
			previousSibling,
		],
	);

	const scheduleFolderExpansion = useCallback(() => {
		if (
			item.type !== 'folder' ||
			item.expanded ||
			folderExpansionTimer.current !== null ||
			folderExpansionRequested.current
		) {
			return;
		}

		const activeDrag = activeDragRef.current;
		if (
			activeDrag === null ||
			!canMoveIntoFolder({
				activeDrag,
				destinationFolderPath: getFolderPath(item),
			})
		) {
			return;
		}

		folderExpansionTimer.current = window.setTimeout(() => {
			folderExpansionTimer.current = null;
			const currentActiveDrag = activeDragRef.current;
			if (
				currentActiveDrag === null ||
				!canMoveIntoFolder({
					activeDrag: currentActiveDrag,
					destinationFolderPath: getFolderPath(item),
				})
			) {
				return;
			}

			folderExpansionRequested.current = true;
			toggleFolder(item.folderName, item.parentName);
		}, folderAutoExpansionDelay);
	}, [activeDragRef, item, toggleFolder]);

	const onRowDragOver = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (
				window.remotion_isReadOnlyStudio ||
				!hasCompositionSelectorDragData(event.dataTransfer.types)
			) {
				return;
			}

			const position = getDropPosition(event);
			if (position === null) {
				cancelFolderExpansion();
				updateDropPosition(null);
				event.stopPropagation();
				return;
			}

			if (position === 'inside') {
				scheduleFolderExpansion();
			} else {
				cancelFolderExpansion();
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			clearRootDragHover();
			updateDropPosition(position);
		},
		[
			cancelFolderExpansion,
			clearRootDragHover,
			getDropPosition,
			scheduleFolderExpansion,
			updateDropPosition,
		],
	);

	const onRowDragLeave = useCallback(() => {
		cancelFolderExpansion();
		updateDropPosition(null);
	}, [cancelFolderExpansion, updateDropPosition]);

	const moveItem = useCallback(
		async ({
			destination,
			dragData,
		}: {
			destination: Extract<
				RecastCodemod,
				{type: 'move-composition-or-folder'}
			>['destination'];
			dragData: CompositionSelectorDragData;
		}) => {
			const label =
				dragData.item.type === 'composition'
					? dragData.item.compositionId
					: dragData.item.folderName;
			const notification = showNotification(`Moving ${label}...`, null);
			try {
				const result = await applyCodemod({
					codemod: {
						type: 'move-composition-or-folder',
						source: dragData.item,
						destination,
					},
					dryRun: false,
					signal: new AbortController().signal,
					symbolicatedStack:
						compositionSelectorDragDataToSymbolicatedStack(dragData),
				});

				if (result.success) {
					notification.dismiss();
				} else {
					notification.replaceContent(result.reason, 4000);
				}

				if (
					result.success &&
					destination.type === 'folder' &&
					item.type === 'folder' &&
					!item.expanded
				) {
					toggleFolder(item.folderName, item.parentName);
				}
			} catch (err) {
				notification.replaceContent(
					err instanceof Error ? err.message : String(err),
					4000,
				);
			}
		},
		[item, toggleFolder],
	);

	const onRowDrop = useCallback(
		async (event: DragEvent<HTMLElement>) => {
			cancelFolderExpansion();
			const dragData = parseCompositionSelectorDragData(event.dataTransfer);
			const position = dropPositionRef.current;
			if (dragData === null) {
				return;
			}

			if (position === null) {
				event.stopPropagation();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			clearRootDragHover();
			updateDropPosition(null);
			await moveItem({
				dragData,
				destination:
					position === 'inside' && item.type === 'folder'
						? {
								type: 'folder',
								folderName: item.folderName,
								parentName: item.parentName,
							}
						: {
								type: position === 'before' ? 'before' : 'after',
								target: itemToDescriptor(item),
							},
			});
		},
		[
			cancelFolderExpansion,
			clearRootDragHover,
			item,
			moveItem,
			updateDropPosition,
		],
	);

	const onFolderChildListDragOver = useCallback(
		(event: DragEvent<HTMLElement>) => {
			if (
				item.type !== 'folder' ||
				window.remotion_isReadOnlyStudio ||
				!hasCompositionSelectorDragData(event.dataTransfer.types)
			) {
				return;
			}

			const activeDrag = activeDragRef.current;
			if (
				activeDrag === null ||
				!canMoveIntoFolder({
					activeDrag,
					destinationFolderPath: getFolderPath(item),
				})
			) {
				event.stopPropagation();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.dataTransfer.dropEffect = 'move';
			clearRootDragHover();
		},
		[activeDragRef, clearRootDragHover, item],
	);

	const onFolderChildListDrop = useCallback(
		async (event: DragEvent<HTMLElement>) => {
			if (item.type !== 'folder' || window.remotion_isReadOnlyStudio) {
				return;
			}

			const dragData = parseCompositionSelectorDragData(event.dataTransfer);
			if (dragData === null) {
				return;
			}

			const activeDrag = activeDragRef.current;
			if (
				activeDrag === null ||
				!canMoveIntoFolder({
					activeDrag,
					destinationFolderPath: getFolderPath(item),
				})
			) {
				event.stopPropagation();
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			clearRootDragHover();
			await moveItem({
				dragData,
				destination: {
					type: 'folder',
					folderName: item.folderName,
					parentName: item.parentName,
				},
			});
		},
		[activeDragRef, clearRootDragHover, item, moveItem],
	);

	if (item.type === 'folder') {
		const folderPath = getFolderPath(item);
		return (
			<>
				<ContextMenu getItems={getContextMenuItems}>
					<div style={reorderWrapper}>
						{reorderLineStyle ? (
							<div data-composition-reorder-line style={reorderLineStyle} />
						) : null}
						<Row align="center">
							<div
								style={style}
								className={`__remotion-composition-selector-item ${HOVERABLE_CLASS_NAME} ${HOVER_GROUP_CLASS_NAME}`}
								tabIndex={tabIndex}
								onClick={onClick}
								onKeyDown={onKeyDown}
								draggable={!window.remotion_isReadOnlyStudio}
								onDragStart={onItemDragStart}
								onDragEnd={onItemDragEnd}
								onDragOver={onRowDragOver}
								onDragLeave={onRowDragLeave}
								onDrop={onRowDrop}
								title={item.folderName}
								role="button"
								aria-expanded={item.expanded}
							>
								{item.expanded ? (
									<ExpandedFolderIcon style={iconStyle} color={CURRENT_COLOR} />
								) : (
									<CollapsedFolderIcon
										color={CURRENT_COLOR}
										style={iconStyle}
									/>
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
					</div>
				</ContextMenu>
				{item.expanded ? (
					<div
						onDragOver={onFolderChildListDragOver}
						onDrop={onFolderChildListDrop}
					>
						{item.items.map((childItem, index) => {
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
									canReorder={canReorder}
									activeDragRef={activeDragRef}
									parentFolderPath={folderPath}
									previousSibling={index === 0 ? null : item.items[index - 1]}
									nextSibling={
										index === item.items.length - 1
											? null
											: item.items[index + 1]
									}
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
			<div style={reorderWrapper}>
				{reorderLineStyle ? (
					<div data-composition-reorder-line style={reorderLineStyle} />
				) : null}
				<Row align="center">
					<a
						ref={compositionRowRef}
						style={style}
						tabIndex={tabIndex}
						onClick={onClick}
						onKeyDown={onKeyDown}
						draggable={!window.remotion_isReadOnlyStudio}
						onDragStart={onItemDragStart}
						onDragEnd={onItemDragEnd}
						onDragOver={onRowDragOver}
						onDragLeave={onRowDragLeave}
						onDrop={onRowDrop}
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
			</div>
		</ContextMenu>
	);
};
