import type {SequencePropsSubscriptionKey} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {saveSequenceProps, type SetPropStatuses} from './save-sequence-prop';

export const disableSequenceInteractivity = ({
	clientId,
	fileName,
	nodePath,
	setPropStatuses,
}: {
	readonly clientId: string;
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly setPropStatuses: SetPropStatuses;
}): Promise<void> => {
	return saveSequenceProps({
		addedKeyframes: null,
		movedKeyframes: null,
		changes: [
			{
				fileName,
				nodePath,
				fieldKey: 'showInTimeline',
				value: false,
				defaultValue: 'true',
				schema: NoReactInternals.sequenceSchema,
			},
		],
		setPropStatuses,
		clientId,
		undoLabel: 'Disable interactivity',
		redoLabel: 'Disable interactivity again',
	});
};
