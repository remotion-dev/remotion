import {
	EFFECT_CATALOG,
	getEffectDocumentationLink,
	type EffectCatalogItem,
} from '@remotion/studio-shared';
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
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_06,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {observeHover} from '../helpers/observe-hover';
import {ExternalLinkIcon} from '../icons/external-link';
import {useZIndex} from '../state/z-index';
import {ContextMenu} from './ContextMenu';
import {addEffectToSequence} from './effect-drag-and-drop';
import {getEffectPickerConfig} from './effect-picker-config';
import {filterEffectCatalog} from './effect-picker-search';
import {
	effectPreviewLoaders,
	type EffectPreviewFactory,
} from './effect-preview-loaders';
import type {EffectPickerState} from './EffectPickerProvider';
import {EffectThumbnail} from './EffectThumbnail';
import {InspectorBackAction} from './InspectorPanel/common';
import {container} from './InspectorPanel/styles';
import {useTrackForSelection} from './InspectorPanel/use-track-for-selection';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {RemotionInput} from './NewComposition/RemInput';
import {
	QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE,
	loopIndex,
	useScrollIntoViewOnSelected,
} from './QuickSwitcher/shared';

const content: React.CSSProperties = {
	padding: '4px 10px 10px',
};

const inputStyle: React.CSSProperties = {
	width: '100%',
	borderRadius: 4,
};

const aboutEffectsRow: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
	marginBottom: 8,
};

const aboutEffectsLink: React.CSSProperties = {
	alignItems: 'center',
	cursor: 'default',
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	gap: 4,
	lineHeight: '14px',
	minWidth: 0,
	textDecoration: 'none',
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
};

const aboutEffectsLabel: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: '14px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const aboutEffectsIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

const resultList: React.CSSProperties = {
	flex: 1,
	minHeight: 0,
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	alignContent: 'start',
	gap: 4,
	overflowY: 'auto',
	padding: '0 7px 10px',
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
	gap: 1,
	padding: '3px 3px 1px',
	minWidth: 0,
	borderRadius: 4,
};

const label: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	lineHeight: '18px',
	fontSize: QUICK_SWITCHER_RESULT_LABEL_FONT_SIZE - 2,
	overflowWrap: 'anywhere',
};

const EffectPickerResult: React.FC<{
	readonly item: EffectCatalogItem;
	readonly snapshot: HTMLCanvasElement | null;
	readonly selected: boolean;
	readonly onSelected: (item: EffectCatalogItem) => void;
	readonly onPreview: (id: string | null) => void;
	readonly onFocus: (item: EffectCatalogItem) => void;
}> = React.memo(
	({item, snapshot, selected, onSelected, onPreview, onFocus}) => {
		const ref = useRef<HTMLButtonElement>(null);

		useScrollIntoViewOnSelected(ref, selected);

		useEffect(() => {
			const element = ref.current;
			if (!element) {
				return;
			}

			return observeHover({
				element,
				onHoverChange: (hovered) => onPreview(hovered ? item.id : null),
			});
		}, [item.id, onPreview]);

		const style = useMemo((): React.CSSProperties => {
			return {
				...resultContainer,
				...hoverableStyle({
					idleBackground: selected ? WHITE_ALPHA_06 : TRANSPARENT,
					hoverBackground: WHITE_ALPHA_06,
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
					onBlur={() => onPreview(null)}
				>
					<EffectThumbnail item={item} snapshot={snapshot} />
					<span style={label}>{item.label}</span>
				</button>
			</ContextMenu>
		);
	},
);

export const EffectPicker: React.FC<{
	readonly state: EffectPickerState;
	readonly onBack: () => void;
}> = ({state, onBack}) => {
	const [query, setQuery] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [previewId, setPreviewId] = useState<string | null>(null);
	const [previewFailed, setPreviewFailed] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const {isHighestContext} = useZIndex();
	const previewStore = useContext(Internals.EffectPreviewContext);
	const {setPreview} = previewStore;
	const selection = useMemo(
		() => ({type: 'sequence' as const, nodePathInfo: state.nodePathInfo}),
		[state.nodePathInfo],
	);
	const track = useTrackForSelection(selection);
	const runtimeValues = track?.sequence.controls?.runtimeValues ?? null;
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
		setPreviewFailed(false);
		const item = EFFECT_CATALOG.find((entry) => entry.id === previewId);
		if (!item || !runtimeValues || !isHighestContext) {
			return;
		}

		let cancelled = false;
		const loader = effectPreviewLoaders[item.effect.importPath];
		if (!loader) {
			setPreviewFailed(true);
			return;
		}

		loader()
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
					setPreviewFailed(true);
				}
			});

		return () => {
			cancelled = true;
			setPreview(null);
		};
	}, [isHighestContext, previewId, runtimeValues, setPreview]);

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

	const selectItem = useCallback(
		(item: EffectCatalogItem) => {
			onBack();
			addEffectToSequence({
				clientId: state.clientId,
				effect: {...item.effect, config: getEffectPickerConfig(item)},
				fileName: state.fileName,
				nodePathInfo: state.nodePathInfo,
				selectItems: state.selectItems,
			});
		},
		[
			onBack,
			state.clientId,
			state.fileName,
			state.nodePathInfo,
			state.selectItems,
		],
	);

	const onResultFocus = useCallback(
		(item: EffectCatalogItem) => {
			setSelectedIndex(results.indexOf(item));
			setPreviewId(item.id);
		},
		[results],
	);

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
						: !isSearch && event.key === 'ArrowRight'
							? 1
							: !isSearch && event.key === 'ArrowLeft'
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
				listRef.current
					?.querySelectorAll<HTMLButtonElement>('[data-effect-id]')
					[nextIndex]?.focus();
			}
		},
		[isHighestContext, onBack, results, selectItem, selectedIndexRounded],
	);

	const onTextChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setQuery(e.target.value);
			setSelectedIndex(0);
			setPreviewId(null);
		},
		[],
	);

	return (
		<div style={container} onKeyDown={onKeyDown}>
			<InspectorBackAction
				disabled={false}
				onClick={onBack}
				aria-label="Back to inspector"
			>
				Back
			</InspectorBackAction>
			<div style={content}>
				<div style={aboutEffectsRow}>
					<a
						href="https://remotion.dev/effects"
						target="_blank"
						rel="noopener noreferrer"
						style={aboutEffectsLink}
						className={HOVERABLE_CLASS_NAME}
					>
						<span style={aboutEffectsLabel}>About effects</span>
						<ExternalLinkIcon
							aria-hidden="true"
							color={CURRENT_COLOR}
							style={aboutEffectsIcon}
						/>
					</a>
				</div>
				<RemotionInput
					type="text"
					style={inputStyle}
					autoFocus
					status="ok"
					value={query}
					onChange={onTextChange}
					placeholder="Search effects..."
					aria-label="Search effects"
					onBlur={() => setPreviewId(null)}
					rightAlign={false}
				/>
				{previewFailed ? (
					<div role="status" style={noResults}>
						Could not load effect preview
					</div>
				) : null}
			</div>
			<div
				ref={listRef}
				style={resultList}
				className={VERTICAL_SCROLLBAR_CLASSNAME}
			>
				{results.length === 0 ? (
					<div style={noResults}>No effects found</div>
				) : (
					results.map((item, i) => {
						return (
							<EffectPickerResult
								key={item.id}
								item={item}
								snapshot={snapshot}
								selected={selectedIndexRounded === i}
								onPreview={setPreviewId}
								onFocus={onResultFocus}
								onSelected={selectItem}
							/>
						);
					})
				)}
			</div>
		</div>
	);
};
