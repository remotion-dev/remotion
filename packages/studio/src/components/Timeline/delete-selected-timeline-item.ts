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

const deleteEffect = (
	nodePathInfo: SequenceNodePathInfo,
	effectIndex: number,
): Promise<void> => {
	const nodePath = nodePathInfo.sequenceSubscriptionKey;

	return callApi('/api/delete-effect', {
		fileName: nodePath.absolutePath,
		sequenceNodePath: nodePath,
		effectIndex,
	})
		.then((result) => {
			if (result.success) {
				showNotification('Removed effect from source file', 2000);
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
			return deleteEffect(selection.nodePathInfo, selection.i);
		case 'sequence-prop':
		case 'sequence-all-effects':
		case 'sequence-effect-prop':
			return null;
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
	const sequenceSelections = selections.filter(isSequenceRowSelection);
	const deletePromises = selections
		.filter((selection) => !isSequenceRowSelection(selection))
		.map((selection) =>
			deleteSelectedTimelineItem({
				selection,
				sequences,
				overrideIdsToNodePaths,
				setCodeValues,
				clientId,
			}),
		)
		.filter((promise): promise is Promise<void> => promise !== null);

	if (sequenceSelections.length > 0) {
		deletePromises.push(
			deleteSequences(
				sequenceSelections.map((selection) => selection.nodePathInfo),
			),
		);
	}

	if (deletePromises.length === 0) {
		return null;
	}

	return Promise.all(deletePromises).then(() => undefined);
};
