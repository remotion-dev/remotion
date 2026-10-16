import type {SequencePropsSubscriptionKey} from 'remotion';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {unwrapNode} from '../unwrap-node-api';

export const getSequenceUnwrapMenuItem = async ({
	canEditSource,
	compositionId,
	isTransition,
	nodePath,
}: {
	readonly canEditSource: boolean;
	readonly compositionId: string | null;
	readonly isTransition: boolean;
	readonly nodePath: SequencePropsSubscriptionKey | null;
}): Promise<ComboboxValue | null> => {
	if (
		!canEditSource ||
		compositionId === null ||
		isTransition ||
		nodePath === null
	) {
		return null;
	}

	const request = {
		fileName: nodePath.absolutePath,
		compositionId,
		nodePath: nodePath.nodePath,
	};
	try {
		const result = await unwrapNode({...request, dryRun: true});
		if (!result.success || !result.canUnwrap) {
			return null;
		}
	} catch {
		return null;
	}

	return {
		type: 'item',
		id: 'unwrap-sequence',
		label: 'Unwrap',
		value: 'unwrap-sequence',
		keyHint: null,
		leftItem: null,
		quickSwitcherLabel: null,
		subMenu: null,
		disabled: false,
		onClick: () => {
			unwrapNode({...request, dryRun: false})
				.then((result) => {
					if (!result.success) {
						showNotification(result.reason, 4000);
					}
				})
				.catch((error: Error) => showNotification(error.message, 4000));
		},
	};
};
