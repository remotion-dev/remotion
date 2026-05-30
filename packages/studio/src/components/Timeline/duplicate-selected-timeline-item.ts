import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import type {TimelineSelection} from './TimelineSelection';

const confirmDuplicatingProgrammaticallyDuplicatedSequences = (
	nodePathInfos: readonly SequenceNodePathInfo[],
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
			' times in the code. Duplicating inserts another copy. Continue?';
		// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
		return window.confirm(singleDuplicatedSequenceMessage);
	}

	const multipleDuplicatedSequencesMessage =
		duplicatedNodePathInfos.length +
		' selected sequences are programmatically duplicated in the code. Duplicating inserts another copy of each. Continue?';
	// eslint-disable-next-line no-alert -- native confirm before applying duplicate codemod in .map callbacks
	return window.confirm(multipleDuplicatedSequencesMessage);
};

const duplicateSequences = (
	nodePathInfos: readonly SequenceNodePathInfo[],
): Promise<void> => {
	if (!confirmDuplicatingProgrammaticallyDuplicatedSequences(nodePathInfos)) {
		return Promise.resolve();
	}

	return Promise.all(
		nodePathInfos.map((nodePathInfo) => {
			const nodePath = nodePathInfo.sequenceSubscriptionKey;

			return callApi('/api/duplicate-jsx-node', {
				fileName: nodePath.absolutePath,
				nodePath: nodePath.nodePath,
			});
		}),
	)
		.then((results) => {
			const failedResult = results.find((result) => !result.success);
			if (failedResult) {
				showNotification(failedResult.reason, 4000);
				return;
			}

			showNotification(
				nodePathInfos.length === 1
					? 'Duplicated sequence in source file'
					: 'Duplicated sequences in source files',
				2000,
			);
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};

export const isDuplicatableSequenceRowSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'row';
} =>
	selection.type === 'row' && selection.nodePathInfo.auxiliaryKeys.length === 0;

export const duplicateSelectedTimelineItems = ({
	selections,
}: {
	selections: readonly TimelineSelection[];
}): Promise<void> | null => {
	const sequenceSelections = selections.filter(
		isDuplicatableSequenceRowSelection,
	);
	if (sequenceSelections.length === 0) {
		return null;
	}

	return duplicateSequences(
		sequenceSelections.map((selection) => selection.nodePathInfo),
	);
};
