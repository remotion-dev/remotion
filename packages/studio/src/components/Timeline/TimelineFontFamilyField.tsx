import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {
	BACKGROUND,
	BLACK_ALPHA_60,
	BORDER_WHITE_ALPHA_12,
	FONT_FAMILY_ERROR_COLOR,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
	TRANSPARENT,
	WHITE,
	WHITE_ALPHA_05,
	WHITE_ALPHA_06,
	WHITE_ALPHA_08,
} from '../../helpers/colors';
import {loadGoogleFontForPreview} from '../../helpers/load-google-font-for-preview';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {CaretDown} from '../../icons/caret';
import {Checkmark} from '../../icons/Checkmark';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {Spacing} from '../layout';
import {
	MENU_INITIATOR_CLASSNAME,
	VERTICAL_SCROLLBAR_CLASSNAME,
} from '../Menu/is-menu-item';
import {getPortal} from '../Menu/portals';
import {
	SHADOW_TOWARDS_BOTTOM,
	SHADOW_TOWARDS_TOP,
	fullScreenOverlay,
	outerPortal,
} from '../Menu/styles';
import {GOOGLE_FONTS_LIST} from './google-fonts-list';

const ROW_HEIGHT = 30;
const LIST_HEIGHT = 280;
const OVERSCAN = 10;
const POPOVER_WIDTH = 280;
const CLEAR_HOVER = WHITE_ALPHA_06;
const INPUT_BORDER_COLOR_UNHOVERED = BLACK_ALPHA_60;
const INPUT_BORDER_COLOR_HOVERED = WHITE_ALPHA_05;

const googleFonts = GOOGLE_FONTS_LIST.map((font) => ({
	id: `google-${font.importName}`,
	fontFamily: font.fontFamily,
	label: font.fontFamily,
	source: 'Google Fonts' as const,
	value: font.fontFamily,
	googleFontImportName: font.importName,
	googleFontCssFamily: font.previewUrl,
	googleFontWeights: font.weights,
}));

const loadedGoogleFontsForPickerPreview = new Set<string>();
const loadingGoogleFontsForPickerPreview = new Set<string>();

const systemFonts = [
	'Arial',
	'Helvetica',
	'Inter',
	'Georgia',
	'Times New Roman',
	'Courier New',
	'Verdana',
	'Tahoma',
	'Trebuchet MS',
	'sans-serif',
	'serif',
	'monospace',
].map((fontFamily) => ({
	id: `system-${fontFamily}`,
	fontFamily,
	label: fontFamily,
	source: 'System' as const,
	value: fontFamily,
}));

type FontFamilyOption = {
	readonly id: string;
	readonly fontFamily: string | null;
	readonly label: string;
	readonly source: 'Default' | 'System' | 'Google Fonts' | 'Current';
	readonly value: string | undefined;
	readonly googleFontImportName?: string;
	readonly googleFontCssFamily?: string;
	readonly googleFontWeights?: string[];
};

