import type {OverrideIdToNodePaths, TSequence} from 'remotion';
import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';
import {deleteSelectedKeyframe} from './delete-selected-keyframe';
import type {SetCodeValues} from './save-sequence-prop';
import type {TimelineSelection} from './TimelineSelection';

const deleteSequence = (nodePathInfo: SequenceNodePathInfo): Promise<void> => {
	const nodePath = nodePathInfo.sequenceSubscriptionKey;

	if (nodePathInfo.numberOfSequencesWithThisNodePath > 1) {
		const message =
			'This sequence is programmatically duplicated ' +
			nodePathInfo.numberOfSequencesWithThisNodePath +
			' times in the code. Deleting removes all instances. Continue?';
		// eslint-disable-next-line no-alert -- native confirm before deleting all instances of a duplicated sequence
		if (!window.confirm(message)) {
			return Promise.resolve();
		}
	}

	return callApi('/api/delete-jsx-node', {
		fileName: nodePath.absolutePath,
		nodePath: nodePath.nodePath,
	})
		.then((result) => {
			if (result.success) {
				showNotification('Removed sequence from source file', 2000);
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

	const {nodePathInfo} = selection;
	const {auxiliaryKeys} = nodePathInfo;

	// The sequence track row itself has no auxiliary keys.
	if (auxiliaryKeys.length === 0) {
		return deleteSequence(nodePathInfo);
	}

	// An effect group row is ['effects', effectIndex].
	if (auxiliaryKeys.length === 2 && auxiliaryKeys[0] === 'effects') {
		const effectIndex = Number(auxiliaryKeys[1]);
		if (!Number.isInteger(effectIndex) || effectIndex < 0) {
			return null;
		}

		return deleteEffect(nodePathInfo, effectIndex);
	}

	// Field rows and other intermediate rows are not deletable on their own.
	return null;
};
