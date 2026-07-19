import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_40} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {InputDragger} from '../NewComposition/InputDragger';
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

const fieldLabels: Record<CompositionMetadataField, string> = {
	durationInFrames: 'Duration',
	fps: 'Frame rate',
	height: 'Height',
	width: 'Width',
};

const computedStyle: React.CSSProperties = {
	color: WHITE_ALPHA_40,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontStyle: 'italic',
	lineHeight: '16px',
	userSelect: 'none',
};

const dimensionsControls: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 12,
	gap: 4,
	justifyContent: 'flex-end',
	lineHeight: '16px',
	minWidth: 0,
};

const CompositionMetadataValue: React.FC<{
	readonly compositionId: string;
	readonly computed: boolean;
	readonly disabled: boolean;
	readonly field: CompositionMetadataField;
	readonly onPendingValue: (
		field: CompositionMetadataField,
		value: PendingCompositionMetadataValue,
	) => void;
	readonly onPendingValueAccepted: (
		field: CompositionMetadataField,
		value: PendingCompositionMetadataValue,
	) => void;
	readonly onPendingValueFailed: (
		field: CompositionMetadataField,
		value: PendingCompositionMetadataValue,
	) => void;
	readonly pendingValue: PendingCompositionMetadataValue | null;
	readonly resolvedConfig: object;
	readonly symbolicatedStack: SymbolicatedStackFrame | null;
	readonly value: number;
}> = ({
	compositionId,
	computed,
	disabled,
	field,
	onPendingValue,
	onPendingValueAccepted,
	onPendingValueFailed,
	pendingValue,
	resolvedConfig,
	symbolicatedStack,
	value,
}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const save = useCallback(
		(newValue: number) => {
			if (newValue === (pendingValue?.value ?? value)) {
				setDragValue(null);
				return;
			}

			if (symbolicatedStack === null) {
				setDragValue(null);
				showNotification(
					'Could not determine where this composition is defined',
					2000,
				);
				return;
			}

			const codemod: RecastCodemod = {
				type: 'update-composition-metadata',
				idToUpdate: compositionId,
				newDurationInFrames: field === 'durationInFrames' ? newValue : null,
				newFps: field === 'fps' ? newValue : null,
				newHeight: field === 'height' ? newValue : null,
				newWidth: field === 'width' ? newValue : null,
			};
			const optimisticValue: PendingCompositionMetadataValue = {
				baseline: resolvedConfig,
				status: 'saving',
				value: newValue,
			};
			onPendingValue(field, optimisticValue);
			setDragValue(null);
			applyCodemod({
				codemod,
				dryRun: false,
				signal: new AbortController().signal,
				symbolicatedStack,
			})
				.then((result) => {
					if (!result.success) {
						onPendingValueFailed(field, optimisticValue);
						showNotification(
							`Could not update composition ${field}: ${result.reason}`,
							2000,
						);
						return;
					}

					onPendingValueAccepted(field, optimisticValue);
				})
				.catch((error) => {
					onPendingValueFailed(field, optimisticValue);
					showNotification(
						`Could not update composition ${field}: ${(error as Error).message}`,
						2000,
					);
				});
		},
		[
			compositionId,
			field,
			onPendingValue,
			onPendingValueAccepted,
			onPendingValueFailed,
			pendingValue?.value,
			resolvedConfig,
			symbolicatedStack,
			value,
		],
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
		<span style={computedStyle}>{formatValue(value)}</span>
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

export const CompositionDimensions: React.FC<{
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

	const onPendingValue = useCallback(
		(
			field: CompositionMetadataField,
			value: PendingCompositionMetadataValue,
		) => {
			setPendingValues((pending) => ({...pending, [field]: value}));
		},
		[],
	);
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

	return (
		<div style={detailsContainer}>
			<InspectorDetailRow label="Dimensions">
				<div style={dimensionsControls}>
					<CompositionMetadataValue
						compositionId={compositionId}
						computed={widthIsComputed}
						disabled={disabled}
						field="width"
						onPendingValue={onPendingValue}
						onPendingValueAccepted={onPendingValueAccepted}
						onPendingValueFailed={onPendingValueFailed}
						pendingValue={pendingValues.width ?? null}
						resolvedConfig={resolvedConfig}
						symbolicatedStack={symbolicatedStack}
						value={video.width}
					/>
					<CompositionMetadataValue
						compositionId={compositionId}
						computed={heightIsComputed}
						disabled={disabled}
						field="height"
						onPendingValue={onPendingValue}
						onPendingValueAccepted={onPendingValueAccepted}
						onPendingValueFailed={onPendingValueFailed}
						pendingValue={pendingValues.height ?? null}
						resolvedConfig={resolvedConfig}
						symbolicatedStack={symbolicatedStack}
						value={video.height}
					/>
				</div>
			</InspectorDetailRow>
			{isStill ? null : (
				<>
					<InspectorDetailRow label="Frame rate">
						<CompositionMetadataValue
							compositionId={compositionId}
							computed={fpsIsComputed}
							disabled={disabled}
							field="fps"
							onPendingValue={onPendingValue}
							onPendingValueAccepted={onPendingValueAccepted}
							onPendingValueFailed={onPendingValueFailed}
							pendingValue={pendingValues.fps ?? null}
							resolvedConfig={resolvedConfig}
							symbolicatedStack={symbolicatedStack}
							value={video.fps}
						/>
					</InspectorDetailRow>
					<InspectorDetailRow label="Duration">
						<CompositionMetadataValue
							compositionId={compositionId}
							computed={durationIsComputed}
							disabled={disabled}
							field="durationInFrames"
							onPendingValue={onPendingValue}
							onPendingValueAccepted={onPendingValueAccepted}
							onPendingValueFailed={onPendingValueFailed}
							pendingValue={pendingValues.durationInFrames ?? null}
							resolvedConfig={resolvedConfig}
							symbolicatedStack={symbolicatedStack}
							value={video.durationInFrames}
						/>
					</InspectorDetailRow>
				</>
			)}
		</div>
	);
};
