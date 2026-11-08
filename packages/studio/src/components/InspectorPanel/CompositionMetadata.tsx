import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {COMPUTED_VALUE_COLOR} from '../../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	NO_HOVER_BACKGROUND_STYLE,
} from '../../helpers/hoverable';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {Checkmark} from '../../icons/Checkmark';
import {renderFrame} from '../../state/render-frame';
import {ContextMenu} from '../ContextMenu';
import {InlineDropdown} from '../InlineDropdown';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {
	InputDraggerWithTextEditing,
	inputDraggerContainerStyle,
} from '../NewComposition/InputDragger';
import {showNotification} from '../Notifications/NotificationCenter';
import {updateCompositionMetadata} from '../RenderQueue/actions';
import {getCurrentFrame} from '../Timeline/imperative-state';
import {timelineDurationRef} from '../Timeline/timeline-refs';
import {TimelineTickFormatContext} from '../Timeline/TimelineTickFormatProvider';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {
	acceptPendingCompositionMetadataValue,
	type CompositionMetadataField,
	failPendingCompositionMetadataValue,
	type PendingCompositionMetadata,
	type PendingCompositionMetadataValue,
	reconcilePendingCompositionMetadata,
} from './optimistic-composition-metadata';
import {parseCompositionDuration} from './parse-composition-duration';
import {detailLabel, detailRow, detailsContainer} from './styles';

const compositionMetadataContainer: React.CSSProperties = {
	...detailsContainer,
	columnGap: 12,
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	paddingBottom: 4,
	paddingTop: 0,
};

const fieldLabels: Record<CompositionMetadataField, string> = {
	durationInFrames: 'Duration',
	fps: 'Frame Rate',
	height: 'Height',
	width: 'Width',
};