const triggerStyle: React.CSSProperties = {
	padding: '3px 4px',
	display: 'inline-flex',
	alignItems: 'center',
	backgroundColor: INPUT_BACKGROUND,
	borderWidth: 1,
	borderStyle: 'solid',
	maxWidth: 140,
	color: WHITE,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const triggerLabel: React.CSSProperties = {
	fontSize: 11,
	lineHeight: 1,
	textAlign: 'left',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const popover: React.CSSProperties = {
	position: 'fixed',
	width: POPOVER_WIDTH,
	backgroundColor: BACKGROUND,
	color: WHITE,
	userSelect: 'none',
	WebkitUserSelect: 'none',
	border: `1px solid ${WHITE_ALPHA_08}`,
};

const searchInput: React.CSSProperties = {
	boxSizing: 'border-box',
	width: '100%',
	backgroundColor: INPUT_BACKGROUND,
	border: BORDER_WHITE_ALPHA_12,
	color: WHITE,
	fontSize: 12,
	outline: 'none',
	padding: '6px 8px',
};

const listStyle: React.CSSProperties = {
	height: LIST_HEIGHT,
	overflowY: 'auto',
	overflowX: 'hidden',
	position: 'relative',
};

const noResults: React.CSSProperties = {
	fontSize: 12,
	color: LIGHT_TEXT,
	padding: 12,
};

const optionButton: React.CSSProperties = {
	height: ROW_HEIGHT,
	width: '100%',
	border: 'none',
	background: TRANSPARENT,
	color: WHITE,
	display: 'flex',
	alignItems: 'center',
	padding: '0 8px',
	fontSize: 12,
	textAlign: 'left',
	cursor: 'default',
};

const optionLabel: React.CSSProperties = {
	flex: 1,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	fontSize: 12,
};

const optionSource: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 10,
	marginLeft: 8,
};

const errorText: React.CSSProperties = {
	padding: '6px 8px',
	color: FONT_FAMILY_ERROR_COLOR,
	fontSize: 10,
};

const portalStyle = ({
	size,
}: {
	size: NonNullable<ReturnType<typeof PlayerInternals.useElementSize>>;
}): React.CSSProperties => {
	const margin = 10;
	const spaceToBottom =
		size.windowSize.height - (size.top + size.height) - margin;
	const spaceToTop = size.top - margin;
	const openDown = spaceToBottom >= LIST_HEIGHT || spaceToBottom >= spaceToTop;
	const left = Math.min(
		Math.max(0, size.left),
		Math.max(0, size.windowSize.width - POPOVER_WIDTH),
	);

	return {
		...popover,
		boxShadow: openDown ? SHADOW_TOWARDS_BOTTOM : SHADOW_TOWARDS_TOP,
		left,
		...(openDown
			? {top: size.top + size.height}
			: {bottom: size.windowSize.height - size.top}),
	};
};

const getCurrentValue = ({
	effectiveValue,
	fallback,
}: {
	readonly effectiveValue: unknown;
	readonly fallback: string | undefined;
}) => {
	return typeof effectiveValue === 'string' ? effectiveValue : fallback;
};

const scrollIndexIntoView = ({
	index,
	list,
}: {
	readonly index: number;
	readonly list: HTMLDivElement;
}) => {
	const top = index * ROW_HEIGHT;
	const bottom = top + ROW_HEIGHT;
	if (top < list.scrollTop) {
		list.scrollTop = top;
		return;
	}

	if (bottom > list.scrollTop + LIST_HEIGHT) {
		list.scrollTop = bottom - LIST_HEIGHT;
	}
};

const makeFontPreviewName = (fontFamily: string) => {
	return `${fontFamily}Preview`;
};

const loadGoogleFontForPickerPreview = async ({
	fontFamily,
	cssFamily,
	document,
}: {
	readonly fontFamily: string;
	readonly cssFamily: string;
	readonly document: Document;
}) => {
	if (
		loadedGoogleFontsForPickerPreview.has(fontFamily) ||
		loadingGoogleFontsForPickerPreview.has(fontFamily)
	) {
		return;
	}

	loadingGoogleFontsForPickerPreview.add(fontFamily);
	try {
		const response = await fetch(
			`https://fonts.googleapis.com/css?family=${cssFamily}:400&text=${encodeURIComponent(
				fontFamily,
			)}`,
		);
		if (!response.ok) {
			return;
		}

		const cssText = await response.text();
		const match = cssText.match(/url\(([^)]+)\)/);
		const url = match?.[1];
		if (!url) {
			return;
		}

		const fontFace = new FontFace(
			makeFontPreviewName(fontFamily),
			`url(${url})`,
			{weight: '400'},
		);
		await fontFace.load();
		document.fonts.add(fontFace);
		loadedGoogleFontsForPickerPreview.add(fontFamily);
	} finally {
		loadingGoogleFontsForPickerPreview.delete(fontFamily);
	}
};

