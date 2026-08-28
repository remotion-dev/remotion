import {
	hasSequenceTimingTraits,
	type SequenceNodePathMutation,
} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	OverrideIdToNodePaths,
	PropStatuses,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {showNotification} from '../Notifications/NotificationCenter';
import {splitJsxSequence} from '../split-jsx-sequence-api';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import type {TimelineSelection} from './TimelineSelection';

export type SplitTimelineSequenceEligibility =
	| {
			canSplit: true;
			nodePathInfo: SequenceNodePathInfo;
	  }
	| {
			canSplit: false;
			reason: string;
	  };

type SplitPropStatuses = Partial<
	Record<
		'from' | 'durationInFrames' | 'trimBefore',
		CanUpdateSequencePropStatus
	>
>;

const staticNumberish = (
	status: CanUpdateSequencePropStatus | undefined,
): boolean => {
	if (!status) {
		return true;
	}

	return (
		status.status === 'static' &&
		(typeof status.codeValue === 'number' || status.codeValue === undefined)
	);
};

export const getTimelineSequenceSplitEligibility = ({
	selection,
	sequence,
	splitFrame,
	propStatuses,
}: {
	selection: TimelineSelection;
	sequence: TSequence | null;
	splitFrame: number;
	propStatuses?: SplitPropStatuses;
}): SplitTimelineSequenceEligibility => {
	if (selection.type !== 'sequence') {
		return {
			canSplit: false,
			reason: 'Select one sequence to split',
		};
	}

	if (!sequence) {
		return {
			canSplit: false,
			reason: 'Could not find selected sequence',
		};
	}

	if (!Number.isInteger(splitFrame)) {
		return {
			canSplit: false,
			reason: 'Split frame must be an integer',
		};
	}

	if (sequence.isInsideSeries) {
		return {
			canSplit: false,
			reason: 'Series.Sequence clips cannot be split from source',
		};
	}

	if (
		!hasSequenceTimingTraits(
			selection.nodePathInfo.sequenceSubscriptionKey.sequenceKeys,
		)
	) {
		return {
			canSplit: false,
			reason: 'Sequence does not expose timing traits that can be split',
		};
	}

	const {nodePathInfo} = selection;
	if (!nodePathInfo.sequenceSubscriptionKey.nodePath) {
		return {
			canSplit: false,
			reason: 'Sequence has no editable source node',
		};
	}

	if (nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
		return {
			canSplit: false,
			reason: 'Programmatically duplicated sequences cannot be split',
		};
	}

	if (
		!staticNumberish(propStatuses?.from) ||
		!staticNumberish(propStatuses?.durationInFrames) ||
		!staticNumberish(propStatuses?.trimBefore)
	) {
		return {
			canSplit: false,
			reason: 'Sequence timing props must be static numbers',
		};
	}

	const start = sequence.from;
	const end =
		sequence.duration === Infinity
			? Infinity
			: sequence.from + sequence.duration;

	if (splitFrame <= start) {
		return {
			canSplit: false,
			reason: 'Cannot split at the sequence start',
		};
	}

	if (splitFrame >= end) {
		return {
			canSplit: false,
			reason: 'Cannot split at the sequence end',
		};
	}

	return {
		canSplit: true,
		nodePathInfo,
	};
};

export const splitTimelineSequencesFromSource = ({
	nodePathInfos,
	splitFrame,
}: {
	nodePathInfos: SequenceNodePathInfo[];
	splitFrame: number;
}): Promise<SequenceNodePathMutation | null> => {
	return splitJsxSequence({
		sequences: nodePathInfos.map(({sequenceSubscriptionKey}) => ({
			fileName: sequenceSubscriptionKey.absolutePath,
			nodePath: sequenceSubscriptionKey.nodePath,
			sequenceKeys: sequenceSubscriptionKey.sequenceKeys,
		})),
		splitFrame,
	})
		.then((result) => {
			if (result.success) {
				return result.nodePathMutation;
			}

			showNotification(result.reason, 4000);
			return null;
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return null;
		});
};

