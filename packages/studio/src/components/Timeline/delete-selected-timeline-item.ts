import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {deleteSelectedKeyframe} from './delete-selected-keyframe';
import type {SetCodeValues} from './save-sequence-prop';
import type {TimelineSelection} from './TimelineSelection';

const confirmDeletingDuplicatedSequences = (
	nodePathInfos: SequenceNodePathInfo[],
): boolean => {
	const duplicatedNodePathInfos = nodePathInfos.filter(
		(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath > 1,
	);
	if (duplicatedNodePathInfos.length === 0) {
		return true;
	}

	if (duplicatedNodePathInfos.length === 1) {
		const [nodePathInfo] = duplicatedNodePathInfos;
		const singleDuplicatedSequenceMessage =
			'This sequence is programmatically duplicated ' +
			nodePathInfo.numberOfSequencesWithThisNodePath +
			' times in the code. Deleting removes all instances. Continue?';
		// eslint-disable-next-line no-alert -- native confirm before deleting all instances of a duplicated sequence
		return window.confirm(singleDuplicatedSequenceMessage);
	}

	const multipleDuplicatedSequencesMessage =
		duplicatedNodePathInfos.length +
		' selected sequences are programmatically duplicated in the code. Deleting removes all instances. Continue?';
	// eslint-disable-next-line no-alert -- native confirm before deleting all instances of duplicated sequences
	return window.confirm(multipleDuplicatedSequencesMessage);
};

const deleteSequences = (
	nodePathInfos: SequenceNodePathInfo[],
): Promise<void> => {
	if (!confirmDeletingDuplicatedSequences(nodePathInfos)) {
		return Promise.resolve();
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
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};

const deleteEffects = (
	effects: {
		nodePathInfo: SequenceNodePathInfo;
		effectIndex: number | null;
	}[],
): Promise<void> => {
	if (effects.length === 0) {
		return Promise.resolve();
	}

	return callApi(
		'/api/delete-effect',
		effects.map(({nodePathInfo, effectIndex}) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;
			return {
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				effectIndex,
			};
		}),
	)
		.then((result) => {
			if (result.success) {
				const singleEffect = effects[0];
				showNotification(
					effects.length === 1 && singleEffect?.effectIndex !== null
						? 'Removed effect from source file'
						: effects.length === 1
							? 'Removed effects from source file'
							: 'Removed effects from source files',
					2000,
				);
			} else {
				showNotification(result.reason, 4000);
			}
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};

export const deleteSelectedTimelineItem = ({
	selection,
	sequences,
	overrideIdsToNodePaths,
	setCodeValues,
	clientId,
}: {
	selection: TimelineSelection;
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> | null => {
	if (selection.type === 'keyframe') {
		return deleteSelectedKeyframe({
			nodePathInfo: selection.nodePathInfo,
			frame: selection.frame,
			sequences,
			overrideIdsToNodePaths,
			setCodeValues,
			clientId,
		});
	}

	switch (selection.type) {
		case 'sequence':
			return deleteSequences([selection.nodePathInfo]);
		case 'sequence-effect':
			return deleteEffects([
				{nodePathInfo: selection.nodePathInfo, effectIndex: selection.i},
			]);
		case 'sequence-prop':
		case 'sequence-effect-prop':
			return null;
		case 'sequence-all-effects':
			return deleteEffects([
				{nodePathInfo: selection.nodePathInfo, effectIndex: null},
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
	setCodeValues,
	clientId,
}: {
	selections: readonly TimelineSelection[];
	sequences: TSequence[];
	overrideIdsToNodePaths: OverrideIdToNodePaths;
	setCodeValues: SetCodeValues;
	clientId: string;
}): Promise<void> | null => {
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
			);
		case 'sequence-effect':
			return deleteEffects(
				selections.filter(isSequenceEffectSelection).map((selection) => ({
					nodePathInfo: selection.nodePathInfo,
					effectIndex: selection.i,
				})),
			);
		case 'keyframe': {
			const deletePromises = selections
				.filter(isKeyframeSelection)
				.map((selection) =>
					deleteSelectedKeyframe({
						nodePathInfo: selection.nodePathInfo,
						frame: selection.frame,
						sequences,
						overrideIdsToNodePaths,
						setCodeValues,
						clientId,
					}),
				)
				.filter((promise): promise is Promise<void> => promise !== null);

			if (deletePromises.length === 0) {
				return null;
			}

			return Promise.all(deletePromises).then(() => undefined);
		}

		case 'sequence-prop':
		case 'sequence-effect-prop':
			return null;
		case 'sequence-all-effects':
			return deleteEffects(
				selections.filter(isSequenceAllEffectsSelection).map((selection) => ({
					nodePathInfo: selection.nodePathInfo,
					effectIndex: null,
				})),
			);
		default:
			throw new Error(
				`Unexpected timeline selection type: ${firstSelection satisfies never}`,
			);
	}
};
