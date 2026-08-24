import {canUseEffectOperations} from '../../helpers/browser-studio-operations';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import type {ConfirmationDialogFunction} from '../ConfirmationDialog-types';
import {duplicateJsxNode} from '../duplicate-jsx-node-api';
import {duplicateEffects} from '../effect-operations-api';
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
	return duplicateJsxNode({
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
				}
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

export const isDuplicatableEffectSelection = (
	selection: TimelineSelection,
): selection is TimelineSelection & {
	type: 'sequence-effect';
} => selection.type === 'sequence-effect';

const duplicateEffectsFromSource = (
	effects: readonly (TimelineSelection & {type: 'sequence-effect'})[],
): Promise<void> => {
	return duplicateEffects(
		effects.map((effect) => {
			const nodePath = effect.nodePathInfo.sequenceSubscriptionKey;

			return {
				fileName: nodePath.absolutePath,
				sequenceNodePath: nodePath,
				effectIndex: effect.i,
			};
		}),
	)
		.then((result) => {
			if (!result.success) {
				showNotification(result.reason, 4000);
			}
		})
		.catch((err) => {
			showNotification((err as Error).message, 4000);
		});
};

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
	if (sequenceSelections.length > 0) {
		return duplicateSequencesFromSource(
			sequenceSelections.map((selection) => selection.nodePathInfo),
			confirm,
		);
	}

	const effectSelections = selections.filter(isDuplicatableEffectSelection);
	if (effectSelections.length === 0 || !canUseEffectOperations()) {
		return null;
	}

	return duplicateEffectsFromSource(effectSelections);
};
