import {hasSequenceTimingTraits} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropStatus,
	PropStatuses,
	TSequence,
} from 'remotion';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {isStudioSelectionEnabled} from '../../helpers/interactivity-enabled';
import {getPreviewServerConnectionState} from '../../helpers/preview-server-events';
import {showNotification} from '../Notifications/NotificationCenter';
import {splitSequences as splitSequencesApi} from '../split-sequences-api';
import {findTrackForNodePathInfo} from './find-track-for-node-path-info';
import {
	acknowledgePendingSequenceSplit,
	beginPendingSequenceSplit,
	finishPendingSequenceSplit,
	type SplitTarget,
} from './pending-sequence-splits';
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

export const getSequenceSourceSplitFrame = ({
	timelineFrame,
	keyframeDisplayOffset,
	keyframePlaybackRate,
}: {
	readonly timelineFrame: number;
	readonly keyframeDisplayOffset: TimelineTrackData['keyframeDisplayOffset'];
	readonly keyframePlaybackRate: TimelineTrackData['keyframePlaybackRate'];
}): number => {
	return (timelineFrame - keyframeDisplayOffset) * keyframePlaybackRate;
};

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

	if (
		sequence.timelineTrack?.role === 'track' ||
		sequence.controls?.componentIdentity === 'dev.remotion.remotion.Track'
	) {
		return {
			canSplit: false,
			reason: 'Track containers cannot be split from the Studio',
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

	// `trimBefore` is both where playback starts and where the loop restarts,
	// so the right half could not resume mid-cycle.
	if (sequence.loopDisplay) {
		return {
			canSplit: false,
			reason: 'Looping sequences cannot be split',
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

export type SequenceSplitResult = {
	status: 'success' | 'already-pending' | 'ineligible' | 'error';
	reason: string | null;
	split: SequenceNodePathInfo[];
	skipped: {nodePathInfo: SequenceNodePathInfo; reason: string}[];
};

export const canSplitTimelineSequences = () =>
	isStudioSelectionEnabled() &&
	(getBrowserStudioOperations() !== null ||
		(!window.remotion_isReadOnlyStudio &&
			getPreviewServerConnectionState().type === 'connected'));

const splitFromSource = async (
	sequences: readonly SplitTarget[],
): Promise<SequenceSplitResult> => {
	const result = (
		status: SequenceSplitResult['status'],
		reason: string | null,
	): SequenceSplitResult => ({
		status,
		reason,
		split:
			status === 'success'
				? sequences.map(({nodePathInfo}) => nodePathInfo)
				: [],
		skipped: [],
	});
	if (!canSplitTimelineSequences()) {
		const reason = 'Connect to an editable Studio to split clips.';
		showNotification(reason, 4000);
		return result('error', reason);
	}

	let notification: ReturnType<typeof showNotification> | null = null;
	const operation = beginPendingSequenceSplit(sequences, () =>
		notification?.dismiss(),
	);
	if (!operation)
		return result('already-pending', 'Wait for the current split to finish.');
	notification = showNotification('Splitting…', null);
	try {
		const response = await splitSequencesApi({
			sequences: sequences.map(({nodePathInfo, splitFrame}) => {
				const nodePath = nodePathInfo.sequenceSubscriptionKey;
				return {
					fileName: nodePath.absolutePath,
					nodePath: nodePath.nodePath,
					sequenceKeys: nodePath.sequenceKeys,
					splitFrame,
					videoConfigValues: nodePath.videoConfigValues,
				};
			}),
		});
		if (!response.success) throw new Error(response.reason);
		if (
			!Array.isArray(response.splitNodes) ||
			response.splitNodes.length === 0 ||
			!response.splitNodes.every(
				(node) =>
					typeof node?.absolutePath === 'string' &&
					Array.isArray(node.nodePath),
			) ||
			!Array.isArray(response.sourceVersions)
		) {
			finishPendingSequenceSplit(operation);
			const reason =
				'The split was saved, but its preview could not be confirmed. Restart or update Studio before splitting again.';
			showNotification(reason, 5000);
			return result('error', reason);
		}

		acknowledgePendingSequenceSplit(
			operation,
			response.nodePathMutation.mutationId,
			response.splitNodes,
			response.sourceVersions,
		);
		return result('success', null);
	} catch (error) {
		finishPendingSequenceSplit(operation);
		const cause = error instanceof Error ? error.message : String(error);
		const clipLabel = sequences.length === 1 ? 'clip' : 'clips';
		const reason =
			/^(Failed to fetch|fetch failed|NetworkError when attempting to fetch resource\.?)$/i.test(
				cause,
			)
				? `Could not split ${clipLabel}. Check your connection to Studio and try again.`
				: `Could not split ${clipLabel}: ${cause}`;
		showNotification(reason, 4000);
		return result('error', reason);
	}
};

export const splitTimelineSequenceFromSource = (
	sequence: SplitTarget,
): Promise<boolean> =>
	splitFromSource([sequence]).then((result) => result.status === 'success');

export const splitTimelineSequencesFromSource = ({
	sequences,
}: {
	sequences: SplitTarget[];
}): Promise<boolean> =>
	splitFromSource(sequences).then((result) => result.status === 'success');

type SelectedSplitOptions = {
	selections: readonly TimelineSelection[];
	tracks: readonly TimelineTrackData[];
	propStatuses: PropStatuses | undefined;
	splitFrame: number;
};
const prepareSelectedSplits = (
	{selections, tracks, propStatuses, splitFrame}: SelectedSplitOptions,
	requirePropStatuses: boolean,
) => {
	const eligible: SplitTarget[] = [];
	const skipped: SequenceSplitResult['skipped'] = [];
	for (const selection of selections) {
		if (selection.type !== 'sequence') continue;
		const track = findTrackForNodePathInfo({
			tracks,
			nodePathInfo: selection.nodePathInfo,
		});
		const sequencePropStatuses = propStatuses
			? Internals.getPropStatusesCtx(
					propStatuses,
					selection.nodePathInfo.sequenceSubscriptionKey,
				)
			: undefined;
		if (requirePropStatuses && sequencePropStatuses === undefined) {
			skipped.push({
				nodePathInfo: selection.nodePathInfo,
				reason: 'Waiting for sequence prop status',
			});
			continue;
		}

		const eligibility = getTimelineSequenceSplitEligibility({
			selection,
			sequence: track?.sequence ?? null,
			splitFrame,
			propStatuses: sequencePropStatuses,
		});
		if (eligibility.canSplit && track) {
			eligible.push({
				nodePathInfo: eligibility.nodePathInfo,
				splitFrame: getSequenceSourceSplitFrame({
					timelineFrame: splitFrame,
					keyframeDisplayOffset: track.keyframeDisplayOffset,
					keyframePlaybackRate: track.keyframePlaybackRate,
				}),
				expectedDuration: splitFrame - track.sequence.from,
			});
		} else {
			skipped.push({
				nodePathInfo: selection.nodePathInfo,
				reason: eligibility.canSplit
					? 'Could not find selected sequence'
					: eligibility.reason,
			});
		}
	}

	return {eligible, skipped};
};

const partialSplitMessage = (eligible: number, skipped: number) =>
	`Split ${eligible} ${eligible === 1 ? 'clip' : 'clips'}. Skipped ${skipped} ${skipped === 1 ? 'clip' : 'clips'} that could not be split.`;

export const splitSelectedTimelineItemsWithResult = async (
	options: SelectedSplitOptions,
): Promise<SequenceSplitResult> => {
	if (
		options.selections.length === 0 ||
		options.selections.some((selection) => selection.type !== 'sequence') ||
		!Number.isInteger(options.splitFrame) ||
		options.splitFrame < 0
	) {
		const reason =
			'Select clips and an integer frame in the composition to split.';
		showNotification(reason, 4000);
		return {status: 'ineligible', reason, split: [], skipped: []};
	}

	const {eligible, skipped} = prepareSelectedSplits(options, true);
	if (eligible.length === 0) {
		const reason =
			skipped.length === 1
				? skipped[0].reason
				: `None of the ${options.selections.length} selected clips can be split at the playhead`;
		showNotification(reason, 4000);
		return {status: 'ineligible', reason, split: [], skipped};
	}

	const result = await splitFromSource(eligible);
	if (result.status === 'success' && skipped.length > 0)
		showNotification(
			partialSplitMessage(eligible.length, skipped.length),
			4000,
		);
	return {...result, skipped};
};

export const splitSelectedTimelineItems = ({
	splitSequences,
	notify = showNotification,
	...options
}: SelectedSplitOptions & {
	splitSequences?: (options: {
		sequences: {nodePathInfo: SequenceNodePathInfo; splitFrame: number}[];
	}) => Promise<boolean>;
	notify?: (message: string, durationInMs: number) => void;
}): Promise<boolean> | null => {
	if (
		options.selections.length === 0 ||
		options.selections.some((selection) => selection.type !== 'sequence')
	)
		return null;
	if (!splitSequences)
		return splitSelectedTimelineItemsWithResult(options).then(
			(result) => result.status === 'success',
		);
	const {eligible, skipped} = prepareSelectedSplits(options, false);
	if (eligible.length === 0) {
		notify(
			skipped.length === 1
				? skipped[0].reason
				: `None of the ${options.selections.length} selected clips can be split at the playhead`,
			4000,
		);
		return Promise.resolve(false);
	}

	return splitSequences({
		sequences: eligible.map(({nodePathInfo, splitFrame}) => ({
			nodePathInfo,
			splitFrame,
		})),
	}).then((success) => {
		if (success && skipped.length > 0)
			notify(partialSplitMessage(eligible.length, skipped.length), 4000);
		return success;
	});
};
