import React, {useCallback, useContext, useMemo} from 'react';
import {
	Internals,
	type CanUpdateSequencePropStatus,
	type SequenceRegistrationControls,
} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TimelineTrackData} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioInteractivityEnabled} from '../../helpers/interactivity-enabled';
import {useRuntimeValueSelector} from '../../helpers/use-runtime-values';
import {AlignBottomIcon} from '../../icons/align-bottom';
import {AlignCenterHorizontalIcon} from '../../icons/align-center-horizontal';
import {AlignCenterVerticalIcon} from '../../icons/align-center-vertical';
import {AlignLeftIcon} from '../../icons/align-left';
import {AlignRightIcon} from '../../icons/align-right';
import {AlignTopIcon} from '../../icons/align-top';
import {ActionTooltip} from '../ActionTooltip';
import {InlineAction} from '../InlineAction';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {getSelectedOutlineActiveSchema} from '../selected-outline-drag';
import {translateFieldKey} from '../selected-outline-types';
import {callAddSequenceKeyframe} from '../Timeline/call-add-keyframe';
import {
	getKeyframeDisplayOffset,
	getKeyframeSourceFrame,
} from '../Timeline/get-timeline-keyframes';
import {
	getCurrentDimensions,
	getCurrentFrame,
} from '../Timeline/imperative-state';
import {saveSequenceProps} from '../Timeline/save-sequence-prop';
import {
	parseTranslate,
	serializeTranslate,
} from '../Timeline/timeline-translate-utils';
import {computeAlignedTranslate} from './alignment-controls';

const isPropStatusDraggable = (
	propStatus: CanUpdateSequencePropStatus | undefined,
) => {
	return (
		!propStatus ||
		propStatus.status === 'static' ||
		(propStatus.status === 'keyframed' &&
			propStatus.interpolationFunction === 'interpolate')
	);
};

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	gap: 4,
	padding: `0 ${INSPECTOR_PANEL_HORIZONTAL_PADDING}px 12px`,
	alignItems: 'center',
};

const iconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
};

const verticalSpacer: React.CSSProperties = {
	width: 1,
	height: 16,
	margin: '0 8px',
};

const AlignmentButton: React.FC<{
	readonly onClick: () => void;
	readonly 'aria-label': string;
	readonly Icon: React.FC<React.SVGProps<SVGSVGElement>>;
	readonly disabled: boolean;
}> = ({onClick, 'aria-label': ariaLabel, Icon, disabled}) => {
	return (
		<ActionTooltip label={ariaLabel} shortcut={null} delay={800} dismissOnClick>
			<InlineAction
				variant={null}
				aria-label={ariaLabel}
				onClick={onClick}
				renderAction={(color) => <Icon style={iconStyle} color={color} />}
				disabled={disabled}
			/>
		</ActionTooltip>
	);
};

type AlignmentDirection =
	| 'left'
	| 'center-h'
	| 'right'
	| 'top'
	| 'center-v'
	| 'bottom';
type AlignmentEligibility = 'hidden' | 'enabled' | 'disabled';

const AlignmentButtons = React.memo(
	({
		eligibility,
		onAlign,
	}: {
		readonly eligibility: AlignmentEligibility;
		readonly onAlign: (direction: AlignmentDirection) => void;
	}) => {
		if (eligibility === 'hidden') {
			return null;
		}

		const alignmentDisabled = eligibility === 'disabled';

		return (
			<div style={container}>
				<AlignmentButton
					aria-label="Align left"
					onClick={() => onAlign('left')}
					Icon={AlignLeftIcon}
					disabled={alignmentDisabled}
				/>
				<AlignmentButton
					aria-label="Align center horizontally"
					onClick={() => onAlign('center-h')}
					Icon={AlignCenterHorizontalIcon}
					disabled={alignmentDisabled}
				/>
				<AlignmentButton
					aria-label="Align right"
					onClick={() => onAlign('right')}
					Icon={AlignRightIcon}
					disabled={alignmentDisabled}
				/>
				<div style={verticalSpacer} />
				<AlignmentButton
					aria-label="Align top"
					onClick={() => onAlign('top')}
					Icon={AlignTopIcon}
					disabled={alignmentDisabled}
				/>
				<AlignmentButton
					aria-label="Align center vertically"
					onClick={() => onAlign('center-v')}
					Icon={AlignCenterVerticalIcon}
					disabled={alignmentDisabled}
				/>
				<AlignmentButton
					aria-label="Align bottom"
					onClick={() => onAlign('bottom')}
					Icon={AlignBottomIcon}
					disabled={alignmentDisabled}
				/>
			</div>
		);
	},
);

