import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {showNotification} from '../Notifications/NotificationCenter';
import type {TimelineSelection} from './TimelineSelection';

const confirmDuplicatingProgrammaticallyDuplicatedSequences = (
	nodePathInfos: readonly SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<boolean> => {
	if (nodePathInfos.length === 0) {
		return Promise.resolve(true);
	}

	if (nodePathInfos.length === 1) {
		const [nodePathInfo] = nodePathInfos;
		return confirm({
			title: 'Duplicate sequence?',
			message:
				'This sequence is programmatically duplicated ' +
				nodePathInfo.numberOfSequencesWithThisNodePath +
				' times in the code. Duplicating inserts another copy. Continue?',
			confirmLabel: 'Duplicate',
		});
	}

	return confirm({
		title: 'Duplicate sequences?',
		message:
			nodePathInfos.length +
			' selected sequences are programmatically duplicated in the code. Duplicating inserts another copy of each. Continue?',
		confirmLabel: 'Duplicate',
	});
};

const duplicateSequence = (nodePathInfo: SequenceNodePathInfo) => {
	const nodePath = nodePathInfo.sequenceSubscriptionKey;
	return callApi('/api/duplicate-jsx-node', {
		fileName: nodePath.absolutePath,
		nodePath: nodePath.nodePath,
	});
};

export const duplicateSequencesFromSource = (
	nodePathInfos: readonly SequenceNodePathInfo[],
	confirm: ConfirmationDialogFunction,
): Promise<void> => {
	const programmaticallyDuplicated = nodePathInfos.filter(
		(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath > 1,
	);
	const regular = nodePathInfos.filter(
		(nodePathInfo) => nodePathInfo.numberOfSequencesWithThisNodePath <= 1,
	);

	return confirmDuplicatingProgrammaticallyDuplicatedSequences(
		programmaticallyDuplicated,
		confirm,
	).then((shouldDuplicateProgrammaticSequences) => {
		const toDuplicate = [...regular];
		if (shouldDuplicateProgrammaticSequences) {
			toDuplicate.push(...programmaticallyDuplicated);
		}

		if (toDuplicate.length === 0) {
			return Promise.resolve();
		}

		return Promise.all(toDuplicate.map(duplicateSequence))
			.then((results) => {
				const failedResult = results.find((result) => !result.success);
				if (failedResult && !failedResult.success) {
					showNotification(failedResult.reason, 4000);
					return;
				}

				showNotification(
					toDuplicate.length === 1
						? 'Duplicated sequence in source file'
						: 'Duplicated sequences in source files',
					2000,
				);
			})
			.catch((err) => {
				showNotification((err as Error).message, 4000);
			});
	});
};

export const isDuplicatableSequenceRowSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence';
} => selection.type === 'sequence';

export const duplicateSelectedTimelineItems = ({
	selections,
	confirm,
}: {
	selections: readonly TimelineSelection[];
	confirm: ConfirmationDialogFunction;
}): Promise<void> | null => {
	const sequenceSelections = selections.filter(
		isDuplicatableSequenceRowSelection,
	);
	if (sequenceSelections.length === 0) {
		return null;
	}

	return duplicateSequencesFromSource(
		sequenceSelections.map((selection) => selection.nodePathInfo),
		confirm,
	);
};
