import {
	EFFECT_CATALOG,
	getEffectDocumentationLink,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
import {defaultRangeExtractor, useVirtualizer} from '@tanstack/react-virtual';
import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals, type RuntimeValueStore} from 'remotion';
import {canUseEffectOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../helpers/colors';
import {assertEffectChainEditable} from '../helpers/effect-deletion-state';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {isStudioSelectionEnabled} from '../helpers/interactivity-enabled';
import {observeHover} from '../helpers/observe-hover';
import {useZIndex} from '../state/z-index';
import {ContextMenu} from './ContextMenu';
import {addEffectToSequence} from './effect-drag-and-drop';
import {getEffectPickerConfig} from './effect-picker-config';
import {filterEffectCatalog} from './effect-picker-search';
import type {EffectPreviewFactory} from './effect-preview-loaders';
import {EffectThumbnail} from './EffectThumbnail';
import {InspectorMessage} from './InspectorPanel/common';
import {container} from './InspectorPanel/styles';
import {useTrackForSelection} from './InspectorPanel/use-track-for-selection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {RemotionInput} from './NewComposition/RemInput';
import {showNotification} from './Notifications/NotificationCenter';
import {
	QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
	loopIndex,
} from './QuickSwitcher/shared';
import {
	useTimelineSelection,
	type TimelineSelection,
} from './Timeline/TimelineSelection';

const content: React.CSSProperties = {
	padding: '4px 8px',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
	borderRadius: 4,
	padding: '4px 10px 4px 12px',
};

const resultList: React.CSSProperties = {
	flex: 1,
	minHeight: 0,
	overflowY: 'auto',
	padding: '0 7px',
};

const noResults: React.CSSProperties = {
	gridColumn: '1 / -1',
	color: LIGHT_TEXT,
	fontSize: 13,
	padding: '12px 16px',
};

const resultContainer: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	width: '100%',
	textAlign: 'left',
	cursor: 'default',
	display: 'flex',
	flexDirection: 'column',
	gap: 3,
	padding: '0 0 1px',
	minWidth: 0,
	borderRadius: 4,
};

const label: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	lineHeight: '18px',
	fontSize: QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE - 2,
	maskImage: 'linear-gradient(to right, black calc(100% - 10px), transparent)',
	minWidth: 0,
	overflow: 'hidden',
	paddingRight: 10,
	whiteSpace: 'nowrap',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 10px), transparent)',
	width: '100%',
};

const EffectPickerResult: React.FC<{
	readonly item: EffectCatalogItem;
	readonly snapshot: HTMLCanvasElement | null;
	readonly selected: boolean;
	readonly isScrolling: boolean;
	readonly onSelected: (item: EffectCatalogItem) => void;
	readonly onPreview: (id: string, previewing: boolean) => void;
	readonly onFocus: (item: EffectCatalogItem) => void;
}> = React.memo(
	({item, snapshot, selected, isScrolling, onSelected, onPreview, onFocus}) => {
		const ref = useRef<HTMLButtonElement>(null);

		useEffect(() => {
			const element = ref.current;
			if (!element || isScrolling) {
				return;
			}

			let timeout: ReturnType<typeof setTimeout> | null = null;
			const unobserve = observeHover({
				element,
				onHoverChange: (hovered) => {
					if (timeout !== null) {
						clearTimeout(timeout);
						timeout = null;
					}

					if (hovered) {
						timeout = setTimeout(() => onPreview(item.id, true), 100);
					} else {
						onPreview(item.id, false);
					}
				},
			});
			return () => {
				unobserve();

				if (timeout !== null) {
					clearTimeout(timeout);
				}

				onPreview(item.id, false);
			};
		}, [isScrolling, item.id, onPreview]);

		const style = useMemo((): React.CSSProperties => {
			return {
				...resultContainer,
				...hoverableStyle({
					idleBackground: TRANSPARENT,
					hoverBackground: TRANSPARENT,
					idleColor: selected ? WHITE : LIGHT_TEXT,
					hoverColor: WHITE,
				}),
			};
		}, [selected]);

		const onClick = useCallback(() => {
			onSelected(item);
		}, [item, onSelected]);

		const getContextMenuItems = useCallback((): ComboboxValue[] => {
			const documentationLink = getEffectDocumentationLink(item);

			return [
				{
					type: 'item',
					id: `open-${item.id}-docs`,
					keyHint: null,
					label: 'Open effect docs',
					leftItem: null,
					disabled: false,
					onClick: () => {
						window.open(documentationLink, '_blank', 'noopener,noreferrer');
					},
					quickSwitcherLabel: null,
					subMenu: null,
					value: `open-${item.id}-docs`,
				},
			];
		}, [item]);

		return (
			<ContextMenu getItems={getContextMenuItems}>
				<button
					ref={ref}
					type="button"
					style={style}
					className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
					aria-label={`Add ${item.label} effect`}
					data-effect-id={item.id}
					tabIndex={selected ? 0 : -1}
					onClick={onClick}
					onFocus={() => onFocus(item)}
					onBlur={() => onPreview(item.id, false)}
				>
					<EffectThumbnail
						item={item}
						snapshot={snapshot}
						isScrolling={isScrolling}
					/>
					<span style={label}>{item.label}</span>
				</button>
			</ContextMenu>
		);
	},
);

