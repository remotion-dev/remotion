import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	formatRgba,
	hsvaToRgba,
	parseAnyColor,
	rgbaToHsva,
	type Hsva,
} from '../../helpers/color-conversion';
import {INPUT_BACKGROUND, LIGHT_TEXT} from '../../helpers/colors';
import {EyedropperIcon} from '../../icons/eyedropper';
import {AlphaSlider} from './AlphaSlider';
import {
	CHECKER_BACKGROUND_COLOR,
	CHECKER_BACKGROUND_IMAGE,
	CHECKER_BACKGROUND_POSITION,
	CHECKER_BACKGROUND_SIZE,
} from './checker';
import {HueSlider} from './HueSlider';
import {SaturationValueArea} from './SaturationValueArea';

export const POPUP_WIDTH = 240;
const POPUP_PADDING = 12;

const popupShellStyle: React.CSSProperties = {
	width: POPUP_WIDTH,
	padding: POPUP_PADDING,
	background: '#1f2428',
	border: '1px solid rgba(0, 0, 0, 0.6)',
	borderRadius: 4,
	boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
	color: 'white',
	fontSize: 12,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const sliderRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
};

const previewSwatchStyle: React.CSSProperties = {
	position: 'relative',
	width: 28,
	height: 28,
	flex: '0 0 auto',
	borderRadius: 14,
	overflow: 'hidden',
	border: '1px solid rgba(0, 0, 0, 0.6)',
	backgroundColor: CHECKER_BACKGROUND_COLOR,
	backgroundImage: CHECKER_BACKGROUND_IMAGE,
	backgroundSize: CHECKER_BACKGROUND_SIZE,
	backgroundPosition: CHECKER_BACKGROUND_POSITION,
};

const previewSwatchFillBase: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
};

const slidersColumnStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
	flex: 1,
};

const inputsRowStyle: React.CSSProperties = {
	display: 'flex',
	gap: 6,
	alignItems: 'flex-end',
};

const inputColumnStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	minWidth: 0,
};

const labelStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 10,
	textTransform: 'uppercase',
	letterSpacing: 0.5,
	marginBottom: 2,
};

const baseInputStyle: React.CSSProperties = {
	width: '100%',
	background: INPUT_BACKGROUND,
	border: '1px solid rgba(0, 0, 0, 0.6)',
	borderRadius: 3,
	color: 'white',
	padding: '4px 6px',
	fontSize: 12,
	textAlign: 'center',
	boxSizing: 'border-box',
};

const eyedropperButtonStyle: React.CSSProperties = {
	background: 'transparent',
	border: '1px solid rgba(0, 0, 0, 0.6)',
	borderRadius: 3,
	padding: 0,
	cursor: 'pointer',
	color: LIGHT_TEXT,
	width: 28,
	height: 28,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	flex: '0 0 auto',
};

const hasEyeDropper = (): boolean =>
	typeof window !== 'undefined' && 'EyeDropper' in window;

type ChannelInputProps = {
	readonly label: string;
	readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly tabIndex: number;
	readonly onCommit: (next: number) => void;
};

const ChannelInput: React.FC<ChannelInputProps> = ({
	label,
	value,
	min,
	max,
	tabIndex,
	onCommit,
}) => {
	const [draft, setDraft] = useState<string>(String(Math.round(value)));

	useEffect(() => {
		setDraft(String(Math.round(value)));
	}, [value]);

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setDraft(e.target.value);
	}, []);

	const onBlur = useCallback(() => {
		const parsed = Number(draft);
		if (Number.isNaN(parsed)) {
			setDraft(String(Math.round(value)));
			return;
		}

		const clamped = Math.max(min, Math.min(max, parsed));
		setDraft(String(Math.round(clamped)));
		onCommit(clamped);
	}, [draft, max, min, onCommit, value]);

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			(e.target as HTMLInputElement).blur();
		}
	}, []);

	return (
		<label style={inputColumnStyle}>
			<span style={labelStyle}>{label}</span>
			<input
				type="text"
				inputMode="numeric"
				value={draft}
				onChange={onChange}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				style={baseInputStyle}
				tabIndex={tabIndex}
			/>
		</label>
	);
};

