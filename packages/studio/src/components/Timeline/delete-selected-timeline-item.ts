import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	deleteSelectedKeyframe,
	deleteSelectedKeyframes,
} from './delete-selected-keyframe';
import type {SetPropStatuses} from './save-sequence-prop';
import type {TimelineSelection} from './TimelineSelection';

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

const deleteSequences = async (
	nodePathInfos: SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<boolean> => {
	if (!(await confirmDeletingDuplicatedSequences(nodePathInfos, confirm))) {
		return false;
	}

	return callApi('/api/delete-jsx-node', {
		nodes: nodePathInfos.map((nodePathInfo) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;

			return {
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
			};
		}),
	})
		.then((result) => {
			if (result.success) {
				showNotification(
					nodePathInfos.length === 1
						? 'Removed sequence from source file'
						: 'Removed sequences from source files',
					2000,
				);
			} else {
				showNotification(result.reason, 4000);
			}

			return true;
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return true;
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

	return callApi(
		'/api/delete-effect',
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
				const singleEffect = effects[0];
				showNotification(
					effects.length === 1 && singleEffect?.type === 'single-effect'
						? 'Removed effect from source file'
						: effects.length === 1
							? 'Removed effects from source file'
							: 'Removed effects from source files',
					2000,
				);
			} else {
				showNotification(result.reason, 4000);
			}

			return true;
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
			return true;
		});
};

export const deleteSelectedTimelineItem = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
	confirm,
}: {
	selection: TimelineSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
	clientId: string;
	confirm: ConfirmationDialogFunction;
}): Promise<boolean> | null => {
	if (selection.type === 'keyframe') {
		const promise = deleteSelectedKeyframe({
			nodePathInfo: selection.nodePathInfo,
			frame: selection.frame,
			sequences,
			overrideIdsToNodePaths,
			setPropStatuses,
			clientId,
		});
		return promise?.then(() => true) ?? null;
	}

	switch (selection.type) {
		case 'sequence':
			return deleteSequences([selection.nodePathInfo], confirm);
		case 'sequence-effect':
			return deleteEffects([
				{
					type: 'single-effect',
					nodePathInfo: selection.nodePathInfo,
					effectIndex: selection.i,
				},
			]);
		case 'sequence-prop':
		case 'sequence-effect-prop':
		case 'easing':
			return null;
		case 'sequence-all-effects':
			return deleteEffects([
				{type: 'all-effects', nodePathInfo: selection.nodePathInfo},
			]);
		default:
			throw new Error(
				`Unexpected timeline selection type: ${selection satisfies never}`,
			);
	}
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

export const deleteSelectedTimelineItems = ({
	selections,
	sequences,
	overrideIdsToNodePaths,
	setPropStatuses,
	clientId,
	confirm,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setPropStatuses: SetPropStatuses;
	clientId: string;
	confirm: ConfirmationDialogFunction;
}): Promise<boolean> | null => {
	const firstSelection = selections[0];
	if (!firstSelection) {
		return null;
	}

	assertTimelineSelectionsHaveSameType(selections);

	switch (firstSelection.type) {
		case 'sequence':
			return deleteSequences(
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
		case 'keyframe': {
			const promise = deleteSelectedKeyframes({
				keyframes: selections.filter(isKeyframeSelection).map((selection) => ({
					nodePathInfo: selection.nodePathInfo,
					frame: selection.frame,
				})),
				sequences,
				overrideIdsToNodePaths,
				setPropStatuses,
				clientId,
			});
			return promise?.then(() => true) ?? null;
		}

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