export const EffectPicker: React.FC<{
	readonly selection: Extract<
		TimelineSelection,
		{type: 'sequence-all-effects'}
	>;
}> = ({selection}) => {
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [previewId, setPreviewId] = useState<string | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const pendingFocus = useRef<string | null>(null);
	const {isHighestContext} = useZIndex();
	const previewStore = useContext(Internals.EffectPreviewContext);
	const {setPreview} = previewStore;
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {selectItems} = useTimelineSelection();
	const nodePathInfo = useMemo(
		() => ({...selection.nodePathInfo, auxiliaryKeys: []}),
		[selection.nodePathInfo],
	);
	const onBack = useCallback(
		() => selectItems([{type: 'sequence', nodePathInfo}]),
		[nodePathInfo, selectItems],
	);
	const track = useTrackForSelection(selection);
	const canAddEffects =
		previewServerState.type === 'connected' &&
		isStudioSelectionEnabled() &&
		canUseEffectOperations() &&
		nodePathInfo.supportsEffects;
	const runtimeValues = canAddEffects
		? (track?.sequence.controls?.runtimeValues ?? null)
		: null;
	const outlineRef = track?.sequence.refForOutline ?? null;
	const [capture, setCapture] = useState<{
		readonly runtimeValues: RuntimeValueStore;
		readonly snapshot: HTMLCanvasElement | null;
	} | null>(null);
	const snapshot =
		capture?.runtimeValues === runtimeValues ? capture.snapshot : null;

	useLayoutEffect(() => {
		if (
			runtimeValues === null ||
			!outlineRef?.current ||
			capture?.runtimeValues === runtimeValues ||
			previewStore.getSnapshot(runtimeValues) !== null
		) {
			return;
		}

		// Keep an immutable copy of the authored appearance. Hovering may swap a
		// native image for a canvas, but must not change the input to these cards.
		setCapture({
			runtimeValues,
			snapshot: Internals.captureEffectPreviewSnapshot(outlineRef.current),
		});
	}, [capture, outlineRef, previewStore, runtimeValues]);

	useEffect(() => {
		const clearPreview = () => setPreviewId(null);
		const onVisibilityChange = () => {
			if (document.hidden) {
				clearPreview();
			}
		};

		window.addEventListener('blur', clearPreview);
		document.addEventListener('visibilitychange', onVisibilityChange);
		return () => {
			window.removeEventListener('blur', clearPreview);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, []);

	const results = useMemo(() => {
		return filterEffectCatalog({items: EFFECT_CATALOG, query});
	}, [query]);

	const selectedIndexRounded =
		results.length === 0 ? -1 : loopIndex(selectedIndex, results.length);
	const getScrollElement = useCallback(() => listRef.current, []);
	const getRowKey = useCallback(
		(index: number) => results[index * 2].id,
		[results],
	);
	const estimateRowHeight = useCallback(() => {
		const width = listRef.current?.clientWidth || 320;
		const aspectRatio = snapshot
			? Math.max(3 / 2, snapshot.width / snapshot.height)
			: 3 / 2;
		return (width - 18) / 2 / aspectRatio + 22;
	}, [snapshot]);
	const rangeExtractor = useCallback(
		(range: Parameters<typeof defaultRangeExtractor>[0]) => {
			const indexes = defaultRangeExtractor(range);
			const selectedRow = Math.floor(selectedIndexRounded / 2);
			if (selectedRow >= 0 && !indexes.includes(selectedRow)) {
				indexes.push(selectedRow);
				indexes.sort((a, b) => a - b);
			}

			return indexes;
		},
		[selectedIndexRounded],
	);
	const rowVirtualizer = useVirtualizer({
		count: Math.ceil(results.length / 2),
		getScrollElement,
		getItemKey: getRowKey,
		estimateSize: estimateRowHeight,
		rangeExtractor,
		gap: 4,
		overscan: 2,
		paddingEnd: 10,
	});
	const virtualRows = rowVirtualizer.getVirtualItems();
	const listWidth = rowVirtualizer.scrollRect?.width;
	const {isScrolling} = rowVirtualizer;

	useEffect(() => {
		const item = EFFECT_CATALOG.find((entry) => entry.id === previewId);
		if (!item || !runtimeValues || !isHighestContext || isScrolling) {
			return;
		}

		let cancelled = false;
		import('./effect-preview-loaders')
			.then(({effectPreviewLoaders}) => {
				const loader = effectPreviewLoaders[item.effect.importPath];
				if (!loader) {
					throw new Error(`No preview loader for ${item.label}`);
				}

				return loader();
			})
			.then((module) => {
				if (cancelled) {
					return;
				}

				const factory = module[item.effect.name] as EffectPreviewFactory;

				setPreview({
					runtimeValues,
					effect: factory(getEffectPickerConfig(item)),
				});
			})
			.catch(() => {
				if (!cancelled) {
					setPreview(null);
				}
			});

		return () => {
			cancelled = true;
			setPreview(null);
		};
	}, [isHighestContext, isScrolling, previewId, runtimeValues, setPreview]);

	useLayoutEffect(() => {
		rowVirtualizer.measure();
	}, [listWidth, rowVirtualizer, snapshot]);

	useLayoutEffect(() => {
		if (pendingFocus.current === null) {
			return;
		}

		const button = listRef.current?.querySelector<HTMLButtonElement>(
			`[data-effect-id="${pendingFocus.current}"]`,
		);
		if (button) {
			pendingFocus.current = null;
			button.focus({preventScroll: true});
		}
	}, [selectedIndexRounded, virtualRows]);

	const selectItem = useCallback(
		(item: EffectCatalogItem) => {
			if (!canAddEffects || previewServerState.type !== 'connected') {
				return;
			}

			try {
				assertEffectChainEditable(nodePathInfo.sequenceSubscriptionKey);
			} catch (error) {
				showNotification((error as Error).message, 4000);
				return;
			}

			onBack();
			addEffectToSequence({
				clientId: previewServerState.clientId,
				effect: {...item.effect, config: getEffectPickerConfig(item)},
				fileName: nodePathInfo.sequenceSubscriptionKey.absolutePath,
				nodePathInfo,
				selectItems,
			});
		},
		[canAddEffects, nodePathInfo, onBack, previewServerState, selectItems],
	);

	const onResultFocus = useCallback(
		(item: EffectCatalogItem) => {
			setSelectedIndex(results.indexOf(item));
			setPreviewId(item.id);
		},
		[results],
	);
	const onResultPreview = useCallback((id: string, previewing: boolean) => {
		setPreviewId((current) =>
			previewing ? id : current === id ? null : current,
		);
	}, []);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (
				!isHighestContext ||
				event.nativeEvent.isComposing ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			) {
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				onBack();
				return;
			}

			const isSearch = event.target instanceof HTMLInputElement;
			const isResult =
				event.target instanceof HTMLButtonElement &&
				event.target.hasAttribute('data-effect-id');
			if (!isSearch && !isResult) {
				return;
			}

			if (isResult && (event.key === 'Enter' || event.key === ' ')) {
				event.stopPropagation();
				return;
			}

			if (event.key === 'Enter' && isSearch) {
				event.preventDefault();
				event.stopPropagation();
				if (selectedIndexRounded !== -1) {
					selectItem(results[selectedIndexRounded]);
				}

				return;
			}

			const offset =
				event.key === 'ArrowDown'
					? 2
					: event.key === 'ArrowUp'
						? -2
						: event.key === 'ArrowRight'
							? 1
							: event.key === 'ArrowLeft'
								? -1
								: null;
			if (offset === null) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			if (results.length === 0) {
				return;
			}

			const nextIndex =
				(((selectedIndexRounded + offset) % results.length) + results.length) %
				results.length;
			setSelectedIndex(nextIndex);
			setPreviewId(results[nextIndex].id);
			if (isResult) {
				pendingFocus.current = results[nextIndex].id;
			}

			rowVirtualizer.scrollToIndex(Math.floor(nextIndex / 2), {align: 'auto'});
		},
		[
			isHighestContext,
			onBack,
			results,
			rowVirtualizer,
			selectItem,
			selectedIndexRounded,
		],
	);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setQuery(e.target.value);
			setSelectedIndex(0);
			setPreviewId(null);
			pendingFocus.current = null;
			rowVirtualizer.scrollToOffset(0);
		},
		[rowVirtualizer],
	);

	if (!track) {
		return <InspectorMessage>Sequence inspector unavailable</InspectorMessage>;
	}

	if (!canAddEffects) {
		return <InspectorMessage>Adding effects is unavailable</InspectorMessage>;
	}

	return (
		<div style={container} onKeyDown={onKeyDown}>
			<div style={content}>
				<RemotionInput
					type="text"
					style={inputStyle}
					small
					autoFocus
					status="ok"
					value={query}
					onChange={onTextChange}
					placeholder="Search effects..."
					aria-label="Search effects"
					onBlur={() => setPreviewId(null)}
					rightAlign={false}
				/>
			</div>
			<div
				ref={listRef}
				style={resultList}
				className={VERTICAL_SCROLLBAR_CLASSNAME}
			>
				{results.length === 0 ? (
					<div style={noResults}>No effects found</div>
				) : (
					<div
						style={{
							height: rowVirtualizer.getTotalSize(),
							position: 'relative',
							width: '100%',
						}}
					>
						{virtualRows.map((row) => (
							<div
								key={row.key}
								ref={rowVirtualizer.measureElement}
								data-index={row.index}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${row.start}px)`,
									display: 'grid',
									gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
									alignItems: 'start',
									gap: 4,
								}}
							>
								{results
									.slice(row.index * 2, row.index * 2 + 2)
									.map((item, i) => (
										<EffectPickerResult
											key={item.id}
											item={item}
											snapshot={snapshot}
											selected={selectedIndexRounded === row.index * 2 + i}
											isScrolling={rowVirtualizer.isScrolling}
											onPreview={onResultPreview}
											onFocus={onResultFocus}
											onSelected={selectItem}
										/>
									))}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
