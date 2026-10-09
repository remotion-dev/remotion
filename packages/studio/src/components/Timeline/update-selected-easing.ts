import {
	CanvasInternals,
	getCanvasKeyframeChangeOverride,
	type CanvasKeyframeEasing,
} from '@remotion/sdk';
import type {
	CanUpdateSequencePropStatusKeyframed,
	DragOverrideValue,
	OverrideIdToNodePaths,
	PropStatuses,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callBatchUpdateKeyframeSettings} from './call-update-keyframe-settings';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {SetPropStatuses} from './save-sequence-prop';
import type {
	TimelineEasingSelection,
	TimelineSelection,
} from './TimelineSelection';

const {canEditKeyframeEasing, getKeyframeSegmentEasing, getSchemaField} =
	CanvasInternals;

export type EasingSelection = TimelineEasingSelection;
export type TimelineEasingValue = CanvasKeyframeEasing;
export type SelectedEasingUpdate =
	| {
			readonly type: 'sequence';
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly fieldKey: string;
			readonly schema: InteractivitySchema;
			readonly segmentIndex: number;
			readonly currentEasing: TimelineEasingValue;
			readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	  }
	| {
			readonly type: 'effect';
			readonly fileName: string;
			readonly nodePath: SequencePropsSubscriptionKey;
			readonly nodePathInfo: SequenceNodePathInfo;
			readonly effectIndex: number;
			readonly fieldKey: string;
			readonly schema: InteractivitySchema;
			readonly segmentIndex: number;
			readonly currentEasing: TimelineEasingValue;
			readonly propStatus: CanUpdateSequencePropStatusKeyframed;
	  };

const isEasingSelection = (
	selection: TimelineSelection,
): selection is EasingSelection => selection.type === 'easing';

export const getSelectedEasingUpdate = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	selection: EasingSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
}): SelectedEasingUpdate | null => {
	const field = parseKeyframeFieldFromNodePath(
		selection.nodePathInfo.auxiliaryKeys,
	);
	if (field === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo: selection.nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence) {
		return null;
	}

	const nodePath = selection.nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;

	if (field.type === 'sequence') {
		if (!sequence.controls) {
			return null;
		}

		const sequencePropStatus = Internals.getPropStatusesCtx(
			propStatuses,
			nodePath,
		)?.[field.fieldKey];
		if (
			sequencePropStatus?.status !== 'keyframed' ||
			!canEditKeyframeEasing({
				field: getSchemaField(sequence.controls.schema, field.fieldKey),
				propStatus: sequencePropStatus,
			})
		) {
			return null;
		}

		return {
			type: 'sequence' as const,
			fileName,
			nodePath,
			nodePathInfo: selection.nodePathInfo,
			fieldKey: field.fieldKey,
			schema: sequence.controls.schema,
			segmentIndex: selection.segmentIndex,
			currentEasing: getKeyframeSegmentEasing(
				sequencePropStatus,
				selection.segmentIndex,
			),
			propStatus: sequencePropStatus,
		};
	}

	const effect = sequence.effects[field.effectIndex];
	if (!effect) {
		return null;
	}

	const effectStatus = Internals.getEffectPropStatusesCtx({
		propStatuses,
		nodePath,
		effectIndex: field.effectIndex,
	});
	const effectPropStatus =
		effectStatus.type === 'can-update-effect'
			? effectStatus.props[field.fieldKey]
			: null;
	if (
		effectPropStatus?.status !== 'keyframed' ||
		!canEditKeyframeEasing({
			field: getSchemaField(effect.schema, field.fieldKey),
			propStatus: effectPropStatus,
		})
	) {
		return null;
	}

	return {
		type: 'effect' as const,
		fileName,
		nodePath,
		nodePathInfo: selection.nodePathInfo,
		effectIndex: field.effectIndex,
		fieldKey: field.fieldKey,
		schema: effect.schema,
		segmentIndex: selection.segmentIndex,
		currentEasing: getKeyframeSegmentEasing(
			effectPropStatus,
			selection.segmentIndex,
		),
		propStatus: effectPropStatus,
	};
};

export const getSelectedEasingUpdates = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	readonly selections: readonly TimelineSelection[];
	readonly sequences: TSequence[];
	readonly overrideIdsToNodePaths: OverrideIdToNodePaths;
	readonly propStatuses: PropStatuses;
}): SelectedEasingUpdate[] => {
	return getEasingSelections(selections)
		.map((selection) =>
			getSelectedEasingUpdate({
				selection,
				sequences,
				overrideIdsToNodePaths,
				propStatuses,
			}),
		)
		.filter((update): update is SelectedEasingUpdate => update !== null);
};

/** Previews an easing on the segment of a selected easing update. */
export const makeEasingDragOverride = ({
	update,
	easing,
}: {
	readonly update: SelectedEasingUpdate;
	readonly easing: TimelineEasingValue;
}): DragOverrideValue | null => {
	return getCanvasKeyframeChangeOverride({
		propStatus: update.propStatus,
		change: {
			nodePathInfo: update.nodePathInfo,
			key: update.fieldKey,
			schema: update.schema,
			operation: {
				type: 'easing',
				segmentIndex: update.segmentIndex,
				easing,
			},
		},
	});
};

export const getEasingSelections = (
	selections: readonly TimelineSelection[],
): EasingSelection[] => selections.filter(isEasingSelection);

export const getTimelineEasingValueForSelection = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	selection: EasingSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
}): TimelineEasingValue | null => {
	return (
		getSelectedEasingUpdate({
			selection,
			sequences,
			overrideIdsToNodePaths,
			propStatuses,
		})?.currentEasing ?? null
	);
};

export const updateSelectedTimelineEasings = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	setPropStatuses,
	clientId,
	easing,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
	setPropStatuses: SetPropStatuses;
	clientId: string;
	easing: TimelineEasingValue;
}): Promise<void> | null => {
	const easingSelections = getEasingSelections(selections);
	if (easingSelections.length === 0) {
		return null;
	}

	const updates = getSelectedEasingUpdates({
		selections: easingSelections,
		sequences,
		overrideIdsToNodePaths,
		propStatuses,
	});

	if (updates.length === 0) {
		return null;
	}

	return callBatchUpdateKeyframeSettings({
		sequenceKeyframes: updates
			.filter((update) => update.type === 'sequence')
			.map((update) => ({
				fileName: update.fileName,
				nodePath: update.nodePath,
				fieldKey: update.fieldKey,
				settings: {
					type: 'easing',
					segmentIndex: update.segmentIndex,
					easing,
				},
				schema: update.schema,
			})),
		effectKeyframes: updates
			.filter((update) => update.type === 'effect')
			.map((update) => ({
				fileName: update.fileName,
				nodePath: update.nodePath,
				effectIndex: update.effectIndex,
				fieldKey: update.fieldKey,
				settings: {
					type: 'easing',
					segmentIndex: update.segmentIndex,
					easing,
				},
				schema: update.schema,
			})),
		setPropStatuses,
		clientId,
	});
};