const computedContainerStyle: React.CSSProperties = {
	...inputDraggerContainerStyle,
	textAlign: 'right',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const computedValueStyle: React.CSSProperties = {
	color: COMPUTED_VALUE_COLOR,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontStyle: 'italic',
	lineHeight: '20px',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const metadataFormatterStyle: React.CSSProperties = {
	display: 'block',
	fontSize: 13,
	overflow: 'hidden',
	textOverflow: 'clip',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

const metadataDraggerStyle: React.CSSProperties = {
	fontSize: 13,
	minWidth: 0,
	padding: '2px 0',
	textAlign: 'right',
	width: '100%',
};

const metadataField: React.CSSProperties = {
	...detailRow,
	gap: 4,
	minWidth: 0,
};

const metadataValue: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const durationContextMenu: React.CSSProperties = {
	display: 'block',
	width: '100%',
};

const presetLabelStyle: React.CSSProperties = {
	...NO_HOVER_BACKGROUND_STYLE,
	cursor: 'default',
	justifyContent: 'flex-start',
	minWidth: 0,
	width: 'auto',
};

const metadataLabelControls: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 2,
	lineHeight: '20px',
	minWidth: 0,
};

const metadataLabelText: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'clip',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

type CompositionMetadataValues = Partial<
	Record<CompositionMetadataField, number>
>;

const dimensionPresets = [
	{height: 1080, label: 'Full HD', width: 1920},
	{height: 1920, label: 'Full HD', width: 1080},
	{height: 720, label: 'HD', width: 1280},
	{height: 1280, label: 'HD', width: 720},
	{height: 1080, label: 'Square', width: 1080},
] as const;

const frameRatePresets = [23.976, 24, 25, 29.97, 30, 50, 60] as const;

const frameRateFromDragSteps = (startValue: number, steps: number) => {
	if (steps === 0) {
		return startValue;
	}

	const candidates = frameRatePresets.filter((preset) =>
		steps > 0 ? preset > startValue : preset < startValue,
	);
	if (steps < 0) {
		candidates.reverse();
	}

	return (
		candidates[Math.min(Math.abs(steps), candidates.length) - 1] ?? startValue
	);
};

const PresetDropdown: React.FC<{
	readonly disabled: boolean;
	readonly 'aria-label': string;
	readonly label: string;
	readonly values: ComboboxValue[] | (() => ComboboxValue[]);
}> = ({disabled, 'aria-label': ariaLabel, label, values}) => {
	const renderAction = useCallback(() => {
		return <span style={metadataLabelText}>{label}</span>;
	}, [label]);

	return (
		<InlineDropdown
			disabled={disabled}
			renderAction={renderAction}
			aria-label={ariaLabel}
			values={typeof values === 'function' ? undefined : values}
			getItems={typeof values === 'function' ? values : undefined}
			variant="compact"
			className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
			style={presetLabelStyle}
		/>
	);
};

const CompositionMetadataValue: React.FC<{
	readonly computed: boolean;
	readonly disabled: boolean;
	readonly field: CompositionMetadataField;
	readonly onSave: (values: CompositionMetadataValues) => void;
	readonly pendingValue: PendingCompositionMetadataValue | null;
	readonly value: number;
}> = ({computed, disabled, field, onSave, pendingValue, value}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);
	const {showFrames, setShowFrames} = useContext(TimelineTickFormatContext);
	const fps = Internals.useVideo()?.fps ?? null;

	const save = useCallback(
		(newValue: number) => {
			if (newValue === (pendingValue?.value ?? value)) {
				setDragValue(null);
				return;
			}

			setDragValue(null);
			onSave({[field]: newValue});
		},
		[field, onSave, pendingValue?.value, value],
	);
	const isFps = field === 'fps';
	const formatValue = useCallback(
		(newValue: number | string) => {
			const numberValue = Number(newValue);
			if (field === 'fps') {
				return `${Number(numberValue.toFixed(3))}fps`;
			}

			const roundedValue = Math.round(numberValue);
			if (field === 'durationInFrames') {
				if (!showFrames && fps !== null) {
					return renderFrame(roundedValue, fps);
				}

				return `${roundedValue} ${roundedValue === 1 ? 'frame' : 'frames'}`;
			}

			return `${roundedValue}px`;
		},
		[field, fps, showFrames],
	);
	const getTimeFormatItems = useCallback(
		(): ComboboxValue[] => [
			{
				type: 'item',
				id: 'timecode',
				label: 'Timecode',
				value: 'timecode',
				onClick: () => setShowFrames(false),
				keyHint: null,
				leftItem: showFrames ? null : <Checkmark />,
				subMenu: null,
				quickSwitcherLabel: null,
			},
			{
				type: 'item',
				id: 'frames',
				label: 'Frames',
				value: 'frames',
				onClick: () => setShowFrames(true),
				keyHint: null,
				leftItem: showFrames ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
		],
		[setShowFrames, showFrames],
	);
	const textEditing = useMemo(() => {
		if (field !== 'durationInFrames') {
			return null;
		}

		return {
			format: (newValue: number | string) =>
				showFrames || fps === null
					? String(Math.round(Number(newValue)))
					: formatValue(newValue),
			parse: (text: string) => parseCompositionDuration(text, fps, showFrames),
			invalidMessage: 'Enter a duration such as 5s, 1:30, or 150f.',
			onCancel: () => setDragValue(null),
		};
	}, [field, formatValue, fps, showFrames]);

	const content =
		computed || disabled ? (
			<span style={{...computedContainerStyle, ...metadataDraggerStyle}}>
				<span style={{...metadataFormatterStyle, ...computedValueStyle}}>
					{formatValue(value)}
				</span>
			</span>
		) : (
			<InputDraggerWithTextEditing
				onValueChangeCancel={() => setDragValue(null)}
				aria-label={fieldLabels[field]}
				buttonStyle={metadataDraggerStyle}
				type="number"
				textEditing={textEditing}
				valueFromSteps={isFps ? frameRateFromDragSteps : null}
				value={dragValue ?? pendingValue?.value ?? value}
				disabled={pendingValue !== null}
				status="ok"
				onValueChange={setDragValue}
				onValueChangeEnd={save}
				onTextChange={() => undefined}
				min={isFps ? 0.01 : 1}
				step={isFps ? 0.01 : 1}
				allowStepMismatch={isFps}
				dragSensitivity={isFps ? 0.1 : 1}
				dragDecimalPlaces={isFps ? 2 : 0}
				formatter={formatValue}
				formatterStyle={metadataFormatterStyle}
				rightAlign
				style={metadataDraggerStyle}
			/>
		);

	return field === 'durationInFrames' ? (
		<ContextMenu getItems={getTimeFormatItems} style={durationContextMenu}>
			{content}
		</ContextMenu>
	) : (
		content
	);
};

export const CompositionMetadata: React.FC<{
	readonly compositionId: string;
	readonly disabled: boolean;
	readonly stack: string | null;
}> = ({compositionId, disabled, stack}) => {
	const video = Internals.useVideo();
	const {showFrames} = useContext(TimelineTickFormatContext);
	const resolvedVideoConfig = Internals.useResolvedVideoConfig(compositionId);
	const resolvedConfig =
		resolvedVideoConfig?.type === 'success' ||
		resolvedVideoConfig?.type === 'success-and-refreshing'
			? resolvedVideoConfig.result
			: null;
	const resolvedConfigRef = useRef(resolvedConfig);
	resolvedConfigRef.current = resolvedConfig;
	const [pendingValues, setPendingValues] =
		useState<PendingCompositionMetadata>({});
	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);
	useEffect(() => {
		if (resolvedConfig === null) {
			return;
		}

		setPendingValues((pending) =>
			reconcilePendingCompositionMetadata({
				currentConfig: resolvedConfig,
				pending,
			}),
		);
	}, [resolvedConfig]);

	const onPendingValueAccepted = useCallback(
		(
			field: CompositionMetadataField,
			value: PendingCompositionMetadataValue,
		) => {
			setPendingValues((pending) => {
				if (resolvedConfigRef.current === null) {
					return pending;
				}

				return acceptPendingCompositionMetadataValue({
					currentConfig: resolvedConfigRef.current,
					field,
					pending,
					value,
				});
			});
		},
		[],
	);
	const onPendingValueFailed = useCallback(
		(
			field: CompositionMetadataField,
			value: PendingCompositionMetadataValue,
		) => {
			setPendingValues((pending) =>
				failPendingCompositionMetadataValue({field, pending, value}),
			);
		},
		[],
	);
	const currentValues = useMemo(
		(): Record<CompositionMetadataField, number> => ({
			durationInFrames: video?.durationInFrames ?? 0,
			fps: video?.fps ?? 0,
			height: video?.height ?? 0,
			width: video?.width ?? 0,
		}),
		[video],
	);
	const saveMetadata = useCallback(
		(newValues: CompositionMetadataValues) => {
			if (disabled || resolvedConfig === null) {
				return;
			}

			const changedFields = (
				Object.keys(newValues) as CompositionMetadataField[]
			).filter(
				(field) =>
					newValues[field] !==
					(pendingValues[field]?.value ?? currentValues[field]),
			);

			if (changedFields.length === 0) {
				return;
			}

			if (symbolicatedStack === null) {
				showNotification(
					'Could not determine where this composition is defined',
					2000,
				);
				return;
			}

			const optimisticValues = changedFields.reduce((values, field) => {
				values[field] = {
					baseline: resolvedConfig,
					status: 'saving',
					value: newValues[field] as number,
				};
				return values;
			}, {} as PendingCompositionMetadata);
			setPendingValues((pending) => ({...pending, ...optimisticValues}));
			updateCompositionMetadata(
				{
					idToUpdate: compositionId,
					newDurationInFrames: newValues.durationInFrames ?? null,
					newFps: newValues.fps ?? null,
					newHeight: newValues.height ?? null,
					newWidth: newValues.width ?? null,
					symbolicatedStack,
					undoRedoNavigation: null,
				},
				new AbortController().signal,
			)
				.then((result) => {
					if (!result.success) {
						for (const field of changedFields) {
							onPendingValueFailed(
								field,
								optimisticValues[field] as PendingCompositionMetadataValue,
							);
						}

						showNotification(
							`Could not update composition metadata: ${result.reason}`,
							2000,
						);
						return;
					}

					for (const field of changedFields) {
						onPendingValueAccepted(
							field,
							optimisticValues[field] as PendingCompositionMetadataValue,
						);
					}
				})
				.catch((error) => {
					for (const field of changedFields) {
						onPendingValueFailed(
							field,
							optimisticValues[field] as PendingCompositionMetadataValue,
						);
					}

					showNotification(
						`Could not update composition metadata: ${(error as Error).message}`,
						2000,
					);
				});
		},
		[
			compositionId,
			currentValues,
			disabled,
			onPendingValueAccepted,
			onPendingValueFailed,
			pendingValues,
			resolvedConfig,
			symbolicatedStack,
		],
	);

	if (video === null || resolvedConfig === null) {
		return null;
	}

	const metadataSource =
		resolvedVideoConfig?.type === 'success' ||
		resolvedVideoConfig?.type === 'success-and-refreshing'
			? resolvedVideoConfig.metadataSource
			: undefined;
	const widthIsComputed = metadataSource?.width === 'calculate-metadata';
	const heightIsComputed = metadataSource?.height === 'calculate-metadata';
	const fpsIsComputed = metadataSource?.fps === 'calculate-metadata';
	const durationIsComputed =
		metadataSource?.durationInFrames === 'calculate-metadata';
	const isStill = isCompositionStill(video);
	const dimensionPresetValues = dimensionPresets.flatMap(
		(preset, index): ComboboxValue[] => [
			...(index === 2 || index === 4
				? [{type: 'divider' as const, id: `dimension-divider-${index}`}]
				: []),
			{
				type: 'item',
				id: `${preset.width}x${preset.height}`,
				label: `${preset.width}x${preset.height} (${preset.label})`,
				value: `${preset.width}x${preset.height}`,
				onClick: () => {
					saveMetadata({height: preset.height, width: preset.width});
				},
				keyHint: null,
				leftItem: null,
				subMenu: null,
				quickSwitcherLabel: null,
			},
		],
	);
	const frameRatePresetValues = frameRatePresets.map(
		(fps): ComboboxValue => ({
			type: 'item',
			id: String(fps),
			label: `${fps} fps`,
			value: fps,
			onClick: () => {
				saveMetadata({fps});
			},
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: null,
		}),
	);

	return (
		<div style={compositionMetadataContainer}>
			<div style={metadataField}>
				<div style={detailLabel}>
					<div style={metadataLabelControls}>
						{disabled || widthIsComputed || heightIsComputed ? (
							<span style={metadataLabelText}>Width</span>
						) : (
							<PresetDropdown
								label="Width"
								disabled={
									pendingValues.width !== undefined ||
									pendingValues.height !== undefined
								}
								aria-label="Choose width preset"
								values={dimensionPresetValues}
							/>
						)}
					</div>
				</div>
				<div style={metadataValue}>
					<CompositionMetadataValue
						computed={widthIsComputed}
						disabled={disabled}
						field="width"
						onSave={saveMetadata}
						pendingValue={pendingValues.width ?? null}
						value={video.width}
					/>
				</div>
			</div>
			<div style={metadataField}>
				<div style={detailLabel}>
					<div style={metadataLabelControls}>
						{disabled || widthIsComputed || heightIsComputed ? (
							<span style={metadataLabelText}>Height</span>
						) : (
							<PresetDropdown
								label="Height"
								disabled={
									pendingValues.width !== undefined ||
									pendingValues.height !== undefined
								}
								aria-label="Choose height preset"
								values={dimensionPresetValues}
							/>
						)}
					</div>
				</div>
				<div style={metadataValue}>
					<CompositionMetadataValue
						computed={heightIsComputed}
						disabled={disabled}
						field="height"
						onSave={saveMetadata}
						pendingValue={pendingValues.height ?? null}
						value={video.height}
					/>
				</div>
			</div>
			{isStill ? null : (
				<>
					<div style={metadataField}>
						<div style={detailLabel}>
							<div style={metadataLabelControls}>
								{disabled || durationIsComputed ? (
									<span style={metadataLabelText}>Duration</span>
								) : (
									<PresetDropdown
										label="Duration"
										disabled={pendingValues.durationInFrames !== undefined}
										aria-label="Choose duration preset"
										values={() => {
											const timelineEnd =
												timelineDurationRef.current?.getDuration(
													video.durationInFrames,
												) ?? null;
											const currentFrame = getCurrentFrame();

											return [
												{
													type: 'item',
													id: 'match-timeline',
													label:
														timelineEnd === null
															? 'Match timeline'
															: `Match timeline (${showFrames ? `${timelineEnd} ${timelineEnd === 1 ? 'frame' : 'frames'}` : renderFrame(timelineEnd, video.fps)})`,
													value: 'match-timeline',
													disabled: timelineEnd === null,
													onClick: () => {
														if (timelineEnd !== null) {
															saveMetadata({durationInFrames: timelineEnd});
														}
													},
													keyHint: null,
													leftItem: null,
													subMenu: null,
													quickSwitcherLabel: null,
												},
												{
													type: 'item',
													id: 'match-current-time',
													label: `Match current time (${showFrames ? `${currentFrame} ${currentFrame === 1 ? 'frame' : 'frames'}` : renderFrame(currentFrame, video.fps)})`,
													value: 'match-current-time',
													disabled: currentFrame < 1,
													onClick: () => {
														saveMetadata({durationInFrames: currentFrame});
													},
													keyHint: null,
													leftItem: null,
													subMenu: null,
													quickSwitcherLabel: null,
												},
											];
										}}
									/>
								)}
							</div>
						</div>
						<div style={metadataValue}>
							<CompositionMetadataValue
								computed={durationIsComputed}
								disabled={disabled}
								field="durationInFrames"
								onSave={saveMetadata}
								pendingValue={pendingValues.durationInFrames ?? null}
								value={video.durationInFrames}
							/>
						</div>
					</div>
					<div style={metadataField}>
						<div style={detailLabel}>
							<div style={metadataLabelControls}>
								{disabled || fpsIsComputed ? (
									<span style={metadataLabelText}>Frame Rate</span>
								) : (
									<PresetDropdown
										label="Frame Rate"
										disabled={pendingValues.fps !== undefined}
										aria-label="Choose frame rate preset"
										values={frameRatePresetValues}
									/>
								)}
							</div>
						</div>
						<div style={metadataValue}>
							<CompositionMetadataValue
								computed={fpsIsComputed}
								disabled={disabled}
								field="fps"
								onSave={saveMetadata}
								pendingValue={pendingValues.fps ?? null}
								value={video.fps}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
