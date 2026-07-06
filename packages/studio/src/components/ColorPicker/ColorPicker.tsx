import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {formatRgba} from '../../helpers/color-conversion';
import {CURRENT_COLOR, LIGHT_TEXT, TRANSPARENT} from '../../helpers/colors';
import {EyedropperIcon} from '../../icons/eyedropper';
import {HigherZIndex, useZIndex} from '../../state/z-index';
import {MENU_INITIATOR_CLASSNAME} from '../Menu/is-menu-item';
import {getPortal} from '../Menu/portals';
import {
	fullScreenOverlay,
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from '../Menu/styles';
import type {RemInputStatus} from '../NewComposition/RemInput';
import {
	CHECKER_BACKGROUND_COLOR,
	CHECKER_BACKGROUND_IMAGE,
	CHECKER_BACKGROUND_POSITION,
	CHECKER_BACKGROUND_SIZE,
} from './checker';
import {
	ColorPickerPopup,
	POPUP_WIDTH,
	hasEyeDropper,
	parseEyeDropperColor,
} from './ColorPickerPopup';

// Class name used to opt the swatch button out of the global
// `button:focus` inset box-shadow defined in inject-css.ts.
const SWATCH_CLASSNAME = '__remotion_color_swatch';

const swatchBaseStyle: React.CSSProperties = {
	position: 'relative',
	display: 'inline-block',
	overflow: 'hidden',
	padding: 0,
	margin: 0,
	border: 'none',
	cursor: 'pointer',
	backgroundColor: CHECKER_BACKGROUND_COLOR,
	backgroundImage: CHECKER_BACKGROUND_IMAGE,
	backgroundSize: CHECKER_BACKGROUND_SIZE,
	backgroundPosition: CHECKER_BACKGROUND_POSITION,
	boxSizing: 'border-box',
};

const fillStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	display: 'block',
};

const controlStyle: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 3,
	flex: '0 0 auto',
};

const eyedropperButtonBaseStyle: React.CSSProperties = {
	background: TRANSPARENT,
	border: 'none',
	padding: 0,
	margin: 0,
	color: LIGHT_TEXT,
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	flex: '0 0 auto',
};

type Props = {
	readonly value: string;
	readonly onChange: (next: string) => void;
	readonly onChangeComplete: (next: string) => void;
	readonly status: RemInputStatus;
	readonly disabled?: boolean;
	readonly width?: number;
	readonly height?: number;
	readonly borderRadius?: number;
	readonly title?: string;
	readonly name?: string;
	readonly className?: string;
	readonly style?: React.CSSProperties;
};

