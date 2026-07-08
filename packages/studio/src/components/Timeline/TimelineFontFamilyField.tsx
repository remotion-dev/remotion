import {PlayerInternals} from '@remotion/player';
import type {GoogleFontSourceEdit} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {CanUpdateSequencePropStatusStatic} from 'remotion';
import {
	BACKGROUND,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
} from '../../helpers/colors';
import {installRequiredPackages} from '../../helpers/install-required-package';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {CaretDown} from '../../icons/caret';
import {Checkmark} from '../../icons/Checkmark';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {Spacing} from '../layout';
import {MENU_INITIATOR_CLASSNAME} from '../Menu/is-menu-item';
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
const CLEAR_HOVER = 'rgba(255, 255, 255, 0.06)';
const INPUT_BORDER_COLOR_UNHOVERED = 'rgba(0, 0, 0, 0.6)';
const INPUT_BORDER_COLOR_HOVERED = 'rgba(255, 255, 255, 0.05)';

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

const loadedGoogleFontsForPreview = new Set<string>();
const loadingGoogleFontsForPreview = new Set<string>();
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
	marginLeft: 8,
	padding: '3px 4px',
	display: 'inline-flex',
	alignItems: 'center',
	backgroundColor: INPUT_BACKGROUND,
	borderWidth: 1,
	borderStyle: 'solid',
	maxWidth: 140,
	color: 'white',
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
	color: 'white',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	border: '1px solid rgba(255, 255, 255, 0.08)',
};

