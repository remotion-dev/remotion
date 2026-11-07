import type {PropStatuses} from 'remotion';
import type {
	SequenceNodePathInfo,
	TimelineTrackData,
} from '../../helpers/get-timeline-sequence-sort-key';
import {getSourceMutationRevision} from '../../helpers/source-mutation-queue';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {deleteNodes} from '../delete-nodes-api';
import {showNotification} from '../Notifications/NotificationCenter';
import type {useDeleteKeyframes} from './call-delete-keyframe';
import {deleteEffectsFromSource} from './delete-effects-from-source';
import {deleteSelectedKeyframes} from './delete-selected-keyframe';
import type {useCurrentTimelineSelectionStateAsRef} from './TimelineSelection';
import {
	getTimelineSelectionFromNodePathInfo,
	getTimelineSelectionKey,
	type TimelineSelection,
} from './TimelineSelection';

const confirmDeletingDuplicatedSequences = (
	nodePathInfos: SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<boolean> => {
	const duplicatedNodePathInfos = nodePathInfos.filter(
		(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath > 1,
	);
	if (duplicatedNodePathInfos.length === 0) {
		return Promise.resolve(true);
	}

	if (duplicatedNodePathInfos.length === 1) {
		const [nodePathInfo] = duplicatedNodePathInfos;
		return confirm({
			title: 'Delete sequence?',
			message:
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Deleting removes all instances. Continue?',
			confirmLabel: 'Delete',
		});
	}

	return confirm({
		title: 'Delete sequences?',
		message:
			duplicatedNodePathInfos.length +
			' selected sequences are programmatically duplicated in the code. Deleting removes all instances. Continue?',
		confirmLabel: 'Delete',
	});
};

export const deleteSequencesFromSource = async (
	nodePathInfos: SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<boolean> => {
	if (!(await confirmDeletingDuplicatedSequences(nodePathInfos, confirm))) {
		return false;
	}

	const deletion = deleteNodes({
		nodes: nodePathInfos.map((nodePathInfo) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;

			return {
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
			};
		}),
	});
	const revision = getSourceMutationRevision();
	return deletion
		.then((result) => {
			if (!result.success) {
				showNotification(result.reason, 4000);
			}

			return result.success && revision === getSourceMutationRevision();
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return false;
		});
};

const isSequenceRowSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence';
} => selection.type === 'sequence';

const isSequenceEffectSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence-effect';
} => selection.type === 'sequence-effect';

const isSequenceAllEffectsSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence-all-effects';
} => selection.type === 'sequence-all-effects';

const isKeyframeSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'keyframe';
} => selection.type === 'keyframe';

const getSequenceSelectionAfterDeletingEffect = (
	selection: TimelineSelection,
): TimelineSelection | null => {
	if (
		selection.type !== 'sequence-effect' &&
		selection.type !== 'sequence-all-effects'
	) {
		return null;
	}

	return {
		type: 'sequence',
		nodePathInfo: {
			...selection.nodePathInfo,
			auxiliaryKeys: [],
		},
	};
};

export const getTimelineSelectionAfterDeletingItems = ({
	selections,
}: {
	readonly selections: readonly TimelineSelection[];
}): readonly TimelineSelection[] => {
	const nextSelections = new Map<string, TimelineSelection>();

	for (const selection of selections) {
		if (selection.type === 'easing') {
			continue;
		}

		const nextSelection =
			selection.type === 'keyframe'
				? getTimelineSelectionFromNodePathInfo(selection.nodePathInfo)
				: getSequenceSelectionAfterDeletingEffect(selection);
		if (!nextSelection) {
			return [];
		}

		nextSelections.set(getTimelineSelectionKey(nextSelection), nextSelection);
	}

	return Array.from(nextSelections.values());
};

const areSelectionsOnlyOfType = (
	selections: readonly TimelineSelection[],
	type: TimelineSelection['type'],
): boolean => selections.every((selection) => selection.type === type);

const assertTimelineSelectionsHaveSameType = (
	selections: readonly TimelineSelection[],
): void => {
	const firstSelection = selections[0];
	if (!firstSelection) {
		return;
	}

	for (const selection of selections) {
		if (selection.type !== firstSelection.type) {
			throw new Error(
				`Assertion failed: Cannot delete timeline selections of different types (${firstSelection.type}, ${selection.type})`,
			);
		}
	}
};

const containsOnlyKeyframesAndEasings = (
	selections: readonly TimelineSelection[],
): boolean =>
	selections.every(
		(selection) => selection.type === 'keyframe' || selection.type === 'easing',
	);

export const deleteSelectedTimelineItems = ({
	selections,
	tracks,
	deleteKeyframes,
	clientId,
	confirm,
	propStatuses,
	timelinePosition,
	currentSelection,
}: {
	selections: readonly TimelineSelection[];
	currentSelection: ReturnType<
		typeof useCurrentTimelineSelectionStateAsRef
	> | null;
	readonly tracks: readonly TimelineTrackData[];
	deleteKeyframes: ReturnType<typeof useDeleteKeyframes>;
	clientId: string;
	confirm: ConfirmationDialogFunction;
	propStatuses: PropStatuses;
	timelinePosition: number;
}): Promise<boolean> | null => {
	const firstSelection = selections[0];
	if (!firstSelection) {
		return null;
	}

	if (containsOnlyKeyframesAndEasings(selections)) {
		const keyframes = selections.filter(isKeyframeSelection);
		if (keyframes.length === 0) {
			return null;
		}

		const promise = deleteSelectedKeyframes({
			keyframes: keyframes.map((selection) => ({
				nodePathInfo: selection.nodePathInfo,
				frame: selection.frame,
			})),
			tracks,
			deleteKeyframes,
			clientId,
			propStatuses,
			timelinePosition,
		});
		return promise?.then(() => true) ?? null;
	}

	if (!areSelectionsOnlyOfType(selections, firstSelection.type)) {
		return null;
	}

	assertTimelineSelectionsHaveSameType(selections);

	switch (firstSelection.type) {
		case 'guide':
			return null;
		case 'sequence':
			return deleteSequencesFromSource(
				selections
					.filter(isSequenceRowSelection)
					.map((selection) => selection.nodePathInfo),
				confirm,
			);
		case 'sequence-effect':
		case 'sequence-all-effects': {
			const targets = selections
				.filter(
					(item) =>
						isSequenceEffectSelection(item) ||
						isSequenceAllEffectsSelection(item),
				)
				.flatMap((selection) => {
					const source = selection.nodePathInfo.sequenceSubscriptionKey;
					const track = tracks.find(
						(item) =>
							item.nodePathInfo?.sequenceSubscriptionKey.absolutePath ===
								source.absolutePath &&
							JSON.stringify(
								item.nodePathInfo.sequenceSubscriptionKey.nodePath,
							) === JSON.stringify(source.nodePath),
					);
					if (!track) return [];
					return [
						{
							nodePath: source,
							effects: track.sequence.effects,
							effectIndices:
								selection.type === 'sequence-effect'
									? [selection.i]
									: track.sequence.effects.map((_, index) => index),
						},
					];
				});
			return deleteEffectsFromSource(targets, currentSelection).then(
				(result) => result.status === 'success',
			);
		}

		case 'keyframe':
		case 'sequence-prop':
		case 'sequence-effect-prop':
		case 'easing':
			return null;
		default:
			throw new Error(
				`Unexpected timeline selection type: ${firstSelection satisfies never}`,
			);
	}
};
