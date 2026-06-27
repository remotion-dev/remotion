import type {CanUpdateSequencePropStatus, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
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
}): Promise<void> => {
	const nodePath = nodePathInfo.sequenceSubscriptionKey;

	return callApi('/api/split-jsx-sequence', {
		fileName: nodePath.absolutePath,
		nodePath: nodePath.nodePath,
		splitFrame,
	})
		.then((result) => {
			if (result.success) {
				showNotification('Split sequence in source file', 2000);
			} else {
				showNotification(result.reason, 4000);
			}
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};