const searchInput: React.CSSProperties = {
	boxSizing: 'border-box',
	width: '100%',
	backgroundColor: INPUT_BACKGROUND,
	border: '1px solid rgba(255, 255, 255, 0.12)',
	color: 'white',
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
	background: 'transparent',
	color: 'white',
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
	color: '#ff8a8a',
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

const getGoogleFontSourceEdit = ({
	fontFamily,
	importName,
	weights,
}: {
	readonly fontFamily: string;
	readonly importName: string;
	readonly weights: string[];
}): GoogleFontSourceEdit => {
	return {
		fontFamily,
		importName,
		style: 'normal',
		weights,
		subsets: ['latin'],
	};
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

const getGoogleFontUrlsFromCss = (cssText: string) => {
	return [...cssText.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1]);
};

const loadGoogleFontWeight = async ({
	cssFamily,
	fontFaceFamily,
	weight,
	document,
	text,
}: {
	readonly cssFamily: string;
	readonly fontFaceFamily: string;
	readonly weight: string;
	readonly document: Document;
	readonly text: string | null;
}) => {
	const response = await fetch(
		`https://fonts.googleapis.com/css?family=${cssFamily}:${weight}${
			text === null ? '' : `&text=${encodeURIComponent(text)}`
		}`,
	);
	if (!response.ok) {
		return false;
	}

	const cssText = await response.text();
	const urls = getGoogleFontUrlsFromCss(cssText);
	if (urls.length === 0) {
		return false;
	}

	await Promise.all(
		urls.map(async (url) => {
			const fontFace = new FontFace(fontFaceFamily, `url(${url})`, {weight});
			await fontFace.load();
			document.fonts.add(fontFace);
		}),
	);
	return true;
};

const commonPreviewFontWeights = ['400', '700', '800'];

const getGoogleFontPreviewWeights = (weights: string[]) => {
	const commonWeights = weights.filter((weight) =>
		commonPreviewFontWeights.includes(weight),
	);
	return commonWeights.length ? commonWeights : weights.slice(0, 1);
};

const loadGoogleFontForPreview = async ({
	fontFamily,
	cssFamily,
	weights,
	document,
}: {
	readonly fontFamily: string;
	readonly cssFamily: string;
	readonly weights: string[];
	readonly document: Document;
}) => {
	if (
		loadedGoogleFontsForPreview.has(fontFamily) ||
		loadingGoogleFontsForPreview.has(fontFamily)
	) {
		return;
	}

	if (!GOOGLE_FONTS_LIST.some((font) => font.fontFamily === fontFamily)) {
		return;
	}

	loadingGoogleFontsForPreview.add(fontFamily);
	try {
		const loadedWeights = await Promise.all(
			getGoogleFontPreviewWeights(weights).map((weight) =>
				loadGoogleFontWeight({
					cssFamily,
					fontFaceFamily: fontFamily,
					weight,
					document,
					text: null,
				}),
			),
		);
		if (loadedWeights.some(Boolean)) {
			loadedGoogleFontsForPreview.add(fontFamily);
		}
	} finally {
		loadingGoogleFontsForPreview.delete(fontFamily);
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
	const current = getCurrentValue({effectiveValue, fallback});
	const defaultOption = useMemo((): FontFamilyOption => {
		return {
			id: 'default',
			fontFamily: fallback ?? null,
			label: fallback ? `Default (${fallback})` : 'Default',
			source: 'Default',
			value: fallback,
		};
	}, [fallback]);
	const [opened, setOpened] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [query, setQuery] = useState('');
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const [scrollTop, setScrollTop] = useState(0);
	const [loadedPickerPreviewFonts, setLoadedPickerPreviewFonts] = useState(
		() => new Set(loadedGoogleFontsForPickerPreview),
	);
	const [saveError, setSaveError] = useState<string | null>(null);
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

	const hide = useCallback(() => {
		setOpened(false);
		setQuery('');
	}, []);

	const selectOption = useCallback(
		(option: FontFamilyOption) => {
			setSaveError(null);
			if (option.value === propStatus.codeValue) {
				hide();
				return;
			}

			onDragValueChange(option.value);
			hide();

			const save = async () => {
				if (option.source !== 'Google Fonts' || !option.googleFontImportName) {
					await onSave(option.value);
					return;
				}

				await installRequiredPackages(['@remotion/google-fonts']);
				const googleFont = getGoogleFontSourceEdit({
					fontFamily: option.value ?? option.label,
					importName: option.googleFontImportName,
					weights: option.googleFontWeights ?? ['400'],
				});
				await onSave(option.value, {
					sourceEdit: {type: 'google-font', font: googleFont},
				});
			};

			save()
				.catch((err) => {
					onDragValueChange(propStatus.codeValue);
					setSaveError(err instanceof Error ? err.message : String(err));
				})
				.finally(() => {
					onDragEnd();
				});
		},
		[propStatus.codeValue, onDragValueChange, hide, onSave, onDragEnd],
	);

	const toggleOpened = useCallback(() => {
		if (opened) {
			setOpened(false);
			return;
		}

		size?.refresh?.();
		setOpened(true);
	}, [opened, size]);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const selectedIndex = filteredOptions.findIndex(
			(option) => option.value === current,
		);
		const nextIndex = Math.max(0, selectedIndex);
		setHighlightedIndex(nextIndex);

		requestAnimationFrame(() => {
			inputRef.current?.focus();
			const list = listRef.current;
			if (!list) {
				return;
			}

			list.scrollTop = Math.max(
				0,
				nextIndex * ROW_HEIGHT - LIST_HEIGHT / 2 + ROW_HEIGHT / 2,
			);
		});
	}, [current, filteredOptions, opened]);

	useEffect(() => {
		setHighlightedIndex(0);
		if (listRef.current) {
			listRef.current.scrollTop = 0;
		}
	}, [query]);

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
			cssFamily: googleFont.previewUrl,
			weights: googleFont.weights,
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
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setHighlightedIndex((prev) => {
					const next = Math.max(
						0,
						Math.min(filteredOptions.length - 1, prev + 1),
					);
					if (listRef.current) {
						scrollIndexIntoView({index: next, list: listRef.current});
					}

					return next;
				});
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				setHighlightedIndex((prev) => {
					const next = Math.max(0, prev - 1);
					if (listRef.current) {
						scrollIndexIntoView({index: next, list: listRef.current});
					}

					return next;
				});
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
		[filteredOptions, hide, highlightedIndex, selectOption],
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
				title={field.key}
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
					title={selected.label}
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
												onChange={(event) => setQuery(event.target.value)}
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
																		: 'transparent',
															}}
															onPointerEnter={() =>
																setHighlightedIndex(actualIndex)
															}
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
										<div
											style={{
												padding: '6px 8px',
												color: LIGHT_TEXT,
												fontSize: 10,
											}}
										>
											Google Fonts are loaded for Studio preview and saved to
											your composition when selected.
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