export const splitTimelineSequenceFromSource = ({
	nodePathInfo,
	splitFrame,
}: {
	nodePathInfo: SequenceNodePathInfo;
	splitFrame: number;
}): Promise<SequenceNodePathMutation | null> =>
	splitTimelineSequencesFromSource({nodePathInfos: [nodePathInfo], splitFrame});

export const shouldHandleTimelineDuplicateShortcut = ({
	shiftKey,
}: {
	readonly shiftKey: boolean;
}) => !shiftKey;

export const shouldHandleTimelineSplitShortcut = ({
	shiftKey,
}: {
	readonly shiftKey: boolean;
}) => shiftKey;

export const splitSelectedTimelineItems = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	splitFrame,
	splitSequences = splitTimelineSequencesFromSource,
	notify = showNotification,
	onSplit = () => undefined,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses | undefined;
	splitFrame: number;
	splitSequences?: (options: {
		nodePathInfos: SequenceNodePathInfo[];
		splitFrame: number;
	}) => Promise<SequenceNodePathMutation | null>;
	notify?: (content: string, durationInMs: number) => unknown;
	onSplit?: (selections: readonly TimelineSelection[]) => void;
}): Promise<boolean> | null => {
	if (selections.length === 0) {
		return null;
	}

	const sequenceSelections = selections.filter(
		(selection): selection is Extract<TimelineSelection, {type: 'sequence'}> =>
			selection.type === 'sequence',
	);
	if (sequenceSelections.length === 0) {
		return null;
	}

	const eligible: SequenceNodePathInfo[] = [];
	const skippedReasons: string[] = [];
	for (const selection of sequenceSelections) {
		const track = findTrackForNodePathInfo({
			sequences,
			overrideIdsToNodePaths,
			nodePathInfo: selection.nodePathInfo,
		});
		const sequencePropStatuses = propStatuses
			? Internals.getPropStatusesCtx(
					propStatuses,
					selection.nodePathInfo.sequenceSubscriptionKey,
				)
			: undefined;
		const eligibility = getTimelineSequenceSplitEligibility({
			selection,
			sequence: track?.sequence ?? null,
			splitFrame,
			propStatuses: sequencePropStatuses,
		});

		if (eligibility.canSplit) {
			eligible.push(eligibility.nodePathInfo);
		} else {
			skippedReasons.push(eligibility.reason);
		}
	}

	if (eligible.length === 0) {
		const uniqueReasons = [...new Set(skippedReasons)];
		notify(
			uniqueReasons.length === 1
				? uniqueReasons[0]
				: `Could not split ${skippedReasons.length} selected clips`,
			4000,
		);
		return Promise.resolve(false);
	}

	if (skippedReasons.length > 0) {
		notify(
			`Skipped ${skippedReasons.length} selected clip${skippedReasons.length === 1 ? '' : 's'} that cannot be split`,
			4000,
		);
	}

	return splitSequences({nodePathInfos: eligible, splitFrame}).then(
		(mutation) => {
			if (mutation === null) {
				return false;
			}

			const remappedSelections = selections.flatMap(
				(selection): TimelineSelection[] => {
					if (selection.type !== 'sequence') {
						return [selection];
					}

					const {sequenceSubscriptionKey} = selection.nodePathInfo;
					const fileMutation = mutation.files.find(
						(file) =>
							file.absolutePath === sequenceSubscriptionKey.absolutePath,
					);
					const remapping = fileMutation?.remappings.find(
						(item) =>
							JSON.stringify(item.oldNodePath) ===
							JSON.stringify(sequenceSubscriptionKey.nodePath),
					);
					if (!remapping) {
						return [selection];
					}

					if (remapping.newNodePath === null) {
						return [];
					}

					return [
						{
							...selection,
							nodePathInfo: {
								...selection.nodePathInfo,
								sequenceSubscriptionKey: {
									...sequenceSubscriptionKey,
									nodePath: remapping.newNodePath,
								},
							},
						},
					];
				},
			);
			onSplit(remappedSelections);
			return true;
		},
	);
};
