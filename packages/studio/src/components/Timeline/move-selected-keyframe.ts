import {stringifySequenceSubscriptionKey} from '@remotion/studio-shared';
import type {
	CodeValues,
	OverrideIdToNodePaths,
	TSequence,
	CanUpdateSequencePropStatus,
	SequenceSchema,
} from 'remotion';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {timelineNodePathInfoToKey} from '../../helpers/timeline-node-path-key';
import type {
	MoveEffectKeyframeChange,
	MoveSequenceKeyframeChange,
} from './call-move-keyframe';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {parseKeyframeFieldFromNodePath} from './parse-keyframe-field-from-node-path';
import type {TimelineSelection} from './TimelineSelection';

export type TimelineKeyframeMoveTarget =
	| {
			type: 'sequence';
			fileName: string;
			fieldKey: string;
			initialDisplayFrame: number;
			initialSourceFrame: number;
			nodePathInfo: SequenceNodePathInfo;
			nodePath: SequenceNodePathInfo['sequenceSubscriptionKey'];
			schema: SequenceSchema;
			sourceFrames: readonly number[];
	  }
	| {
			type: 'effect';
			effectIndex: number;
			fileName: string;
			fieldKey: string;
			initialDisplayFrame: number;
			initialSourceFrame: number;
			nodePathInfo: SequenceNodePathInfo;
			nodePath: SequenceNodePathInfo['sequenceSubscriptionKey'];
			schema: SequenceSchema;
			sourceFrames: readonly number[];
	  };

const getKeyframeSelectionKey = ({
	nodePathInfo,
	frame,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
}) => `${timelineNodePathInfoToKey(nodePathInfo)}.keyframe.${frame}`;

const getKeyframedSourceFrames = (
	status: CanUpdateSequencePropStatus | undefined,
): readonly number[] | null => {
	if (status?.status !== 'keyframed') {
		return null;
	}

	return status.keyframes.map((keyframe) => keyframe.frame);
};

const getTargetForKeyframe = ({
	nodePathInfo,
	frame,
	sequences,
	overrideIdsToNodePaths,
	codeValues,
}: {
	nodePathInfo: SequenceNodePathInfo;
	frame: number;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	codeValues: CodeValues;
}): TimelineKeyframeMoveTarget | null => {
	const field = parseKeyframeFieldFromNodePath(nodePathInfo.auxiliaryKeys);
	if (field === null) {
		return null;
	}

	const track = findTrackForNodePathInfo({
		sequences,
		overrideIdsToNodePaths,
		nodePathInfo,
	});
	const sequence = track?.sequence ?? null;
	if (!sequence?.controls) {
		return null;
	}

	const sourceFrame = frame - (track?.keyframeDisplayOffset ?? 0);
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	const fileName = nodePath.absolutePath;
	const codeValue = Internals.getCodeValuesCtx(codeValues, nodePath);
	if (!codeValue) {
		return null;
	}

	if (field.type === 'effect') {
		const effect = sequence.effects[field.effectIndex];
		if (!effect) {
			return null;
		}

		const effectStatus = Internals.getEffectCodeValuesCtx({
			codeValues,
			nodePath,
			effectIndex: field.effectIndex,
		});
		const effectSourceFrames =
			effectStatus.type === 'can-update-effect'
				? getKeyframedSourceFrames(effectStatus.props?.[field.fieldKey])
				: null;
		if (!effectSourceFrames?.includes(sourceFrame)) {
			return null;
		}

		return {
			type: 'effect',
			fileName,
			nodePath,
			nodePathInfo,
			effectIndex: field.effectIndex,
			fieldKey: field.fieldKey,
			initialDisplayFrame: frame,
			initialSourceFrame: sourceFrame,
			schema: effect.schema,
			sourceFrames: effectSourceFrames,
		};
	}

	const sequenceSourceFrames = getKeyframedSourceFrames(
		codeValue[field.fieldKey],
	);
	if (!sequenceSourceFrames?.includes(sourceFrame)) {
		return null;
	}

	return {
		type: 'sequence',
		fileName,
		nodePath,
		nodePathInfo,
		fieldKey: field.fieldKey,
		initialDisplayFrame: frame,
		initialSourceFrame: sourceFrame,
		schema: sequence.controls.schema,
		sourceFrames: sequenceSourceFrames,
	};
};