const AlignmentControlsWithAnimatedSchema: React.FC<{
	readonly controls: SequenceRegistrationControls;
	readonly getEligibility: (
		values: Readonly<Record<string, unknown>>,
		frame: number,
	) => AlignmentEligibility;
	readonly onAlign: (direction: AlignmentDirection) => void;
}> = ({controls, getEligibility, onAlign}) => {
	const frame = Internals.Timeline.useTimelinePosition();
	return (
		<AlignmentButtons
			eligibility={getEligibility(controls.runtimeValues.getSnapshot(), frame)}
			onAlign={onAlign}
		/>
	);
};

const AlignmentControlsUnmemoized: React.FC<{
	readonly track: TimelineTrackData;
}> = ({track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
	const propStatusesRef = useContext(
		Internals.VisualModePropStatusesRefContext,
	);
	const {getDragOverrides} = useContext(
		Internals.VisualModeDragOverridesContext,
	);
	const {setPropStatuses} = useContext(Internals.VisualModeSettersContext);
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const currentCompositionMetadata = useMemo(() => {
		if (canvasContent?.type !== 'composition') return null;
		return (
			compositions.find((c) => c.id === canvasContent.compositionId) ?? null
		);
	}, [canvasContent, compositions]);

	const renderNodePath = track.nodePathInfo?.sequenceSubscriptionKey ?? null;
	const renderNodePropStatuses =
		renderNodePath === null
			? undefined
			: Internals.getPropStatusesCtx(propStatuses, renderNodePath);
	const schema = track.sequence.controls?.schema ?? null;
	const getAlignmentEligibility = useCallback(
		(
			runtimeValues: Readonly<Record<string, unknown>>,
			frame: number,
		): AlignmentEligibility => {
			if (schema === null) {
				return 'hidden';
			}

			// Only enum values decide which translate field is visible. Animated
			// numeric values are read when aligning, without rendering the buttons.
			const renderDragOverrides =
				renderNodePath === null ? {} : (getDragOverrides(renderNodePath) ?? {});
			const activeSchema = Internals.flattenActiveSchema(schema, (key) => {
				const {merged} = Internals.computeEffectiveSchemaValuesDotNotation({
					schema,
					currentValue: Object.prototype.hasOwnProperty.call(runtimeValues, key)
						? {[key]: runtimeValues[key]}
						: {},
					overrideValues: renderDragOverrides,
					propStatus: renderNodePropStatuses,
					frame:
						(frame - track.keyframeDisplayOffset) * track.keyframePlaybackRate,
				});
				return merged[key];
			});
			if (activeSchema[translateFieldKey]?.type !== 'translate') {
				return 'hidden';
			}

			return isPropStatusDraggable(renderNodePropStatuses?.[translateFieldKey])
				? 'enabled'
				: 'disabled';
		},
		[
			getDragOverrides,
			renderNodePath,
			renderNodePropStatuses,
			schema,
			track.keyframeDisplayOffset,
			track.keyframePlaybackRate,
		],
	);
	const selectAlignmentEligibility = useCallback(
		(values: Readonly<Record<string, unknown>>) =>
			getAlignmentEligibility(values, getCurrentFrame()),
		[getAlignmentEligibility],
	);
	const hasAnimatedSchema = useMemo(() => {
		if (schema === null) {
			return false;
		}

		const dragOverrides =
			renderNodePath === null ? {} : (getDragOverrides(renderNodePath) ?? {});
		const schemas = [schema];
		while (schemas.length > 0) {
			const currentSchema = schemas.pop()!;
			for (const [key, field] of Object.entries(currentSchema)) {
				if (field.type !== 'enum') {
					continue;
				}

				if (
					renderNodePropStatuses?.[key]?.status === 'keyframed' ||
					dragOverrides[key]?.type === 'keyframed'
				) {
					return true;
				}

				schemas.push(...Object.values(field.variants));
			}
		}

		return false;
	}, [getDragOverrides, renderNodePath, renderNodePropStatuses, schema]);
	const alignmentEligibility = useRuntimeValueSelector({
		controls: track.sequence.controls,
		selector: selectAlignmentEligibility,
	});

	const handleAlign = useCallback(
		(direction: AlignmentDirection) => {
			if (
				!isStudioInteractivityEnabled() ||
				previewServerState.type !== 'connected' ||
				!track.nodePathInfo ||
				!track.sequence.controls
			) {
				return;
			}

			const ref = track.sequence.refForOutline?.current;
			if (!ref) {
				return;
			}

			const timelinePosition = getCurrentFrame();
			const runtimeValues = track.sequence.controls.runtimeValues.getSnapshot();
			const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatusesRef.current,
				nodePath,
			);
			const dragOverrides = getDragOverrides(nodePath) ?? {};

			const activeSchema = getSelectedOutlineActiveSchema({
				schema: track.sequence.controls.schema,
				currentRuntimeValueDotNotation: runtimeValues,
				dragOverrides,
				propStatus: nodePropStatuses,
				frame:
					(timelinePosition - track.keyframeDisplayOffset) *
					track.keyframePlaybackRate,
			});

			const fieldSchema = activeSchema?.[translateFieldKey];
			const propStatus = nodePropStatuses?.[translateFieldKey];

			if (fieldSchema?.type !== 'translate') {
				return;
			}

			if (!isPropStatusDraggable(propStatus)) {
				return;
			}

			let elementRect: DOMRect;
			try {
				elementRect = ref.getBoundingClientRect();
			} catch {
				return;
			}

			const {width} = getCurrentDimensions();
			if (!width) {
				return;
			}

			const compositionRect = Internals.portalNode().getBoundingClientRect();
			if (compositionRect.width === 0 || compositionRect.height === 0) {
				return;
			}

			const scale = compositionRect.width / width;

			const currentTranslate = propStatus
				? String(
						Internals.getEffectiveVisualModeValue({
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							propStatus: propStatus as any,
							dragOverrideValue: dragOverrides[translateFieldKey],
							defaultValue: fieldSchema.default,
							frame:
								(timelinePosition - track.keyframeDisplayOffset) *
								track.keyframePlaybackRate,
							shouldResortToDefaultValueIfUndefined: true,
						}) ??
							fieldSchema.default ??
							'0px 0px',
					)
				: String(fieldSchema.default ?? '0px 0px');

			const [currentX, currentY, currentZ] = parseTranslate(currentTranslate);

			const {x: newX, y: newY} = computeAlignedTranslate({
				direction,
				elementRect,
				compositionRect,
				currentTranslateX: currentX,
				currentTranslateY: currentY,
				scale,
			});

			const newValue = serializeTranslate([newX, newY, currentZ]);

			const undoLabels = {
				left: 'Align left',
				'center-h': 'Align center horizontally',
				right: 'Align right',
				top: 'Align top',
				'center-v': 'Align center vertically',
				bottom: 'Align bottom',
			};

			const label = undoLabels[direction];

			if (!propStatus || propStatus.status === 'static') {
				saveSequenceProps({
					addedKeyframes: null,
					movedKeyframes: null,
					changes: [
						{
							fileName: nodePath.absolutePath,
							nodePath,
							fieldKey: translateFieldKey,
							value: newValue,
							defaultValue:
								fieldSchema.default !== undefined
									? JSON.stringify(fieldSchema.default)
									: null,
							schema: track.sequence.controls.schema,
						},
					],
					setPropStatuses,
					clientId: previewServerState.clientId,
					undoLabel: label,
					redoLabel: label,
				});
			} else {
				callAddSequenceKeyframe({
					fileName: nodePath.absolutePath,
					nodePath,
					fieldKey: translateFieldKey,
					sourceFrame: getKeyframeSourceFrame({
						displayFrame: timelinePosition,
						keyframeDisplayOffset: getKeyframeDisplayOffset({
							propStatus,
							keyframeDisplayOffset: track.keyframeDisplayOffset,
							keyframePlaybackRate: track.keyframePlaybackRate,
						}),
						keyframePlaybackRate: track.keyframePlaybackRate,
						propStatus,
					}),
					value: newValue,
					schema: track.sequence.controls.schema,
					setPropStatuses,
					clientId: previewServerState.clientId,
				});
			}
		},
		[
			previewServerState,
			track,
			propStatusesRef,
			getDragOverrides,
			setPropStatuses,
		],
	);

	if (
		!isStudioInteractivityEnabled() ||
		previewServerState.type !== 'connected' ||
		!track.nodePathInfo ||
		!track.sequence.controls ||
		!currentCompositionMetadata
	) {
		return null;
	}

	return hasAnimatedSchema ? (
		<AlignmentControlsWithAnimatedSchema
			controls={track.sequence.controls}
			getEligibility={getAlignmentEligibility}
			onAlign={handleAlign}
		/>
	) : (
		<AlignmentButtons
			eligibility={alignmentEligibility}
			onAlign={handleAlign}
		/>
	);
};

export const AlignmentControls = React.memo(AlignmentControlsUnmemoized);
