import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {CanUpdateSequencePropStatus} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	INPUT_BORDER_COLOR_HOVERED,
	INPUT_BORDER_COLOR_UNHOVERED,
} from '../../helpers/colors';
import type {
	SchemaFieldInfo,
	TimelineFieldOnDragValueChange,
	TimelineFieldOnSave,
} from '../../helpers/timeline-layout';
import {EyedropperIcon} from '../../icons/eyedropper';
import {useZIndex} from '../../state/z-index';

const SWATCH_WIDTH = 20;
const SWATCH_HEIGHT = 15;

const containerStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 3,
};

const swatchWrapperBase: React.CSSProperties = {
	position: 'relative',
	width: SWATCH_WIDTH,
	height: SWATCH_HEIGHT,
	display: 'inline-block',
	borderRadius: 3,
	overflow: 'hidden',
	cursor: 'pointer',
	borderStyle: 'solid',
	borderWidth: 1,
};

const hiddenInputStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	opacity: 0,
	cursor: 'pointer',
	border: 'none',
	padding: 0,
	margin: 0,
};

const swatchFillStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
};

const eyedropperButtonBase: React.CSSProperties = {
	background: 'transparent',
	border: 'none',
	padding: 0,
	margin: 0,
	cursor: 'pointer',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 20,
	height: 20,
	color: 'rgba(255, 255, 255, 0.7)',
};

const eyedropperIconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
};

// Normalizes any color string the user provided (e.g. `red`, `rgb(...)`, `#fff`)
// into a `#rrggbb` string that `<input type="color">` accepts.
const toHex = (value: string): string => {
	try {
		const argb = NoReactInternals.processColor(value);
		const r = (argb >>> 16) & 0xff;
		const g = (argb >>> 8) & 0xff;
		const b = argb & 0xff;
		return `#${r.toString(16).padStart(2, '0')}${g
			.toString(16)
			.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	} catch {
		return '#000000';
	}
};

const hasEyeDropper = (): boolean =>
	typeof window !== 'undefined' && 'EyeDropper' in window;

export const TimelineColorField: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly effectiveValue: unknown;
	readonly propStatus: CanUpdateSequencePropStatus;
	readonly onSave: TimelineFieldOnSave;
	readonly onDragValueChange: TimelineFieldOnDragValueChange;
	readonly onDragEnd: () => void;
}> = ({
	field,
	effectiveValue,
	propStatus,
	onSave,
	onDragValueChange,
	onDragEnd,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const {tabIndex} = useZIndex();

	const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pendingCommitRef = useRef<(() => void) | null>(null);

	// `<input type="color">` doesn't fire an event when dismissed; debounce
	// commits and flush any pending commit on unmount so we never lose the
	// final value.
	useEffect(() => {
		return () => {
			if (commitTimeoutRef.current) {
				clearTimeout(commitTimeoutRef.current);
			}

			if (pendingCommitRef.current) {
				pendingCommitRef.current();
			}
		};
	}, []);

	const currentValue =
		typeof effectiveValue === 'string'
			? effectiveValue
			: field.fieldSchema.type === 'color'
				? field.fieldSchema.default
				: '';

	const hexValue = useMemo(() => toHex(currentValue), [currentValue]);

	const onColorChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const newValue = e.target.value;
			if (!propStatus.canUpdate) {
				return;
			}

			onDragValueChange(newValue);

			if (commitTimeoutRef.current) {
				clearTimeout(commitTimeoutRef.current);
			}

			const commit = () => {
				pendingCommitRef.current = null;
				if (propStatus.canUpdate && newValue !== propStatus.codeValue) {
					onSave(newValue);
				}

				onDragEnd();
			};

			pendingCommitRef.current = commit;

			commitTimeoutRef.current = setTimeout(() => {
				commitTimeoutRef.current = null;
				commit();
			}, 500);
		},
		[onSave, onDragValueChange, onDragEnd, propStatus],
	);

	const onPickColor = useCallback(() => {
		// `EyeDropper` is a Chromium-only API; it's feature-detected at render
		// time so this only runs in supported browsers.
		const EyeDropperCtor =
			typeof window !== 'undefined'
				? (
						window as unknown as {
							EyeDropper?: new () => {open: () => Promise<{sRGBHex: string}>};
						}
					).EyeDropper
				: undefined;
		if (!EyeDropperCtor) {
			return;
		}

		const eyeDropper = new EyeDropperCtor();
		eyeDropper
			.open()
			.then((result) => {
				if (propStatus.canUpdate && result.sRGBHex !== propStatus.codeValue) {
					onSave(result.sRGBHex);
				}
			})
			.catch(() => {
				// User aborted or picker failed; safe to ignore.
			});
	}, [onSave, propStatus]);

	const swatchWrapperStyle = useMemo<React.CSSProperties>(() => {
		return {
			...swatchWrapperBase,
			borderColor:
				isHovered || isFocused
					? INPUT_BORDER_COLOR_HOVERED
					: INPUT_BORDER_COLOR_UNHOVERED,
			cursor: propStatus.canUpdate ? 'pointer' : 'not-allowed',
			marginLeft: 5,
		};
	}, [isFocused, isHovered, propStatus.canUpdate]);

	const swatchFill = useMemo<React.CSSProperties>(() => {
		return {
			...swatchFillStyle,
			backgroundColor: currentValue || hexValue,
			position: 'absolute',
			display: 'block',
		};
	}, [currentValue, hexValue]);

	const onMouseEnter = useCallback(() => setIsHovered(true), []);
	const onMouseLeave = useCallback(() => setIsHovered(false), []);
	const onFocus = useCallback(() => setIsFocused(true), []);
	const onBlur = useCallback(() => setIsFocused(false), []);

	const onSwatchClick = useCallback(() => {
		if (!propStatus.canUpdate) {
			return;
		}

		inputRef.current?.click();
	}, [propStatus.canUpdate]);

	const showEyeDropper = hasEyeDropper();

	return (
		<span style={containerStyle}>
			<span
				style={swatchWrapperStyle}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onClick={onSwatchClick}
				title={currentValue}
			>
				<span style={swatchFill} />
				<input
					ref={inputRef}
					type="color"
					value={hexValue}
					onChange={onColorChange}
					onFocus={onFocus}
					onBlur={onBlur}
					disabled={!propStatus.canUpdate}
					name={field.key}
					tabIndex={tabIndex}
					style={hiddenInputStyle}
				/>
			</span>
			{showEyeDropper ? (
				<button
					type="button"
					onClick={onPickColor}
					disabled={!propStatus.canUpdate}
					style={eyedropperButtonBase}
					tabIndex={tabIndex}
					title="Pick color from screen"
					aria-label="Pick color from screen"
				>
					<EyedropperIcon style={eyedropperIconStyle} />
				</button>
			) : null}
		</span>
	);
};
