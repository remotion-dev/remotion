import {PlayerInternals} from '@remotion/player';
import React, {useContext, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';
import {Internals} from 'remotion';
import {
	BACKGROUND_HEX,
	BORDER_BLACK_ALPHA_60,
	COLOR_PICKER_POPUP_SHADOW,
	CURRENT_COLOR,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {useIsStill} from '../helpers/is-current-selected-still';
import {PlaybackRateIcon} from '../icons/playback-rate';
import {
	commonPlaybackRates,
	loadPlaybackRateStep,
	persistPlaybackRate,
	persistPlaybackRateStep,
} from '../state/playbackrate';
import {HigherZIndex, useZIndex} from '../state/z-index';
import {InlineAction} from './InlineAction';
import {getPortal} from './Menu/portals';
import {
	fullScreenOverlay,
	menuContainerTowardsBottom,
	menuContainerTowardsTop,
	outerPortal,
} from './Menu/styles';

const POPUP_WIDTH = 360;
const MIN_RATE = 0.1;
const MAX_RATE = 4;

const popupStyle: React.CSSProperties = {
	width: `min(${POPUP_WIDTH}px, calc(100vw - 12px))`,
	padding: 12,
	background: BACKGROUND_HEX,
	border: BORDER_BLACK_ALPHA_60,
	borderRadius: 4,
	boxShadow: COLOR_PICKER_POPUP_SHADOW,
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	color: WHITE,
	fontSize: 12,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const currentRateStyle: React.CSSProperties = {
	fontSize: 22,
	fontWeight: 600,
	lineHeight: '28px',
	textAlign: 'center',
	fontVariantNumeric: 'tabular-nums',
};

const optionsRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
};

const stepLabelStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 5,
	color: LIGHT_TEXT,
	whiteSpace: 'nowrap',
};

const stepInputStyle: React.CSSProperties = {
	width: 48,
	boxSizing: 'border-box',
	padding: '3px 4px',
	border: BORDER_BLACK_ALPHA_60,
	borderRadius: 3,
	background: INPUT_BACKGROUND,
	color: WHITE,
	font: 'inherit',
};

const sliderRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 6,
};

const rateButtonStyle: React.CSSProperties = {
	minWidth: 38,
	padding: '5px 7px',
	border: BORDER_BLACK_ALPHA_60,
	borderRadius: 3,
	fontSize: 12,
	fontFamily: 'inherit',
	cursor: 'default',
};

const getPopupRateLabel = (rate: number) => `${Number(rate.toFixed(3))}x`;

const roundRate = (rate: number) => Number(rate.toFixed(5));

const PlaybackRatePopupContent: React.FC<{
	readonly children: (tabIndex: number) => React.ReactNode;
}> = ({children}) => {
	const {tabIndex} = useZIndex();
	return children(tabIndex);
};

