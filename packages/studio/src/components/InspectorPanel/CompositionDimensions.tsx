import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import React, {useCallback, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {WHITE_ALPHA_40} from '../../helpers/colors';
import {isCompositionStill} from '../../helpers/is-composition-still';
import {resolvedStackToSymbolicated} from '../../helpers/resolved-stack-to-symbolicated';
import {InputDragger} from '../NewComposition/InputDragger';
import {showNotification} from '../Notifications/NotificationCenter';
import {applyCodemod} from '../RenderQueue/actions';
import {useResolvedStack} from '../Timeline/use-resolved-stack';
import {InspectorDetailRow} from './common';
import {detailsContainer} from './styles';

type CompositionMetadataField = 'durationInFrames' | 'fps' | 'height' | 'width';

const fieldLabels: Record<CompositionMetadataField, string> = {
	durationInFrames: 'Duration in frames',
	fps: 'FPS',
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

const CompositionMetadataValue: React.FC<{
	readonly compositionId: string;
	readonly computed: boolean;
	readonly disabled: boolean;
	readonly field: CompositionMetadataField;
	readonly symbolicatedStack: SymbolicatedStackFrame | null;
	readonly value: number;
}> = ({compositionId, computed, disabled, field, symbolicatedStack, value}) => {
	const [dragValue, setDragValue] = useState<number | null>(null);

	const save = useCallback(
		(newValue: number) => {
			if (newValue === value) {
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
			applyCodemod({
				codemod,
				dryRun: false,
				signal: new AbortController().signal,
				symbolicatedStack,
			})
				.then((result) => {
					if (!result.success) {
						showNotification(
							`Could not update composition ${field}: ${result.reason}`,
							2000,
						);
					}
				})
				.catch((error) => {
					showNotification(
						`Could not update composition ${field}: ${(error as Error).message}`,
						2000,
					);
				})
				.finally(() => {
					setDragValue(null);
				});
		},
		[compositionId, field, symbolicatedStack, value],
	);
	const isFps = field === 'fps';

	return (
		<InspectorDetailRow label={fieldLabels[field]}>
			{computed ? (
				<span style={computedStyle}>computed</span>
			) : disabled ? (
				value
			) : (
				<InputDragger
					type="number"
					value={dragValue ?? value}
					status="ok"
					onValueChange={setDragValue}
					onValueChangeEnd={save}
					onTextChange={() => undefined}
					min={isFps ? 0.01 : 1}
					step={isFps ? 0.01 : 1}
					dragDecimalPlaces={isFps ? 2 : 0}
					formatter={(newValue) =>
						isFps
							? String(Number(newValue))
							: String(Math.round(Number(newValue)))
					}
					rightAlign
					small
				/>
			)}
		</InspectorDetailRow>
	);
};

export const CompositionDimensions: React.FC<{
	readonly compositionId: string;
	readonly disabled: boolean;
	readonly stack: string | null;
}> = ({compositionId, disabled, stack}) => {
	const video = Internals.useVideo();
	const resolvedVideoConfig = Internals.useResolvedVideoConfig(compositionId);
	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);

	if (video === null) {
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
			<CompositionMetadataValue
				compositionId={compositionId}
				computed={widthIsComputed}
				disabled={disabled}
				field="width"
				symbolicatedStack={symbolicatedStack}
				value={video.width}
			/>
			<CompositionMetadataValue
				compositionId={compositionId}
				computed={heightIsComputed}
				disabled={disabled}
				field="height"
				symbolicatedStack={symbolicatedStack}
				value={video.height}
			/>
			{isStill ? null : (
				<>
					<CompositionMetadataValue
						compositionId={compositionId}
						computed={fpsIsComputed}
						disabled={disabled}
						field="fps"
						symbolicatedStack={symbolicatedStack}
						value={video.fps}
					/>
					<CompositionMetadataValue
						compositionId={compositionId}
						computed={durationIsComputed}
						disabled={disabled}
						field="durationInFrames"
						symbolicatedStack={symbolicatedStack}
						value={video.durationInFrames}
					/>
				</>
			)}
		</div>
	);
};