export const TimelineFontFamilyField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly propStatus: CanUpdateSequencePropStatusStatic;
	readonly effectiveValue: unknown;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	propStatus,
	effectiveValue,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const {fieldSchema} = field;
	if (fieldSchema.type !== 'font-family') {
		throw new Error(
			'TimelineFontFamilyField rendered for non-font-family field',
		);
	}

	const fallback = fieldSchema.default;
	// Drag overrides feed back through effectiveValue. Keep the committed
	// selection stable while browsing so previews cannot move the checkmark,
	// change the trigger label, or reorder the options.
	const [openedValue, setOpenedValue] = useState<{
		value: string | undefined;
	} | null>(null);
	const opened = openedValue !== null;
	const current = openedValue
		? openedValue.value
		: getCurrentValue({effectiveValue, fallback});
	const defaultOption = useMemo((): FontFamilyOption => {
		return {
			id: 'default',
			fontFamily: fallback ?? null,
			label: fallback ? `Default (${fallback})` : 'Default',
			source: 'Default',
			value: fallback,
		};
	}, [fallback]);
	const [hovered, setHovered] = useState(false);
	const [query, setQuery] = useState('');
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [loadedPickerPreviewFonts, setLoadedPickerPreviewFonts] = useState(
		() => new Set(loadedGoogleFontsForPickerPreview),
	);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const pendingSelection = useRef(false);
	const hoverGeneration = useRef(0);
	const previewedOption = useRef<string | null>(null);
	const initialScrollTop = useRef(0);
	const activePreview = useRef<(() => void) | null>(null);
	useEffect(() => {
		const hoverRequest = hoverGeneration;
		const preview = activePreview;
		return () => {
			hoverRequest.current++;
			preview.current?.();
			preview.current = null;
		};
	}, []);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const {tabIndex, currentZIndex} = useZIndex();
	const size = PlayerInternals.useElementSize(buttonRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const options = useMemo((): FontFamilyOption[] => {
		const base = [defaultOption, ...systemFonts, ...googleFonts];
		if (!current || base.some((option) => option.value === current)) {
			return base;
		}

		return [
			defaultOption,
			{
				id: `current-${current}`,
				fontFamily: current,
				label: current,
				source: 'Current',
				value: current,
			},
			...systemFonts,
			...googleFonts,
		];
	}, [current, defaultOption]);

	const filteredOptions = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) {
			return options;
		}

		return options.filter((option) => {
			return option.label.toLowerCase().includes(needle);
		});
	}, [options, query]);

	const selected = useMemo(() => {
		return options.find((option) => option.value === current) ?? defaultOption;
	}, [current, defaultOption, options]);

	const visibleRange = useMemo(() => {
		const visibleCount = Math.ceil(LIST_HEIGHT / ROW_HEIGHT);
		const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
		const end = Math.min(
			filteredOptions.length,
			start + visibleCount + OVERSCAN * 2,
		);
		return {start, end};
	}, [filteredOptions.length, scrollTop]);

	const clearHoverPreview = useCallback(() => {
		hoverGeneration.current++;
		previewedOption.current = null;
		activePreview.current?.();
		activePreview.current = null;
	}, []);

	const previewOption = useCallback(
		async (option: FontFamilyOption) => {
			if (previewedOption.current === option.id) {
				return;
			}

			previewedOption.current = option.id;
			setPreviewError(null);
			const generation = ++hoverGeneration.current;
			if (option.source === 'Google Fonts' && option.googleFontCssFamily) {
				try {
					await loadGoogleFontForPreview({
						fontFamily: option.value ?? option.label,
						document,
					});
				} catch (err) {
					// Font downloads/decoding can fail. This UI boundary reports
					// that failure without treating the font as successfully previewed.
					if (generation === hoverGeneration.current) {
						clearHoverPreview();
						setPreviewError(
							`Could not preview ${option.label}: ${err instanceof Error ? err.message : String(err)}`,
						);
					}

					return;
				}
			}

			if (generation !== hoverGeneration.current) {
				return;
			}

			activePreview.current = onDragEnd;
			try {
				onDragValueChange(option.value);
			} catch (err) {
				// A callback failure is a programming error, not a font-loading
				// failure. Release the override, then let the error propagate.
				clearHoverPreview();
				throw err;
			}
		},
		[clearHoverPreview, onDragEnd, onDragValueChange],
	);

	const hide = useCallback(() => {
		if (!pendingSelection.current) {
			clearHoverPreview();
		}

		setPreviewError(null);
		setOpenedValue(null);
		setQuery('');
	}, [clearHoverPreview]);

	const selectOption = useCallback(
		async (option: FontFamilyOption) => {
			if (pendingSelection.current) {
				return;
			}

			setSaveError(null);
			if (option.value === propStatus.codeValue) {
				hide();
				return;
			}

			// Retain an already-loaded hover preview until the save completes,
			// but stop pending hover loads and browsing from changing it.
			pendingSelection.current = true;
			hoverGeneration.current++;
			hide();
			setSaving(true);
			try {
				// Queue the intent immediately. Font/package preparation belongs to
				// the source edit, so subsequent undo/redo cannot overtake it.
				await onSave(
					option.value,
					option.source === 'Google Fonts' && option.googleFontImportName
						? {
								sourceEdit: {
									type: 'google-font',
									font: {
										fontFamily: option.value ?? option.label,
										importName: option.googleFontImportName,
										style: 'normal',
										weights: option.googleFontWeights ?? ['400'],
										subsets: ['latin'],
									},
								},
							}
						: undefined,
				);
			} catch (err) {
				setSaveError(err instanceof Error ? err.message : String(err));
			} finally {
				pendingSelection.current = false;
				setSaving(false);
				clearHoverPreview();
			}
		},
		[propStatus.codeValue, hide, onSave, clearHoverPreview],
	);

	const toggleOpened = useCallback(() => {
		if (pendingSelection.current) {
			return;
		}

		if (opened) {
			hide();
			return;
		}

		const selectedIndex = Math.max(
			0,
			options.findIndex((option) => option.value === current),
		);
		initialScrollTop.current = Math.max(
			0,
			selectedIndex * ROW_HEIGHT - LIST_HEIGHT / 2 + ROW_HEIGHT / 2,
		);
		setHighlightedIndex(selectedIndex);
		setScrollTop(initialScrollTop.current);
		size?.refresh?.();
		setOpenedValue({value: current});
	}, [current, hide, opened, options, size]);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const request = requestAnimationFrame(() => {
			inputRef.current?.focus();
			const list = listRef.current;
			if (!list) {
				return;
			}

			list.scrollTop = initialScrollTop.current;
		});
		return () => cancelAnimationFrame(request);
	}, [opened]);

	useEffect(() => {
		if (!current) {
			return;
		}

		const googleFont = GOOGLE_FONTS_LIST.find(
			(font) => font.fontFamily === current,
		);
		if (!googleFont) {
			return;
		}

		loadGoogleFontForPreview({
			fontFamily: current,
			document,
		}).catch(() => undefined);
		loadGoogleFontForPickerPreview({
			fontFamily: current,
			cssFamily: googleFont.previewUrl,
			document,
		})
			.then(() => {
				setLoadedPickerPreviewFonts(new Set(loadedGoogleFontsForPickerPreview));
			})
			.catch(() => undefined);
	}, [current]);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const visibleGoogleFonts = filteredOptions
			.slice(visibleRange.start, visibleRange.end)
			.filter(
				(option) =>
					option.source === 'Google Fonts' &&
					option.fontFamily &&
					option.googleFontCssFamily,
			);

		if (visibleGoogleFonts.length === 0) {
			return;
		}

		Promise.all(
			visibleGoogleFonts.map((font) =>
				loadGoogleFontForPickerPreview({
					fontFamily: font.fontFamily as string,
					cssFamily: font.googleFontCssFamily as string,
					document,
				}),
			),
		)
			.then(() => {
				setLoadedPickerPreviewFonts(new Set(loadedGoogleFontsForPickerPreview));
			})
			.catch(() => undefined);
	}, [filteredOptions, opened, visibleRange.end, visibleRange.start]);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				const next = Math.max(
					0,
					Math.min(
						filteredOptions.length - 1,
						highlightedIndex + (event.key === 'ArrowDown' ? 1 : -1),
					),
				);
				setHighlightedIndex(next);
				if (listRef.current) {
					scrollIndexIntoView({index: next, list: listRef.current});
				}

				const option = filteredOptions[next];
				if (option) {
					previewOption(option);
				}
			}

			if (event.key === 'Enter') {
				event.preventDefault();
				const option = filteredOptions[highlightedIndex];
				if (option) {
					selectOption(option);
				}
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				hide();
			}
		},
		[filteredOptions, hide, highlightedIndex, previewOption, selectOption],
	);

	const renderedOptions = filteredOptions.slice(
		visibleRange.start,
		visibleRange.end,
	);
	const getOptionPreviewStyle = useCallback(
		(option: FontFamilyOption): React.CSSProperties => {
			if (
				option.source !== 'Google Fonts' ||
				!option.fontFamily ||
				!loadedPickerPreviewFonts.has(option.fontFamily)
			) {
				return {};
			}

			return {fontFamily: makeFontPreviewName(option.fontFamily)};
		},
		[loadedPickerPreviewFonts],
	);
	const style = useMemo((): React.CSSProperties => {
		return {
			...triggerStyle,
			borderColor: opened
				? SELECTED_BACKGROUND
				: hovered
					? INPUT_BORDER_COLOR_HOVERED
					: INPUT_BORDER_COLOR_UNHOVERED,
		};
	}, [hovered, opened]);
	const selectedPreviewStyle = getOptionPreviewStyle(selected);

	return (
		<>
			<button
				ref={buttonRef}
				disabled={saving}
				aria-busy={saving}
				aria-label={field.key}
				tabIndex={tabIndex}
				type="button"
				style={style}
				className={MENU_INITIATOR_CLASSNAME}
				onPointerDown={(event) => {
					event.stopPropagation();
					toggleOpened();
				}}
				onClick={(event) => {
					event.stopPropagation();
					if (event.detail === 0) {
						toggleOpened();
					}
				}}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				<div
					role="group"
					aria-label={selected.label}
					style={{...triggerLabel, ...selectedPreviewStyle}}
				>
					{selected.label}
				</div>
				<Spacing x={0.5} />
				<CaretDown small />
			</button>
			{saveError === null ? null : <div style={errorText}>{saveError}</div>}
			{opened && size
				? ReactDOM.createPortal(
						<div
							style={fullScreenOverlay}
							onPointerDown={(event) => event.stopPropagation()}
						>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={hide} onEscape={hide}>
									<div style={portalStyle({size})}>
										<div style={{padding: 6}}>
											<input
												ref={inputRef}
												value={query}
												onChange={(event) => {
													clearHoverPreview();
													setQuery(event.target.value);
													setHighlightedIndex(0);
													setScrollTop(0);
													if (listRef.current) {
														listRef.current.scrollTop = 0;
													}
												}}
												onKeyDown={onKeyDown}
												placeholder="Search fonts"
												style={searchInput}
											/>
										</div>
										{filteredOptions.length === 0 ? (
											<div style={noResults}>No fonts found</div>
										) : (
											<div
												ref={listRef}
												style={listStyle}
												className={VERTICAL_SCROLLBAR_CLASSNAME}
												onPointerLeave={clearHoverPreview}
												onScroll={(event) => {
													setScrollTop(event.currentTarget.scrollTop);
												}}
											>
												<div
													style={{height: visibleRange.start * ROW_HEIGHT}}
												/>
												{renderedOptions.map((option, index) => {
													const actualIndex = visibleRange.start + index;
													const isSelected = option.value === current;
													const isHighlighted =
														actualIndex === highlightedIndex;
													return (
														<button
															key={option.id}
															type="button"
															style={{
																...optionButton,
																backgroundColor: isHighlighted
																	? CLEAR_HOVER
																	: isSelected
																		? SELECTED_BACKGROUND
																		: TRANSPARENT,
															}}
															onPointerMove={() => {
																// Filtering or virtualizing can mount a row under a
																// stationary pointer. Only actual movement previews it.
																setHighlightedIndex(actualIndex);
																previewOption(option);
															}}
															onPointerDown={(event) => {
																event.preventDefault();
																event.stopPropagation();
																selectOption(option);
															}}
														>
															<span style={{width: 18}}>
																{isSelected ? <Checkmark size={11} /> : null}
															</span>
															<span
																style={{
																	...optionLabel,
																	...getOptionPreviewStyle(option),
																}}
															>
																{option.label}
															</span>
															<span style={optionSource}>{option.source}</span>
														</button>
													);
												})}
												<div
													style={{
														height:
															(filteredOptions.length - visibleRange.end) *
															ROW_HEIGHT,
													}}
												/>
											</div>
										)}
										{previewError === null ? null : (
											<div role="alert" style={errorText}>
												{previewError}
											</div>
										)}
										<div
											style={{
												padding: '6px 8px',
												color: LIGHT_TEXT,
												fontSize: 10,
											}}
										>
											Hover or use arrow keys to preview. Fonts are saved to
											your composition only when selected.
										</div>
									</div>
								</HigherZIndex>
							</div>
						</div>,
						getPortal(currentZIndex),
					)
				: null}
		</>
	);
};
