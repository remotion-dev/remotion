import {StudioProtocolInternals} from '@remotion/studio-protocol';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import {
	BLUE,
	LIGHT_TEXT,
	TIMELINE_BACKGROUND_COLOR,
	WHITE,
} from '../helpers/colors';
import {formatMediaDuration} from '../helpers/format-media-duration';
import {
	getAssetMetadata,
	type AssetMetadata,
} from '../helpers/get-asset-metadata';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {noop} from '../helpers/noop';
import {
	closedAllCanvasTabsStorageKey,
	getRoute,
	pushUrl,
	replaceUrl,
} from '../helpers/url-state';
import {CompositionListContext} from '../state/composition-list';
import {SetSelectedModalContext} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
import {useAssetContextMenuItems} from './asset-context-menu';
import {
	getCompositionDragPreviewMetadata,
	parseCompositionDragData,
} from './composition-drag-data';
import {getCompositionContextMenuItems} from './composition-menu-items';
import {ContextMenu} from './ContextMenu';
import {isSupportedDropEvent} from './drop-handler-data';
import {useSelectComposition} from './InitialCompositionLoader';
import {InlineAction} from './InlineAction';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {CancelIcon} from './NewComposition/CancelButton';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {
	getDraggedRenderOutputCanvasContent,
	RENDER_OUTPUT_TAB_DRAG_MIME_TYPE,
} from './RenderQueue/use-render-output-file-drag';
import {Tab, Tabs} from './Tabs';
import {useResolvedStack} from './Timeline/use-resolved-stack';
import {useOpenInMenuApps} from './use-open-in-menu-apps';
import {useSelectAsset} from './use-select-asset';

const storageKey = 'remotion.canvasTabs';
const canvasTabDragMimeType = 'application/vnd.remotion.canvas-tab';

const getTabKey = (content: CanvasContent): string => {
	switch (content.type) {
		case 'composition':
			return `composition:${content.compositionId}`;
		case 'asset':
			return `asset:${content.asset}`;
		case 'output':
			return `output:${content.path}`;
		case 'output-blob':
			return `output-blob:${content.displayName}`;
		default:
			throw new Error('Unknown canvas content type');
	}
};

const getTabLabel = (content: CanvasContent): string => {
	switch (content.type) {
		case 'composition':
			return content.compositionId;
		case 'asset':
			return content.asset.split('/').at(-1) ?? content.asset;
		case 'output':
			return content.path.split('/').at(-1) ?? content.path;
		case 'output-blob':
			return content.displayName;
		default:
			throw new Error('Unknown canvas content type');
	}
};

const getTabRoute = (content: CanvasContent): string | null => {
	switch (content.type) {
		case 'composition':
			return `/${content.compositionId}`;
		case 'asset':
			return `/assets/${content.asset}`;
		case 'output':
			return `/outputs/${content.path}`;
		case 'output-blob':
			return null;
		default:
			throw new Error('Unknown canvas content type');
	}
};

const loadTabs = (): CanvasContent[] => {
	try {
		const stored: unknown = JSON.parse(
			sessionStorage.getItem(storageKey) ?? '[]',
		);
		if (!Array.isArray(stored)) {
			return [];
		}

		const tabs: CanvasContent[] = [];
		for (const item of stored) {
			if (typeof item !== 'object' || item === null) {
				continue;
			}

			let content: CanvasContent | null = null;
			if (
				item.type === 'composition' &&
				typeof item.compositionId === 'string'
			) {
				content = {type: 'composition', compositionId: item.compositionId};
			} else if (item.type === 'asset' && typeof item.asset === 'string') {
				content = {type: 'asset', asset: item.asset};
			} else if (item.type === 'output' && typeof item.path === 'string') {
				content = {type: 'output', path: item.path};
			}

			if (
				content &&
				!tabs.some((tab) => getTabKey(tab) === getTabKey(content))
			) {
				tabs.push(content);
			}
		}

		return tabs;
	} catch {
		return [];
	}
};

