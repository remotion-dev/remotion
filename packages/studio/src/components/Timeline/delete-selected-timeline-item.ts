import type {OverrideIdToNodePaths, PropStatuses, TSequence} from 'remotion';
import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {deleteJsxNodes} from '../delete-jsx-nodes-api';
import {deleteEffects as deleteEffectsApi} from '../effect-operations-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {deleteSelectedKeyframes} from './delete-selected-keyframe';
import type {SetPropStatuses} from './save-sequence-prop';
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

	return deleteJsxNodes({
		nodes: nodePathInfos.map((nodePathInfo) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;

			return {
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
			};
		}),
	})
		.then((result) => {
			if (!result.success) {
				showNotification(result.reason, 4000);
			}

			return result.success;
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return false;
		});
};

const deleteEffects = (
	effects: ({
		nodePathInfo: SequenceNodePathInfo;
	} & (
		| {
				type: 'single-effect';
				effectIndex: number;
		  }
		| {
				type: 'all-effects';
		  }
	))[],
): Promise<boolean> => {
	if (effects.length === 0) {
		return Promise.resolve(false);
	}

	if (!canUseEffectOperations()) {
		return Promise.resolve(false);
	}

	return deleteEffectsApi(
		effects.map((effect) => {
			const nodePath = effect.nodePathInfo.sequenceSubscriptionKey;
			return effect.type === 'single-effect'
				? {
						type: 'single-effect',
						fileName: nodePath.absolutePath,
						sequenceNodePath: nodePath,
						effectIndex: effect.effectIndex,
					}
				: {
						type: 'all-effects',
						fileName: nodePath.absolutePath,
						sequenceNodePath: nodePath,
					};
		}),
	)
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
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
	confirm,
	propStatuses,
	timelinePosition,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
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
			sequences,
			overrideIdsToNodePaths,
			setPropStatuses,
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
			return deleteEffects(
				selections.filter(isSequenceEffectSelection).map((selection) => ({
					type: 'single-effect',
					nodePathInfo: selection.nodePathInfo,
					effectIndex: selection.i,
				})),
			);
		case 'keyframe':
		case 'sequence-prop':
		case 'sequence-effect-prop':
		case 'easing':
			return null;
		case 'sequence-all-effects':
			return deleteEffects(
				selections.filter(isSequenceAllEffectsSelection).map((selection) => ({
					type: 'all-effects',
					nodePathInfo: selection.nodePathInfo,
				})),
			);
		default:
			throw new Error(
				`Unexpected timeline selection type: ${firstSelection satisfies never}`,
			);
	}
};
