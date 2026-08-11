import type {RecastCodemod} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_40} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {CaretDown} from '../../icons/caret';
import {InlineDropdown} from '../InlineDropdown';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {
	InputDragger,
	inputDraggerContainerStyle,
} from '../NewComposition/InputDragger';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyCodemod} from '../RenderQueue/actions';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {InspectorDetailRow} from './common';
import {
	acceptPendingCompositionMetadataValue,
	type CompositionMetadataField,
	failPendingCompositionMetadataValue,
	type PendingCompositionMetadata,
	type PendingCompositionMetadataValue,
	reconcilePendingCompositionMetadata,
} from './optimistic-composition-metadata';
import {detailsContainer} from './styles';

const compositionMetadataContainer: React.CSSProperties = {
	...detailsContainer,
	paddingBottom: 4,
	paddingTop: 4,
};

const fieldLabels: Record<CompositionMetadataField, string> = {
	durationInFrames: 'Duration',
	fps: 'Frame rate',
	height: 'Height',
	width: 'Width',
};

const computedContainerStyle: React.CSSProperties = {
	...inputDraggerContainerStyle,
	textAlign: 'right',
	userSelect: 'none',
};

const computedValueStyle: React.CSSProperties = {
	color: WHITE_ALPHA_40,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontStyle: 'italic',
	lineHeight: '20px',
};

const dimensionsControls: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	gap: 4,
	justifyContent: 'flex-end',
	lineHeight: '20px',
	minWidth: 0,
};

const presetButtonIcon: React.CSSProperties = {
	alignItems: 'center',
	color: 'inherit',
	display: 'flex',
	flexShrink: 0,
	height: 12,
	justifyContent: 'center',
	width: 12,
};

const presetDropdownContainer: React.CSSProperties = {
	display: 'flex',
	flexShrink: 0,
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
	textOverflow: 'ellipsis',
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

const PresetDropdown: React.FC<{
	readonly disabled: boolean;
	readonly title: string;
	readonly values: ComboboxValue[];
	readonly visible: boolean;
}> = ({disabled, title, values, visible}) => {
	const renderAction = useCallback((color: string) => {
		return (
			<span style={presetButtonIcon}>
				<CaretDown color={color} small />
			</span>
		);
	}, []);

	return (
		<div
			style={{
				...presetDropdownContainer,
				visibility: visible ? 'visible' : 'hidden',
			}}
		>
			<InlineDropdown
				disabled={disabled}
				renderAction={renderAction}
				title={title}
				values={values}
				variant="compact"
			/>
		</div>
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
				return `${numberValue}fps`;
			}

			const roundedValue = Math.round(numberValue);
			if (field === 'durationInFrames') {
				return `${roundedValue} ${roundedValue === 1 ? 'frame' : 'frames'}`;
			}

			return String(roundedValue);
		},
		[field],
	);

	return computed ? (
		<span style={computedContainerStyle}>
			<span style={computedValueStyle}>{formatValue(value)}</span>
		</span>
	) : disabled ? (
		formatValue(value)
	) : (
		<InputDragger
			aria-label={fieldLabels[field]}
			type="number"
			value={dragValue ?? pendingValue?.value ?? value}
			disabled={pendingValue !== null}
			status="ok"
			onValueChange={setDragValue}
			onValueChangeEnd={save}
			onTextChange={() => undefined}
			min={isFps ? 0.01 : 1}
			step={isFps ? 0.01 : 1}
			dragDecimalPlaces={isFps ? 2 : 0}
			formatter={formatValue}
			rightAlign
			small
		/>
	);
};

export const CompositionMetadata: React.FC<{
	readonly compositionId: string;
	readonly disabled: boolean;
	readonly stack: string | null;
}> = ({compositionId, disabled, stack}) => {
	const video = Internals.useVideo();
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
			const codemod: RecastCodemod = {
				type: 'update-composition-metadata',
				idToUpdate: compositionId,
				newDurationInFrames: newValues.durationInFrames ?? null,
				newFps: newValues.fps ?? null,
				newHeight: newValues.height ?? null,
				newWidth: newValues.width ?? null,
			};
			setPendingValues((pending) => ({...pending, ...optimisticValues}));
			applyCodemod({
				codemod,
				dryRun: false,
				signal: new AbortController().signal,
				symbolicatedStack,
			})
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
			<InspectorDetailRow
				label={(hovered) => (
					<div style={metadataLabelControls}>
						<span style={metadataLabelText}>Dimensions</span>
						{disabled || widthIsComputed || heightIsComputed ? null : (
							<PresetDropdown
								disabled={
									pendingValues.width !== undefined ||
									pendingValues.height !== undefined
								}
								title="Choose dimension preset"
								values={dimensionPresetValues}
								visible={hovered}
							/>
						)}
					</div>
				)}
			>
				<div style={dimensionsControls}>
					<CompositionMetadataValue
						computed={widthIsComputed}
						disabled={disabled}
						field="width"
						onSave={saveMetadata}
						pendingValue={pendingValues.width ?? null}
						value={video.width}
					/>
					{disabled ? '\u00A0' : null}
					<CompositionMetadataValue
						computed={heightIsComputed}
						disabled={disabled}
						field="height"
						onSave={saveMetadata}
						pendingValue={pendingValues.height ?? null}
						value={video.height}
					/>
				</div>
			</InspectorDetailRow>
			{isStill ? null : (
				<>
					<InspectorDetailRow
						label={(hovered) => (
							<div style={metadataLabelControls}>
								<span style={metadataLabelText}>Frame rate</span>
								{disabled || fpsIsComputed ? null : (
									<PresetDropdown
										disabled={pendingValues.fps !== undefined}
										title="Choose frame rate preset"
										values={frameRatePresetValues}
										visible={hovered}
									/>
								)}
							</div>
						)}
					>
						<div style={dimensionsControls}>
							<CompositionMetadataValue
								computed={fpsIsComputed}
								disabled={disabled}
								field="fps"
								onSave={saveMetadata}
								pendingValue={pendingValues.fps ?? null}
								value={video.fps}
							/>
						</div>
					</InspectorDetailRow>
					<InspectorDetailRow label="Duration">
						<CompositionMetadataValue
							computed={durationIsComputed}
							disabled={disabled}
							field="durationInFrames"
							onSave={saveMetadata}
							pendingValue={pendingValues.durationInFrames ?? null}
							value={video.durationInFrames}
						/>
					</InspectorDetailRow>
				</>
			)}
		</div>
	);
};
