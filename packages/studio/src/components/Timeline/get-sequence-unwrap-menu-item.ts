import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import type {SetSelectedModalContextType} from '../../state/modals';
import type {ComboboxValue} from '../NewComposition/ComboBox';
import {showNotification} from '../Notifications/NotificationCenter';
import {unwrapSequenceFromSource} from './unwrap-sequence-from-source';

export const getSequenceUnwrapMenuItem = ({
	canEditSource,
	compositionId,
	isTransition,
	nodePath,
	sequence,
	sourceLocation,
	setSelectedModal,
}: {
	readonly canEditSource: boolean;
	readonly compositionId: string | null;
	readonly isTransition: boolean;
	readonly nodePath: SequencePropsSubscriptionKey | null;
	readonly sequence: TSequence;
	readonly sourceLocation: {
		readonly source: string;
		readonly line: number;
	} | null;
	readonly setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}): ComboboxValue | null => {
	if (
		!canEditSource ||
		compositionId === null ||
		isTransition ||
		nodePath === null ||
		sourceLocation === null ||
		sequence.type !== 'sequence'
	) {
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
			unwrapSequenceFromSource({
				compositionId,
				displayName:
					sequence.displayName || sequence.controls?.componentName || null,
				nodePath,
				sourceLocation,
				setSelectedModal,
			}).catch((error: Error) => showNotification(error.message, 4000));
		},
	};
};