export const getTimelineKeyframeMoveTargets = ({
	draggedNodePathInfo,
	draggedFrame,
	selectedItems,
	sequences,
	overrideIdsToNodePaths,
	codeValues,
}: {
	draggedNodePathInfo: SequenceNodePathInfo;
	draggedFrame: number;
	selectedItems: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	codeValues: CodeValues;
}): TimelineKeyframeMoveTarget[] | null => {
	const draggedSelectionKey = getKeyframeSelectionKey({
		nodePathInfo: draggedNodePathInfo,
		frame: draggedFrame,
	});
	const selectedKeyframes = selectedItems.filter(
		(item): item is TimelineSelection & {type: 'keyframe'} =>
			item.type === 'keyframe',
	);
	const draggedItemIsSelected = selectedKeyframes.some(
		(item) =>
			getKeyframeSelectionKey({
				nodePathInfo: item.nodePathInfo,
				frame: item.frame,
			}) === draggedSelectionKey,
	);

	if (
		draggedItemIsSelected &&
		selectedKeyframes.length !== selectedItems.length
	) {
		return null;
	}

	const targetSelections =
		draggedItemIsSelected && selectedKeyframes.length > 1
			? selectedKeyframes
			: [
					{
						type: 'keyframe' as const,
						nodePathInfo: draggedNodePathInfo,
						frame: draggedFrame,
					},
				];

	const targets = new Map<string, TimelineKeyframeMoveTarget>();
	for (const selection of targetSelections) {
		const target = getTargetForKeyframe({
			nodePathInfo: selection.nodePathInfo,
			frame: selection.frame,
			sequences,
			overrideIdsToNodePaths,
			codeValues,
		});
		if (target === null) {
			return null;
		}

		const key = `${timelineNodePathInfoToKey(target.nodePathInfo)}.${target.initialDisplayFrame}`;
		targets.set(key, target);
	}

	return [...targets.values()];
};

export const getTimelineKeyframeMoveDelta = ({
	targets,
	deltaFrames,
	durationInFrames,
}: {
	targets: readonly TimelineKeyframeMoveTarget[];
	deltaFrames: number;
	durationInFrames: number;
}): number => {
	if (targets.length === 0) {
		return 0;
	}

	const minDelta = Math.max(
		...targets.map((target) => -target.initialDisplayFrame),
	);
	const maxDelta = Math.min(
		...targets.map(
			(target) => durationInFrames - 1 - target.initialDisplayFrame,
		),
	);

	return Math.max(minDelta, Math.min(maxDelta, deltaFrames));
};

const hasCollision = ({
	target,
	toSourceFrame,
	targets,
}: {
	target: TimelineKeyframeMoveTarget;
	toSourceFrame: number;
	targets: readonly TimelineKeyframeMoveTarget[];
}) => {
	const movingFramesForSameField = targets
		.filter((candidate) => {
			if (candidate.type !== target.type) {
				return false;
			}

			if (
				stringifySequenceSubscriptionKey(candidate.nodePath) !==
				stringifySequenceSubscriptionKey(target.nodePath)
			) {
				return false;
			}

			if (candidate.fieldKey !== target.fieldKey) {
				return false;
			}

			if (target.type === 'sequence') {
				return true;
			}

			return (
				candidate.type === 'effect' &&
				candidate.effectIndex === target.effectIndex
			);
		})
		.map((candidate) => candidate.initialSourceFrame);

	return (
		target.sourceFrames.includes(toSourceFrame) &&
		!movingFramesForSameField.includes(toSourceFrame)
	);
};

export const sortTimelineKeyframeMoveChangesForApplication = <
	T extends {
		fieldKey: string;
		fromFrame: number;
		toFrame: number;
		effectIndex?: number;
	},
