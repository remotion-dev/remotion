import React, {useCallback, useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {AlignBottomIcon} from '../../icons/align-bottom';
import {AlignCenterHorizontalIcon} from '../../icons/align-center-horizontal';
import {AlignCenterVerticalIcon} from '../../icons/align-center-vertical';
import {AlignLeftIcon} from '../../icons/align-left';
import {AlignRightIcon} from '../../icons/align-right';
import {AlignTopIcon} from '../../icons/align-top';
import {INSPECTOR_PANEL_HORIZONTAL_PADDING} from '../InspectorPanelLayout';
import {getSelectedOutlineActiveSchema} from '../selected-outline-drag';
import {translateFieldKey} from '../selected-outline-types';
import {callAddSequenceKeyframe} from '../Timeline/call-add-keyframe';
import {saveSequenceProps} from '../Timeline/save-sequence-prop';
import {
	parseTranslate,
	serializeTranslate,
} from '../Timeline/timeline-translate-utils';
import {computeAlignedTranslate} from './alignment-controls';
import {InspectorSectionHeader} from './common';
import {inspectorSectionDivider} from './styles';

const isPropStatusDraggable = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	propStatus: any,
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
	width: 22,
	height: 22,
};

const verticalDivider: React.CSSProperties = {
	width: 1,
	height: 16,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	margin: '0 8px',
};

const AlignmentButton: React.FC<{
	readonly onClick: () => void;
	readonly title: string;
	readonly children: React.ReactNode;
}> = ({onClick, title, children}) => {
	const [hover, setHover] = React.useState(false);
	return (
		<button
			title={title}
			onClick={onClick}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			type="button"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 30,
				height: 30,
				background: 'none',
				border: '1px solid',
				borderColor: hover ? 'rgba(128, 128, 128, 0.5)' : 'transparent',
				borderRadius: 4,
				padding: 0,
				color: 'currentColor',
				cursor: 'pointer',
			}}
		>
			{children}
		</button>
	);
};

export const AlignmentControls: React.FC<{
	readonly track: TrackWithHash;
}> = ({track}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {propStatuses} = useContext(Internals.VisualModePropStatusesContext);
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

	const timelinePosition = Internals.Timeline.useTimelinePosition();

	const handleAlign = useCallback(
		(
			direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom',
		) => {
			if (
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

			const nodePath = track.nodePathInfo.sequenceSubscriptionKey;
			const nodePropStatuses = Internals.getPropStatusesCtx(
				propStatuses,
				nodePath,
			);
			const sourceFrame = timelinePosition - track.keyframeDisplayOffset;
			const dragOverrides = getDragOverrides(nodePath) ?? {};

			const activeSchema = getSelectedOutlineActiveSchema({
				schema: track.sequence.controls.schema,
				currentRuntimeValueDotNotation:
					track.sequence.controls.currentRuntimeValueDotNotation,
				dragOverrides,
				propStatus: nodePropStatuses,
				frame: sourceFrame,
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

			if (!currentCompositionMetadata?.width) {
				return;
			}

			const r = ref as Element;
			const compositionContainer =
				typeof r.closest === 'function'
					? r.closest('.remotion-studio-composition-container')
					: null;
			if (!compositionContainer) {
				return;
			}

			const compositionRect = compositionContainer.getBoundingClientRect();

			const scale = compositionRect.width / currentCompositionMetadata.width;

			const currentTranslate = propStatus
				? String(
						Internals.getEffectiveVisualModeValue({
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							propStatus: propStatus as any,
							dragOverrideValue: dragOverrides[translateFieldKey],
							defaultValue: fieldSchema.default,
							frame: sourceFrame,
							shouldResortToDefaultValueIfUndefined: true,
						}) ??
							fieldSchema.default ??
							'0px 0px',
					)
				: String(fieldSchema.default ?? '0px 0px');

			const [currentX, currentY] = parseTranslate(currentTranslate);

			const {x: newX, y: newY} = computeAlignedTranslate({
				direction,
				elementRect,
				compositionRect,
				currentTranslateX: currentX,
				currentTranslateY: currentY,
				scale,
			});

			const newValue = serializeTranslate(newX, newY);

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
					sourceFrame,
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
			currentCompositionMetadata,
			timelinePosition,
			propStatuses,
			getDragOverrides,
			setPropStatuses,
		],
	);

	if (
		previewServerState.type !== 'connected' ||
		!track.nodePathInfo ||
		!track.sequence.controls ||
		!currentCompositionMetadata
	) {
		return null;
	}

	const renderNodePath = track.nodePathInfo.sequenceSubscriptionKey;
	const renderNodePropStatuses = Internals.getPropStatusesCtx(
		propStatuses,
		renderNodePath,
	);
	const renderSourceFrame = timelinePosition - track.keyframeDisplayOffset;
	const renderDragOverrides = getDragOverrides(renderNodePath) ?? {};

	const renderActiveSchema = getSelectedOutlineActiveSchema({
		schema: track.sequence.controls.schema,
		currentRuntimeValueDotNotation:
			track.sequence.controls.currentRuntimeValueDotNotation,
		dragOverrides: renderDragOverrides,
		propStatus: renderNodePropStatuses,
		frame: renderSourceFrame,
	});

	const renderFieldSchema = renderActiveSchema?.[translateFieldKey];
	const renderPropStatus = renderNodePropStatuses?.[translateFieldKey];

	if (renderFieldSchema?.type !== 'translate') {
		return null;
	}

	if (!isPropStatusDraggable(renderPropStatus)) {
		return null;
	}

	return (
		<>
			<InspectorSectionHeader>Alignment</InspectorSectionHeader>
			<div style={container}>
				<AlignmentButton title="Align left" onClick={() => handleAlign('left')}>
					<AlignLeftIcon style={iconStyle} />
				</AlignmentButton>
				<AlignmentButton
					title="Align center horizontally"
					onClick={() => handleAlign('center-h')}
				>
					<AlignCenterHorizontalIcon style={iconStyle} />
				</AlignmentButton>
				<AlignmentButton
					title="Align right"
					onClick={() => handleAlign('right')}
				>
					<AlignRightIcon style={iconStyle} />
				</AlignmentButton>
				<div style={verticalDivider} />
				<AlignmentButton title="Align top" onClick={() => handleAlign('top')}>
					<AlignTopIcon style={iconStyle} />
				</AlignmentButton>
				<AlignmentButton
					title="Align center vertically"
					onClick={() => handleAlign('center-v')}
				>
					<AlignCenterVerticalIcon style={iconStyle} />
				</AlignmentButton>
				<AlignmentButton
					title="Align bottom"
					onClick={() => handleAlign('bottom')}
				>
					<AlignBottomIcon style={iconStyle} />
				</AlignmentButton>
			</div>
			<div style={inspectorSectionDivider} />
		</>
	);
};
