import {hasSequenceTimingTraits} from '@remotion/studio-shared';
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

export const splitTimelineSequenceFromSource = ({
	nodePathInfo,
	splitFrame,
}: {
	nodePathInfo: SequenceNodePathInfo;
	splitFrame: number;
}): Promise<boolean> => {
	return splitTimelineSequencesFromSource({
		sequences: [{nodePathInfo, splitFrame}],
	});
};

export const splitTimelineSequencesFromSource = ({
	sequences,
}: {
	sequences: Array<{
		nodePathInfo: SequenceNodePathInfo;
		splitFrame: number;
	}>;
}): Promise<boolean> => {
	return splitJsxSequence({
		sequences: sequences.map(({nodePathInfo, splitFrame}) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			return {
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
				sequenceKeys: nodePath.sequenceKeys,
				splitFrame,
			};
		}),
	})
		.then((result) => {
			if (result.success) {
				return true;
			}

			showNotification(result.reason, 4000);
			return false;
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return false;
		});
};

export const splitSelectedTimelineItems = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	propStatuses,
	splitFrame,
	splitSequences = splitTimelineSequencesFromSource,
	notify = showNotification,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	propStatuses: PropStatuses | undefined;
	splitFrame: number;
	splitSequences?: (options: {
		sequences: Array<{
			nodePathInfo: SequenceNodePathInfo;
			splitFrame: number;
		}>;
	}) => Promise<boolean>;
	notify?: (message: string, durationInMs: number) => void;
}): Promise<boolean> | null => {
	if (
		selections.length === 0 ||
		selections.some((selection) => selection.type !== 'sequence')
	) {
		return null;
	}

	const eligible: Array<{
		nodePathInfo: SequenceNodePathInfo;
		splitFrame: number;
	}> = [];
	const skippedReasons: string[] = [];
	for (const selection of selections) {
		if (selection.type !== 'sequence') {
			continue;
		}

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
			eligible.push({
				nodePathInfo: eligibility.nodePathInfo,
				splitFrame: track
					? (splitFrame - track.keyframeDisplayOffset) *
						track.keyframePlaybackRate
					: splitFrame,
			});
		} else {
			skippedReasons.push(eligibility.reason);
		}
	}

	if (eligible.length === 0) {
		notify(
			selections.length === 1
				? skippedReasons[0]
				: `None of the ${selections.length} selected clips can be split at the playhead`,
			4000,
		);
		return Promise.resolve(false);
	}

	return splitSequences({sequences: eligible}).then((success) => {
		if (success && skippedReasons.length > 0) {
			notify(
				`Split ${eligible.length} ${eligible.length === 1 ? 'clip' : 'clips'}. Skipped ${skippedReasons.length} ${skippedReasons.length === 1 ? 'clip' : 'clips'} that could not be split.`,
				4000,
			);
		}

		return success;
	});
};
