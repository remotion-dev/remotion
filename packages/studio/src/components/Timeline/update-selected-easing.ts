import type {OverrideIdToNodePaths, PropStatuses, TSequence} from 'remotion';
import {Internals} from 'remotion';
import {
	callUpdateEffectKeyframeSettings,
	callUpdateSequenceKeyframeSettings,
} from './call-update-keyframe-settings';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {SetPropStatuses} from './save-sequence-prop';
import type {
	TimelineEasingSelection,
	TimelineSelection,
} from './TimelineSelection';

export type EasingSelection = TimelineEasingSelection;
export type TimelineEasingValue = 'linear' | [number, number, number, number];

const canEditEasingForInterpolationFunction = (
	interpolationFunction: string,
): boolean =>
	interpolationFunction === 'interpolate' ||
	interpolationFunction === 'interpolateColors';

const isEasingSelection = (
	selection: TimelineSelection,
): selection is EasingSelection => selection.type === 'easing';

const getSelectedEasingUpdate = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
}: {
	selection: EasingSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses;
}) => {
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
			!canEditEasingForInterpolationFunction(
				sequencePropStatus.interpolationFunction,
			)
		) {
			return null;
		}

		return {
			type: 'sequence' as const,
			fileName,
			nodePath,
			fieldKey: field.fieldKey,
			schema: sequence.controls.schema,
			segmentIndex: selection.segmentIndex,
			currentEasing:
				sequencePropStatus.easing[selection.segmentIndex] ?? 'linear',
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
		!canEditEasingForInterpolationFunction(
			effectPropStatus.interpolationFunction,
		)
	) {
		return null;
	}

	return {
		type: 'effect' as const,
		fileName,
		nodePath,
		effectIndex: field.effectIndex,
		fieldKey: field.fieldKey,
		schema: effect.schema,
		segmentIndex: selection.segmentIndex,
		currentEasing: effectPropStatus.easing[selection.segmentIndex] ?? 'linear',
	};
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

	const updates = easingSelections
		.map((selection) =>
			getSelectedEasingUpdate({
				selection,
				sequences,
				overrideIdsToNodePaths,
				propStatuses,
			}),
		)
		.filter((update): update is NonNullable<typeof update> => update !== null);

	if (updates.length === 0) {
		return null;
	}

	return Promise.all(
		updates.map((update) => {
			const settings = {
				type: 'easing' as const,
				segmentIndex: update.segmentIndex,
				easing,
			};

			if (update.type === 'sequence') {
				return callUpdateSequenceKeyframeSettings({
					fileName: update.fileName,
					nodePath: update.nodePath,
					fieldKey: update.fieldKey,
					settings,
					schema: update.schema,
					setPropStatuses,
					clientId,
				});
			}

			return callUpdateEffectKeyframeSettings({
				fileName: update.fileName,
				nodePath: update.nodePath,
				effectIndex: update.effectIndex,
				fieldKey: update.fieldKey,
				settings,
				schema: update.schema,
				setPropStatuses,
				clientId,
			});
		}),
	).then(() => undefined);
};