export const ColorPicker: React.FC<Props> = ({
	value,
	onChange,
	onChangeComplete,
	disabled,
	width = 45,
	height = 25,
	borderRadius = 3,
	title,
	name,
	className,
	style: customStyle,
}) => {
	const [opened, setOpened] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const {tabIndex, currentZIndex} = useZIndex();

	const size = PlayerInternals.useElementSize(triggerRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const refresh = size?.refresh;

	const onHide = useCallback(() => {
		setOpened(false);
	}, []);

	const swatchFill = useMemo<React.CSSProperties>(() => {
		return {
			...fillStyle,
			backgroundColor: value,
		};
	}, [value]);

	const swatchStyle: React.CSSProperties = useMemo(() => {
		return {
			...swatchBaseStyle,
			width,
			height,
			borderRadius,
			cursor: disabled ? 'not-allowed' : 'pointer',
			opacity: disabled ? 0.5 : 1,
			...(customStyle ?? {}),
		};
	}, [borderRadius, customStyle, disabled, height, width]);

	const eyedropperButtonSize = Math.max(15, Math.min(28, height));
	const eyedropperIconSize = Math.max(
		12,
		Math.min(18, eyedropperButtonSize - 2),
	);

	const eyedropperButtonStyle: React.CSSProperties = useMemo(() => {
		return {
			...eyedropperButtonBaseStyle,
			width: eyedropperButtonSize,
			height: eyedropperButtonSize,
			cursor: disabled ? 'not-allowed' : 'pointer',
			opacity: disabled ? 0.5 : 1,
		};
	}, [disabled, eyedropperButtonSize]);

	const eyedropperIconStyle: React.CSSProperties = useMemo(() => {
		return {
			width: eyedropperIconSize,
			height: eyedropperIconSize,
			pointerEvents: 'none',
		};
	}, [eyedropperIconSize]);

	// Toggle on pointerdown (matches Combobox) so the state flips before the
	// HigherZIndex outside-click detection runs on pointerup. If we toggled in
	// onClick, the popup would close in pointerup and immediately re-open in
	// the click that follows.
	const onTriggerPointerDown = useCallback(() => {
		if (disabled) {
			return;
		}

		setOpened((prev) => {
			if (!prev) {
				refresh?.();
			}

			return !prev;
		});
	}, [disabled, refresh]);

	const onTriggerClick = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			if (disabled) {
				return;
			}

			// Keyboard-initiated activations (Enter/Space) don't fire pointerdown,
			// so handle them here. Mouse clicks are already handled by pointerdown
			// above; ignore them.
			const isKeyboardInitiated = e.detail === 0;
			if (!isKeyboardInitiated) {
				return;
			}

			setOpened((prev) => {
				if (!prev) {
					refresh?.();
				}

				return !prev;
			});
		},
		[disabled, refresh],
	);

	const onPickWithEyeDropper = useCallback(() => {
		if (disabled) {
			return;
		}

		const Ctor = (
			window as unknown as {
				EyeDropper?: new () => {open: () => Promise<{sRGBHex: string}>};
			}
		).EyeDropper;
		if (!Ctor) {
			return;
		}

		setOpened(false);
		const dropper = new Ctor();
		dropper
			.open()
			.then((result) => {
				onChangeComplete(formatRgba(parseEyeDropperColor(result.sRGBHex)));
			})
			.catch(() => {
				// Aborted; ignore.
			});
	}, [disabled, onChangeComplete]);

	const onEyeDropperPointerDown = useCallback(
		(e: React.PointerEvent<HTMLButtonElement>) => {
			e.stopPropagation();
		},
		[],
	);

	const portalStyle = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const margin = 6;
		const popupHeight = 250;
		const popupWidth = POPUP_WIDTH;

		const spaceBelow = size.windowSize.height - (size.top + size.height);
		const spaceAbove = size.top;
		const openBelow =
			spaceBelow >= popupHeight + margin || spaceBelow >= spaceAbove;

		const spaceRight = size.windowSize.width - size.left;
		// Try aligning the popup to the trigger's left edge first; fall back
		// to right-aligning if it would clip the viewport.
		const left =
			spaceRight >= popupWidth + margin
				? size.left
				: Math.max(margin, size.windowSize.width - popupWidth - margin);

		if (openBelow) {
			return {
				...menuContainerTowardsBottom,
				top: size.top + size.height + margin,
				left,
				background: TRANSPARENT,
				boxShadow: 'none',
			};
		}

		return {
			...menuContainerTowardsTop,
			bottom: size.windowSize.height - size.top + margin,
			left,
			background: TRANSPARENT,
			boxShadow: 'none',
		};
	}, [opened, size]);

	useEffect(() => {
		if (!opened) {
			return;
		}

		const onWindowBlur = () => setOpened(false);
		window.addEventListener('blur', onWindowBlur);
		return () => window.removeEventListener('blur', onWindowBlur);
	}, [opened]);

	const showEyeDropper = hasEyeDropper();

	return (
		<>
			<span style={controlStyle}>
				<button
					ref={triggerRef}
					type="button"
					className={[MENU_INITIATOR_CLASSNAME, SWATCH_CLASSNAME, className]
						.filter(Boolean)
						.join(' ')}
					disabled={disabled}
					name={name}
					title={title ?? value}
					tabIndex={tabIndex}
					style={swatchStyle}
					onPointerDown={onTriggerPointerDown}
					onClick={onTriggerClick}
				>
					<span style={swatchFill} />
				</button>
				{showEyeDropper ? (
					<button
						type="button"
						disabled={disabled}
						style={eyedropperButtonStyle}
						onPointerDown={onEyeDropperPointerDown}
						onClick={onPickWithEyeDropper}
						tabIndex={tabIndex}
						title="Pick color from screen"
						aria-label="Pick color from screen"
					>
						<EyedropperIcon style={eyedropperIconStyle} color={CURRENT_COLOR} />
					</button>
				) : null}
			</span>
			{portalStyle
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex onOutsideClick={onHide} onEscape={onHide}>
									<div style={portalStyle}>
										<ColorPickerPopup
											value={value}
											onChange={onChange}
											onChangeComplete={onChangeComplete}
										/>
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