export const PlaybackRateSelector: React.FC = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const isStill = useIsStill();
	const {playbackRate, setPlaybackRate} = Internals.usePlaybackRate();
	const [opened, setOpened] = useState(false);
	const [step, setStep] = useState(loadPlaybackRateStep);
	const [stepDraft, setStepDraft] = useState(String(step));
	const triggerRef = React.useRef<HTMLDivElement>(null);
	const {currentZIndex} = useZIndex();
	const size = PlayerInternals.useElementSize(triggerRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});

	const direction = playbackRate < 0 ? -1 : 1;
	const magnitude = Math.abs(playbackRate);
	const rates = useMemo(
		() => commonPlaybackRates.filter((rate) => Math.sign(rate) === direction),
		[direction],
	);

	const setRate = (rate: number) => {
		setPlaybackRate(rate);
		persistPlaybackRate(rate);
	};

	const adjustRate = (change: number) => {
		const nextRate = Math.max(MIN_RATE, Math.min(MAX_RATE, magnitude + change));
		setRate(roundRate(direction * nextRate));
	};

	const updateStep = (value: string) => {
		setStepDraft(value);
		const parsed = Number(value);
		if (Number.isFinite(parsed) && parsed >= 0.01 && parsed <= MAX_RATE) {
			setStep(parsed);
			persistPlaybackRateStep(parsed);
		}
	};

	const finishStepEdit = () => {
		const parsed = Number(stepDraft);
		if (!Number.isFinite(parsed) || parsed < 0.01 || parsed > MAX_RATE) {
			setStepDraft(String(step));
			return;
		}

		const normalized = roundRate(parsed);
		setStep(normalized);
		setStepDraft(String(normalized));
		persistPlaybackRateStep(normalized);
	};

	const popupPosition = useMemo((): React.CSSProperties | null => {
		if (!opened || !size) {
			return null;
		}

		const margin = 6;
		const popupHeight = 244;
		const openBelow =
			size.windowSize.height - (size.top + size.height) >=
				popupHeight + margin ||
			size.windowSize.height - (size.top + size.height) >= size.top;
		const popupWidth = Math.min(
			POPUP_WIDTH,
			size.windowSize.width - margin * 2,
		);
		const left = Math.max(
			margin,
			Math.min(size.left, size.windowSize.width - popupWidth - margin),
		);

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

	if (isStill || canvasContent === null) {
		return null;
	}

	return (
		<>
			<div ref={triggerRef} style={{display: 'flex'}}>
				<InlineAction
					aria-label="Playback rate"
					aria-expanded={opened}
					onClick={(event) => {
						event.stopPropagation();
						setOpened((previous) => !previous);
					}}
					variant={null}
					renderAction={(color) => (
						<>
							<PlaybackRateIcon color={color} playbackRate={playbackRate} />
							<span style={{fontSize: 12, fontVariantNumeric: 'tabular-nums'}}>
								{getPopupRateLabel(playbackRate)}
							</span>
						</>
					)}
					style={{width: 'auto', gap: 4, padding: '0 4px'}}
				/>
			</div>
			{popupPosition
				? ReactDOM.createPortal(
						<div style={fullScreenOverlay}>
							<div style={outerPortal} className="css-reset">
								<HigherZIndex
									onOutsideClick={() => setOpened(false)}
									onEscape={() => setOpened(false)}
								>
									<div
										style={popupPosition}
										onPointerDown={(event) => event.stopPropagation()}
									>
										<PlaybackRatePopupContent>
											{(tabIndex) => (
												<div style={popupStyle}>
													<div style={currentRateStyle} aria-live="polite">
														{getPopupRateLabel(playbackRate)}
													</div>
													<div style={optionsRowStyle}>
														<button
															type="button"
															aria-pressed={direction === -1}
															tabIndex={tabIndex}
															onClick={() =>
																setRate(
																	direction === -1 ? magnitude : -magnitude,
																)
															}
															className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
															style={{
																...rateButtonStyle,
																...hoverableStyle({
																	idleBackground:
																		direction === -1
																			? INPUT_BACKGROUND
																			: TRANSPARENT,
																	hoverBackground: getBackgroundFromHoverState({
																		hovered: true,
																		selected: direction === -1,
																	}),
																	idleColor:
																		direction === -1 ? WHITE : LIGHT_TEXT,
																	hoverColor: WHITE,
																}),
															}}
														>
															Reverse
														</button>
														<label style={stepLabelStyle}>
															Step
															<input
																aria-label="Playback rate step"
																type="number"
																min={0.01}
																max={MAX_RATE}
																step="any"
																value={stepDraft}
																onChange={(event) =>
																	updateStep(event.currentTarget.value)
																}
																onBlur={finishStepEdit}
																style={stepInputStyle}
																tabIndex={tabIndex}
															/>
														</label>
													</div>
													<div style={sliderRowStyle}>
														<button
															type="button"
															aria-label="Decrease playback rate"
															tabIndex={tabIndex}
															onClick={() => adjustRate(-step)}
															className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
															style={{
																...rateButtonStyle,
																color: LIGHT_TEXT,
																background: TRANSPARENT,
															}}
														>
															−
														</button>
														<input
															aria-label="Playback rate"
															type="range"
															min={MIN_RATE}
															max={MAX_RATE}
															step="any"
															value={magnitude}
															onChange={(event) =>
																setRate(
																	direction * Number(event.currentTarget.value),
																)
															}
															style={{
																flex: 1,
																minWidth: 0,
																accentColor: CURRENT_COLOR,
															}}
															tabIndex={tabIndex}
														/>
														<button
															type="button"
															aria-label="Increase playback rate"
															tabIndex={tabIndex}
															onClick={() => adjustRate(step)}
															className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
															style={{
																...rateButtonStyle,
																color: LIGHT_TEXT,
																background: TRANSPARENT,
															}}
														>
															+
														</button>
													</div>
													<div style={{display: 'flex', gap: 6}}>
														{rates.map((rate) => {
															const selected = Math.abs(rate) === magnitude;
															return (
																<button
																	key={rate}
																	type="button"
																	aria-pressed={selected}
																	tabIndex={tabIndex}
																	onClick={() => setRate(rate)}
																	className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
																	style={{
																		...rateButtonStyle,
																		...hoverableStyle({
																			idleBackground: selected
																				? INPUT_BACKGROUND
																				: TRANSPARENT,
																			hoverBackground:
																				getBackgroundFromHoverState({
																					hovered: true,
																					selected,
																				}),
																			idleColor: selected ? WHITE : LIGHT_TEXT,
																			hoverColor: WHITE,
																		}),
																	}}
																>
																	{getPopupRateLabel(Math.abs(rate))}
																</button>
															);
														})}
													</div>
												</div>
											)}
										</PlaybackRatePopupContent>
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