const container: React.CSSProperties = {
	backgroundColor: TIMELINE_BACKGROUND_COLOR,
	flexShrink: 0,
	height: 34,
	overflowX: 'auto',
	overflowY: 'hidden',
	overscrollBehaviorX: 'none',
	position: 'relative',
};

const tabWrapperStyle: React.CSSProperties = {
	flex: '0 0 160px',
	minWidth: 0,
	position: 'relative',
};

const dropIndicatorStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	bottom: 0,
	pointerEvents: 'none',
	position: 'absolute',
	top: 0,
	width: 2,
	zIndex: 1,
};

const tabStyle: React.CSSProperties = {
	gap: 6,
	minWidth: 0,
	width: '100%',
	boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
	flex: 1,
	fontSize: 13,
	maskImage: 'linear-gradient(to right, black calc(100% - 10px), transparent)',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 10px), transparent)',
};

const tooltipTriggerStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const tooltipContentStyle: React.CSSProperties = {
	display: 'inline-block',
	font: 'inherit',
	padding: 2,
};

const tooltipTitleStyle: React.CSSProperties = {
	fontSize: 'inherit',
};

const closeStyle: React.CSSProperties = {
	flexShrink: 0,
	height: 20,
	width: 20,
};

const CanvasTab: React.FC<{
	readonly tab: CanvasContent;
	readonly selected: boolean;
	readonly onSelect: () => void;
	readonly onDragFocus: () => void;
	readonly onClose: () => void;
	readonly onCloseOthers: () => void;
	readonly canCloseOthers: boolean;
	readonly dropIndicator: 'before' | 'after' | null;
	readonly onDragStart: React.DragEventHandler<HTMLDivElement>;
	readonly onDragEnd: React.DragEventHandler<HTMLDivElement>;
}> = ({
	tab,
	selected,
	onSelect,
	onDragFocus,
	onClose,
	onCloseOthers,
	canCloseOthers,
	dropIndicator,
	onDragStart,
	onDragEnd,
}) => {
	const {canvasContent, compositions, currentCompositionMetadata} = useContext(
		Internals.CompositionManager,
	);
	const resolvedConfigs = useContext(Internals.ResolveCompositionContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {connectionStatus, openInApps} = useOpenInMenuApps();
	const [tooltipHovered, setTooltipHovered] = useState(false);
	const [assetMetadata, setAssetMetadata] = useState<AssetMetadata | null>(
		null,
	);
	const assetMetadataRequested = useRef(false);
	const compositionMetadataRequested = useRef(false);
	const dragFocusTimer = useRef<number | null>(null);
	const cancelDragFocus = useCallback(() => {
		if (dragFocusTimer.current !== null) {
			window.clearTimeout(dragFocusTimer.current);
			dragFocusTimer.current = null;
		}
	}, []);
	useEffect(() => cancelDragFocus, [cancelDragFocus]);
	useEffect(() => {
		if (selected) {
			cancelDragFocus();
		}
	}, [cancelDragFocus, selected]);
	const onDragEnter = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			if (
				selected ||
				tab.type !== 'composition' ||
				window.remotion_isReadOnlyStudio ||
				Array.from(event.dataTransfer.types).includes(canvasTabDragMimeType) ||
				!isSupportedDropEvent(event.nativeEvent) ||
				dragFocusTimer.current !== null
			) {
				return;
			}

			dragFocusTimer.current = window.setTimeout(() => {
				dragFocusTimer.current = null;
				onDragFocus();
			}, 500);
		},
		[onDragFocus, selected, tab.type],
	);
	const onDragLeave = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			const bounds = event.currentTarget.getBoundingClientRect();
			if (
				event.clientX < bounds.left ||
				event.clientX > bounds.right ||
				event.clientY < bounds.top ||
				event.clientY > bounds.bottom
			) {
				cancelDragFocus();
			}
		},
		[cancelDragFocus],
	);
	const composition =
		tab.type === 'composition'
			? (compositions.find((item) => item.id === tab.compositionId) ?? null)
			: null;
	const resolvedLocation = useResolvedStack(composition?.stack ?? null);
	const {getContextMenuItems: getAssetContextMenuItems} =
		useAssetContextMenuItems({
			relativePath: tab.type === 'asset' ? tab.asset : null,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	const getContextMenuItems = useCallback((): ComboboxValue[] => {
		let items: ComboboxValue[] = [];
		if (tab.type === 'asset') {
			items = getAssetContextMenuItems();
		} else if (composition !== null) {
			items = getCompositionContextMenuItems({
				closeMenu: noop,
				composition,
				connectionStatus,
				includeCompositionManagementItems: true,
				openInApps,
				resolvedLocation,
				setSelectedModal,
				readOnlyStudio: window.remotion_isReadOnlyStudio,
			});
		}

		return [
			...items,
			...(items.length > 0
				? [{type: 'divider' as const, id: 'canvas-tab-actions-divider'}]
				: []),
			{
				type: 'item',
				id: 'close-canvas-tab',
				value: 'close-canvas-tab',
				label: 'Close',
				keyHint: null,
				leftItem: null,
				onClick: onClose,
				quickSwitcherLabel: null,
				subMenu: null,
			},
			{
				type: 'item',
				id: 'close-other-canvas-tabs',
				value: 'close-other-canvas-tabs',
				label: 'Close Others',
				keyHint: null,
				leftItem: null,
				onClick: onCloseOthers,
				quickSwitcherLabel: null,
				subMenu: null,
				disabled: !canCloseOthers,
			},
		];
	}, [
		canCloseOthers,
		composition,
		connectionStatus,
		getAssetContextMenuItems,
		onClose,
		onCloseOthers,
		openInApps,
		resolvedLocation,
		setSelectedModal,
		tab.type,
	]);
	const label = getTabLabel(tab);
	let dimensions: string | null = null;
	let duration: string | null = null;
	if (tooltipHovered) {
		if (tab.type === 'composition') {
			const resolved = resolvedConfigs?.[tab.compositionId];
			const metadata =
				canvasContent?.type === 'composition' &&
				canvasContent.compositionId === tab.compositionId &&
				currentCompositionMetadata !== null
					? currentCompositionMetadata
					: resolved?.type === 'success' ||
						  resolved?.type === 'success-and-refreshing'
						? resolved.result
						: composition;
			if (metadata?.width && metadata.height) {
				dimensions = `${metadata.width}x${metadata.height}`;
			}

			if (metadata?.durationInFrames && metadata.fps) {
				duration = formatMediaDuration(
					metadata.durationInFrames / metadata.fps,
				);
			}
		} else if (tab.type === 'output-blob') {
			dimensions = `${tab.width}x${tab.height}`;
		} else if (assetMetadata?.type === 'found') {
			const fileType = getPreviewFileType(
				tab.type === 'asset' ? tab.asset : tab.path,
			);
			if (
				fileType !== 'audio' &&
				assetMetadata.dimensions &&
				assetMetadata.dimensions !== 'none'
			) {
				dimensions = `${assetMetadata.dimensions.width}x${assetMetadata.dimensions.height}`;
			}

			if (
				assetMetadata.mediaMetadata &&
				Number.isFinite(assetMetadata.mediaMetadata.duration)
			) {
				duration = formatMediaDuration(assetMetadata.mediaMetadata.duration);
			}
		}
	}

	const tabElement = (
		<Tab
			selected={selected}
			onClick={selected ? noop : onSelect}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			style={tabStyle}
		>
			<ActionTooltip
				label={
					<span style={tooltipContentStyle}>
						<strong style={tooltipTitleStyle}>{label}</strong>
						{dimensions === null ? null : `\n${dimensions}`}
						{duration === null ? null : `\n${duration}`}
					</span>
				}
				shortcut={null}
				delay={800}
				dismissOnClick
				triggerStyle={tooltipTriggerStyle}
			>
				<span
					style={{...labelStyle, color: selected ? WHITE : LIGHT_TEXT}}
					onPointerEnter={() => {
						setTooltipHovered(true);
						if (tab.type === 'asset' || tab.type === 'output') {
							if (!assetMetadataRequested.current) {
								assetMetadataRequested.current = true;
								getAssetMetadata(tab, false).then(setAssetMetadata);
							}
						} else if (
							tab.type === 'composition' &&
							composition?.calculateMetadata &&
							!selected &&
							resolvedConfigs?.[tab.compositionId]?.type !== 'success' &&
							resolvedConfigs?.[tab.compositionId]?.type !==
								'success-and-refreshing' &&
							!compositionMetadataRequested.current
						) {
							compositionMetadataRequested.current = true;
							Internals.resolveCompositionsRef.current
								?.resolveComposition(tab.compositionId)
								.catch(() => undefined);
						}
					}}
					onPointerLeave={() => setTooltipHovered(false)}
				>
					{label}
				</span>
			</ActionTooltip>
			<InlineAction
				aria-label={`Close ${label} tab`}
				onClick={(event) => {
					event.stopPropagation();
					onClose();
				}}
				renderAction={() => <CancelIcon height={20} width={20} />}
				style={closeStyle}
				variant={null}
			/>
		</Tab>
	);

	return (
		<div
			style={tabWrapperStyle}
			draggable
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDrop={cancelDragFocus}
		>
			<ContextMenu getItems={getContextMenuItems}>{tabElement}</ContextMenu>
			{dropIndicator === null ? null : (
				<div
					style={{
						...dropIndicatorStyle,
						[dropIndicator === 'before' ? 'left' : 'right']: -1,
					}}
				/>
			)}
		</div>
	);
};

export const CanvasTabs: React.FC = () => {
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);
	const {compositionListState} = useContext(CompositionListContext);
	const selectComposition = useSelectComposition();
	const selectAsset = useSelectAsset();
	const [tabs, setTabs] = useState<CanvasContent[]>(loadTabs);
	const [dropIndex, setDropIndex] = useState<number | null>(null);
	const scrollableRef = useRef<HTMLDivElement>(null);
	const draggedTabKey = useRef<string | null>(null);
	const previousTabKeys = useRef(tabs.map(getTabKey));
	const activeTabKey = canvasContent === null ? null : getTabKey(canvasContent);
	const previousActiveTabKey = useRef<string | null>(null);

	useLayoutEffect(() => {
		const keys = tabs.map(getTabKey);
		const addedIndex = keys.findLastIndex(
			(key) => !previousTabKeys.current.includes(key),
		);
		const selectedIndex =
			activeTabKey !== previousActiveTabKey.current && activeTabKey !== null
				? keys.indexOf(activeTabKey)
				: -1;
		previousTabKeys.current = keys;
		previousActiveTabKey.current = activeTabKey;

		const index = addedIndex === -1 ? selectedIndex : addedIndex;
		const scrollable = scrollableRef.current;
		const tab = scrollable?.firstElementChild?.children.item(index);
		if (!scrollable || !tab) {
			return;
		}

		const viewport = scrollable.getBoundingClientRect();
		const bounds = tab.getBoundingClientRect();
		if (bounds.left < viewport.left) {
			scrollable.scrollLeft += bounds.left - viewport.left;
		} else if (bounds.right > viewport.right) {
			scrollable.scrollLeft += bounds.right - viewport.right;
		}
	}, [activeTabKey, tabs]);

	useEffect(() => {
		if (canvasContent === null) {
			return;
		}

		try {
			sessionStorage.removeItem(closedAllCanvasTabsStorageKey);
		} catch {
			// Session storage may be unavailable in an embedded Studio.
		}

		setTabs((current) => {
			const key = getTabKey(canvasContent);
			const index = current.findIndex((tab) => getTabKey(tab) === key);
			if (index === -1) {
				return [...current, canvasContent];
			}

			if (current[index] === canvasContent) {
				return current;
			}

			const next = [...current];
			next[index] = canvasContent;
			return next;
		});
	}, [canvasContent]);

	useEffect(() => {
		if (compositionListState !== 'ready') {
			return;
		}

		setTabs((current) => {
			const next = current.filter(
				(tab) =>
					tab.type !== 'composition' ||
					compositions.some(
						(composition) => composition.id === tab.compositionId,
					),
			);
			return next.length === current.length ? current : next;
		});
	}, [compositionListState, compositions]);

	useEffect(() => {
		try {
			sessionStorage.setItem(
				storageKey,
				JSON.stringify(tabs.filter((tab) => tab.type !== 'output-blob')),
			);
		} catch {
			// Session storage may be unavailable in an embedded Studio.
		}
	}, [tabs]);

	const selectTab = useCallback(
		(content: CanvasContent, replace: boolean) => {
			const composition =
				content.type === 'composition'
					? compositions.find((item) => item.id === content.compositionId)
					: null;
			if (content.type === 'composition' && !composition) {
				return;
			}

			const route = getTabRoute(content);
			if (route !== null && route !== getRoute()) {
				if (replace) {
					replaceUrl(route);
				} else {
					pushUrl(route);
				}
			}

			if (composition) {
				selectComposition(composition, false);
			} else if (content.type === 'asset') {
				selectAsset(content.asset);
			} else {
				setCanvasContent(content);
			}
		},
		[compositions, selectAsset, selectComposition, setCanvasContent],
	);

	const closeTab = useCallback(
		(content: CanvasContent) => {
			const key = getTabKey(content);
			const index = tabs.findIndex((tab) => getTabKey(tab) === key);
			if (index === -1) {
				return;
			}

			const remaining = tabs.filter((tab) => getTabKey(tab) !== key);
			setTabs(remaining);
			if (canvasContent === null || getTabKey(canvasContent) !== key) {
				return;
			}

			const neighbor = remaining[index] ?? remaining[index - 1];
			if (neighbor) {
				selectTab(neighbor, true);
			} else {
				replaceUrl('/');
				try {
					sessionStorage.setItem(closedAllCanvasTabsStorageKey, '1');
				} catch {
					// Session storage may be unavailable in an embedded Studio.
				}

				setCanvasContent(null);
			}
		},
		[canvasContent, selectTab, setCanvasContent, tabs],
	);
	const closeOtherTabs = useCallback(
		(content: CanvasContent) => {
			setTabs([content]);
			if (
				canvasContent === null ||
				getTabKey(canvasContent) !== getTabKey(content)
			) {
				selectTab(content, true);
			}
		},
		[canvasContent, selectTab],
	);

	const getDropIndex = useCallback((clientX: number) => {
		const children = scrollableRef.current?.firstElementChild?.children;
		if (!children) {
			return 0;
		}

		for (let index = 0; index < children.length; index++) {
			const bounds = children.item(index)?.getBoundingClientRect();
			if (bounds && clientX < bounds.left + bounds.width / 2) {
				return index;
			}
		}

		return children.length;
	}, []);

	const onTabDragEnd = useCallback(() => {
		draggedTabKey.current = null;
		setDropIndex(null);
	}, []);

	const onDragOver = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			const sourceKey = draggedTabKey.current;
			if (
				sourceKey !== null &&
				Array.from(event.dataTransfer.types).includes(canvasTabDragMimeType)
			) {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'move';
				const sourceIndex = tabs.findIndex(
					(tab) => getTabKey(tab) === sourceKey,
				);
				const targetIndex = getDropIndex(event.clientX);
				setDropIndex(
					targetIndex === sourceIndex || targetIndex === sourceIndex + 1
						? null
						: targetIndex,
				);
			} else {
				const dragTypes = Array.from(event.dataTransfer.types);
				const isAsset =
					StudioProtocolInternals.getDragPreviewMetadata(dragTypes)?.type ===
					'asset';
				if (
					!isAsset &&
					!dragTypes.includes(RENDER_OUTPUT_TAB_DRAG_MIME_TYPE) &&
					getCompositionDragPreviewMetadata(event.dataTransfer.types) === null
				) {
					setDropIndex(null);
					return;
				}

				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
				setDropIndex(getDropIndex(event.clientX));
			}

			const bounds = event.currentTarget.getBoundingClientRect();
			if (event.clientX < bounds.left + 24) {
				event.currentTarget.scrollLeft -= 16;
			} else if (event.clientX > bounds.right - 24) {
				event.currentTarget.scrollLeft += 16;
			}
		},
		[getDropIndex, tabs],
	);

	const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		if (
			event.clientX < bounds.left ||
			event.clientX > bounds.right ||
			event.clientY < bounds.top ||
			event.clientY > bounds.bottom
		) {
			setDropIndex(null);
		}
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			setDropIndex(null);
			const sourceKey = draggedTabKey.current;
			if (
				sourceKey !== null &&
				Array.from(event.dataTransfer.types).includes(canvasTabDragMimeType)
			) {
				event.preventDefault();
				event.stopPropagation();
				const targetIndex = getDropIndex(event.clientX);
				setTabs((current) => {
					const sourceIndex = current.findIndex(
						(tab) => getTabKey(tab) === sourceKey,
					);
					if (
						sourceIndex === -1 ||
						targetIndex === sourceIndex ||
						targetIndex === sourceIndex + 1
					) {
						return current;
					}

					const next = [...current];
					const [moved] = next.splice(sourceIndex, 1);
					next.splice(
						targetIndex > sourceIndex ? targetIndex - 1 : targetIndex,
						0,
						moved,
					);
					return next;
				});
				onTabDragEnd();
				return;
			}

			const compositionDrag = parseCompositionDragData(event.dataTransfer);
			let content: CanvasContent;
			if (
				Array.from(event.dataTransfer.types).includes(
					RENDER_OUTPUT_TAB_DRAG_MIME_TYPE,
				)
			) {
				const renderOutput = getDraggedRenderOutputCanvasContent(
					event.dataTransfer,
				);
				if (renderOutput === null) {
					return;
				}

				content = renderOutput;
			} else if (compositionDrag !== null) {
				const composition = compositions.find(
					(item) => item.id === compositionDrag.compositionId,
				);
				if (!composition) {
					return;
				}

				content = {
					type: 'composition',
					compositionId: composition.id,
				};
			} else {
				const assetDrag = StudioProtocolInternals.parseDragData(
					event.dataTransfer,
				);
				if (assetDrag?.type !== 'asset') {
					return;
				}

				content = {type: 'asset', asset: assetDrag.data.assetPath};
			}

			event.preventDefault();
			event.stopPropagation();
			const insertionIndex = getDropIndex(event.clientX);
			setTabs((current) => {
				const key = getTabKey(content);
				const existingIndex = current.findIndex(
					(tab) => getTabKey(tab) === key,
				);
				const next = current.filter((tab) => getTabKey(tab) !== key);
				next.splice(
					existingIndex !== -1 && existingIndex < insertionIndex
						? insertionIndex - 1
						: insertionIndex,
					0,
					content,
				);
				return next;
			});
			selectTab(content, false);
		},
		[compositions, getDropIndex, onTabDragEnd, selectTab],
	);

	const onPointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			event.stopPropagation();
		},
		[],
	);

	if (tabs.length === 0) {
		return null;
	}

	return (
		<div
			ref={scrollableRef}
			className={`css-reset ${HORIZONTAL_SCROLLBAR_CLASSNAME} __remotion-canvas-tabs`}
			style={container}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			onPointerDown={onPointerDown}
		>
			<Tabs>
				{tabs.map((tab, index) => {
					const key = getTabKey(tab);
					return (
						<CanvasTab
							key={key}
							tab={tab}
							selected={
								canvasContent !== null && getTabKey(canvasContent) === key
							}
							onSelect={() => selectTab(tab, false)}
							onDragFocus={() => {
								const route = getTabRoute(tab);
								if (route !== null && route !== getRoute()) {
									replaceUrl(route);
								}

								setCanvasContent(tab);
							}}
							onClose={() => closeTab(tab)}
							onCloseOthers={() => closeOtherTabs(tab)}
							canCloseOthers={tabs.length > 1}
							dropIndicator={
								dropIndex === index
									? 'before'
									: dropIndex === tabs.length && index === tabs.length - 1
										? 'after'
										: null
							}
							onDragStart={(event) => {
								draggedTabKey.current = key;
								event.dataTransfer.setData(canvasTabDragMimeType, key);
								event.dataTransfer.effectAllowed = 'move';
							}}
							onDragEnd={onTabDragEnd}
						/>
					);
				})}
			</Tabs>
		</div>
	);
};