const HexInput: React.FC<{
	readonly value: string;
	readonly onCommit: (next: string) => void;
	readonly tabIndex: number;
}> = ({value, onCommit, tabIndex}) => {
	const [draft, setDraft] = useState(value);

	useEffect(() => {
		setDraft(value);
	}, [value]);

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setDraft(e.target.value);
	}, []);

	const onBlur = useCallback(() => {
		try {
			const parsed = parseAnyColor(draft);
			onCommit(formatRgba(parsed));
		} catch {
			setDraft(value);
		}
	}, [draft, onCommit, value]);

	const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			(e.target as HTMLInputElement).blur();
		}
	}, []);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...baseInputStyle,
			textAlign: 'left',
		};
	}, []);

	return (
		<label style={inputColumnStyle}>
			<span style={labelStyle}>Hex</span>
			<input
				type="text"
				value={draft}
				onChange={onChange}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				style={style}
				autoComplete="off"
				spellCheck={false}
				tabIndex={tabIndex}
			/>
		</label>
	);
};

export const ColorPickerPopup: React.FC<{
	readonly value: string;
	readonly onChange: (next: string) => void;
	readonly onChangeComplete: (next: string) => void;
	readonly tabIndex: number;
}> = ({value, onChange, onChangeComplete, tabIndex}) => {
	// HSV is the source of truth while the picker is open. We seed it from
	// the incoming value but keep our own state so that hue and saturation
	// don't snap back to 0 when the user drags into pure black/white.
	const [hsva, setHsva] = useState<Hsva>(() =>
		rgbaToHsva(parseAnyColor(value)),
	);
	const lastEmittedRef = useRef<string>(formatRgba(parseAnyColor(value)));

	useEffect(() => {
		// Sync from external value changes that didn't originate from us.
		const incoming = formatRgba(parseAnyColor(value));
		if (incoming === lastEmittedRef.current) {
			return;
		}

		lastEmittedRef.current = incoming;
		setHsva(rgbaToHsva(parseAnyColor(value)));
	}, [value]);

	const rgba = useMemo(() => hsvaToRgba(hsva), [hsva]);
	const formatted = useMemo(() => formatRgba(rgba), [rgba]);

	const emit = useCallback(
		(next: Hsva, mode: 'change' | 'complete') => {
			setHsva(next);
			const nextRgba = hsvaToRgba(next);
			const nextFormatted = formatRgba(nextRgba);
			lastEmittedRef.current = nextFormatted;
			if (mode === 'complete') {
				onChangeComplete(nextFormatted);
			} else {
				onChange(nextFormatted);
			}
		},
		[onChange, onChangeComplete],
	);

	const onSvChange = useCallback(
		(next: {s: number; v: number}) => {
			emit({...hsva, s: next.s, v: next.v}, 'change');
		},
		[emit, hsva],
	);

	const onSvComplete = useCallback(
		(next: {s: number; v: number}) => {
			emit({...hsva, s: next.s, v: next.v}, 'complete');
		},
		[emit, hsva],
	);

	const onHueChange = useCallback(
		(next: number) => {
			emit({...hsva, h: next}, 'change');
		},
		[emit, hsva],
	);

	const onHueComplete = useCallback(
		(next: number) => {
			emit({...hsva, h: next}, 'complete');
		},
		[emit, hsva],
	);

	const onAlphaChange = useCallback(
		(next: number) => {
			emit({...hsva, a: next}, 'change');
		},
		[emit, hsva],
	);

	const onAlphaComplete = useCallback(
		(next: number) => {
			emit({...hsva, a: next}, 'complete');
		},
		[emit, hsva],
	);

	const onChannelCommit = useCallback(
		(channel: 'r' | 'g' | 'b' | 'a', next: number) => {
			const updatedRgba = {...rgba, [channel]: next};
			const newHsva = rgbaToHsva(updatedRgba);
			// Preserve hue when transitioning through achromatic colors.
			if (newHsva.s === 0) {
				newHsva.h = hsva.h;
			}

			emit(newHsva, 'complete');
		},
		[emit, hsva.h, rgba],
	);

	const onHexCommit = useCallback(
		(next: string) => {
			const parsed = parseAnyColor(next);
			const newHsva = rgbaToHsva(parsed);
			if (newHsva.s === 0) {
				newHsva.h = hsva.h;
			}

			emit(newHsva, 'complete');
		},
		[emit, hsva.h],
	);

	const onPickWithEyeDropper = useCallback(() => {
		const Ctor = (
			window as unknown as {
				EyeDropper?: new () => {open: () => Promise<{sRGBHex: string}>};
			}
		).EyeDropper;
		if (!Ctor) {
			return;
		}

		const dropper = new Ctor();
		dropper
			.open()
			.then((result) => {
				const parsed = parseAnyColor(result.sRGBHex);
				// `EyeDropper` always returns full opacity; preserve the user's
				// previously chosen alpha so opening it doesn't drop transparency.
				parsed.a = rgba.a;
				const newHsva = rgbaToHsva(parsed);
				if (newHsva.s === 0) {
					newHsva.h = hsva.h;
				}

				emit(newHsva, 'complete');
			})
			.catch(() => {
				// Aborted; ignore.
			});
	}, [emit, hsva.h, rgba.a]);

	const previewFill: React.CSSProperties = useMemo(() => {
		return {
			...previewSwatchFillBase,
			backgroundColor: formatted,
		};
	}, [formatted]);

	const showEyeDropper = hasEyeDropper();

	return (
		<div style={popupShellStyle}>
			<SaturationValueArea
				hue={hsva.h}
				saturation={hsva.s}
				value={hsva.v}
				onChange={onSvChange}
				onChangeComplete={onSvComplete}
			/>
			<div style={sliderRowStyle}>
				{showEyeDropper ? (
					<button
						type="button"
						style={eyedropperButtonStyle}
						onClick={onPickWithEyeDropper}
						tabIndex={tabIndex}
						title="Pick color from screen"
						aria-label="Pick color from screen"
					>
						<EyedropperIcon
							style={{width: 14, height: 14}}
							color="currentColor"
						/>
					</button>
				) : null}
				<div style={previewSwatchStyle} title={formatted}>
					<div style={previewFill} />
				</div>
				<div style={slidersColumnStyle}>
					<HueSlider
						hue={hsva.h}
						onChange={onHueChange}
						onChangeComplete={onHueComplete}
					/>
					<AlphaSlider
						hue={hsva.h}
						saturation={hsva.s}
						value={hsva.v}
						alpha={hsva.a}
						onChange={onAlphaChange}
						onChangeComplete={onAlphaComplete}
					/>
				</div>
			</div>
			<div style={inputsRowStyle}>
				<HexInput
					value={formatted}
					onCommit={onHexCommit}
					tabIndex={tabIndex}
				/>
				<ChannelInput
					label="R"
					value={rgba.r}
					min={0}
					max={255}
					tabIndex={tabIndex}
					onCommit={(next) => onChannelCommit('r', next)}
				/>
				<ChannelInput
					label="G"
					value={rgba.g}
					min={0}
					max={255}
					tabIndex={tabIndex}
					onCommit={(next) => onChannelCommit('g', next)}
				/>
				<ChannelInput
					label="B"
					value={rgba.b}
					min={0}
					max={255}
					tabIndex={tabIndex}
					onCommit={(next) => onChannelCommit('b', next)}
				/>
				<ChannelInput
					label="A%"
					value={Math.round(hsva.a * 100)}
					min={0}
					max={100}
					tabIndex={tabIndex}
					onCommit={(next) => {
						const clamped = Math.max(0, Math.min(100, next));
						emit({...hsva, a: clamped / 100}, 'complete');
					}}
				/>
			</div>
		</div>
	);
};