>(
	keyframes: T[],
): T[] => {
	return [...keyframes].sort((a, b) => {
		if (a.fieldKey !== b.fieldKey || a.effectIndex !== b.effectIndex) {
			return 0;
		}

		const delta = a.toFrame - a.fromFrame;
		if (delta > 0) {
			return b.fromFrame - a.fromFrame;
		}

		if (delta < 0) {
			return a.fromFrame - b.fromFrame;
		}

		return 0;
	});
};

export const getTimelineKeyframeMoveChanges = ({
	targets,
	deltaFrames,
	durationInFrames,
}: {
	targets: readonly TimelineKeyframeMoveTarget[];
	deltaFrames: number;
	durationInFrames: number;
}): {
	sequenceKeyframes: MoveSequenceKeyframeChange[];
	effectKeyframes: MoveEffectKeyframeChange[];
	appliedDeltaFrames: number;
} | null => {
	const appliedDeltaFrames = getTimelineKeyframeMoveDelta({
		targets,
		deltaFrames,
		durationInFrames,
	});
	if (appliedDeltaFrames === 0) {
		return {
			sequenceKeyframes: [],
			effectKeyframes: [],
			appliedDeltaFrames,
		};
	}

	const sequenceKeyframes: MoveSequenceKeyframeChange[] = [];
	const effectKeyframes: MoveEffectKeyframeChange[] = [];
	for (const target of targets) {
		const toSourceFrame = target.initialSourceFrame + appliedDeltaFrames;
		if (hasCollision({target, toSourceFrame, targets})) {
			return null;
		}

		if (target.type === 'effect') {
			effectKeyframes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				effectIndex: target.effectIndex,
				fieldKey: target.fieldKey,
				fromFrame: target.initialSourceFrame,
				toFrame: toSourceFrame,
				schema: target.schema,
			});
		} else {
			sequenceKeyframes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: target.fieldKey,
				fromFrame: target.initialSourceFrame,
				toFrame: toSourceFrame,
				schema: target.schema,
			});
		}
	}

	return {sequenceKeyframes, effectKeyframes, appliedDeltaFrames};
};

export const getTimelineKeyframeMovePreviewChanges = ({
	targets,
	fromDeltaFrames,
	toDeltaFrames,
	durationInFrames,
}: {
	targets: readonly TimelineKeyframeMoveTarget[];
	fromDeltaFrames: number;
	toDeltaFrames: number;
	durationInFrames: number;
}): {
	sequenceKeyframes: MoveSequenceKeyframeChange[];
	effectKeyframes: MoveEffectKeyframeChange[];
	appliedDeltaFrames: number;
} | null => {
	const appliedDeltaFrames = getTimelineKeyframeMoveDelta({
		targets,
		deltaFrames: toDeltaFrames,
		durationInFrames,
	});
	if (appliedDeltaFrames === fromDeltaFrames) {
		return {
			sequenceKeyframes: [],
			effectKeyframes: [],
			appliedDeltaFrames,
		};
	}

	const sequenceKeyframes: MoveSequenceKeyframeChange[] = [];
	const effectKeyframes: MoveEffectKeyframeChange[] = [];
	for (const target of targets) {
		const toSourceFrame = target.initialSourceFrame + appliedDeltaFrames;
		if (hasCollision({target, toSourceFrame, targets})) {
			return null;
		}

		const fromFrame = target.initialSourceFrame + fromDeltaFrames;
		if (target.type === 'effect') {
			effectKeyframes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				effectIndex: target.effectIndex,
				fieldKey: target.fieldKey,
				fromFrame,
				toFrame: toSourceFrame,
				schema: target.schema,
			});
		} else {
			sequenceKeyframes.push({
				fileName: target.fileName,
				nodePath: target.nodePath,
				fieldKey: target.fieldKey,
				fromFrame,
				toFrame: toSourceFrame,
				schema: target.schema,
			});
		}
	}

	return {sequenceKeyframes, effectKeyframes, appliedDeltaFrames};
};
