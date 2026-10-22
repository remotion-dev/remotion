import type {SequencePropsSubscriptionKey} from 'remotion';
import type {SetSelectedModalContextType} from '../../state/modals';
import {unwrapNode} from '../unwrap-node-api';

export const unwrapSequenceFromSource = async ({
	compositionId,
	displayName,
	nodePath,
	sourceLocation,
	setSelectedModal,
}: {
	readonly compositionId: string;
	readonly displayName: string | null;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly sourceLocation: {readonly source: string; readonly line: number};
	readonly setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}): Promise<void> => {
	const request = {
		fileName: nodePath.absolutePath,
		compositionId,
		nodePath: nodePath.nodePath,
	};
	const eligibility = await unwrapNode({...request, dryRun: true});
	if (!eligibility.success) {
		throw new Error(eligibility.reason);
	}

	if (!eligibility.canUnwrap) {
		setSelectedModal({
			type: 'unwrap-refactor',
			displayName,
			location: sourceLocation,
		});
		return;
	}

	const result = await unwrapNode({...request, dryRun: false});
	if (!result.success) {
		throw new Error(result.reason);
	}
};
