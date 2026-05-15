import {optimisticUpdateForCodeValues} from '@remotion/studio-shared';
import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
	SequenceSchema,
} from 'remotion';
import {callApi} from '../call-api';
import {showNotification} from '../Notifications/NotificationCenter';

type SetCodeValues = (
	nodePath: SequencePropsSubscriptionKey,
	values: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse,
) => void;

export const saveSequenceProp = ({
	fileName,
	nodePath,
	fieldKey,
	value,
	defaultValue,
	schema,
	setCodeValues,
}: {
	fileName: string;
	nodePath: SequencePropsSubscriptionKey;
	fieldKey: string;
	value: unknown;
	defaultValue: string | null;
	schema: SequenceSchema;
	setCodeValues: SetCodeValues;
}): Promise<void> => {
	let previousUpdate: CanUpdateSequencePropsResponse | undefined;

	setCodeValues(nodePath, (prev) => {
		previousUpdate = prev;
		return optimisticUpdateForCodeValues({
			previous: prev,
			fieldKey,
			value,
			schema,
		});
	});

	return callApi('/api/save-sequence-props', {
		fileName,
		nodePath,
		key: fieldKey,
		value: JSON.stringify(value),
		defaultValue,
		schema,
	})
		.then((data) => {
			setCodeValues(nodePath, (prev) => {
				if (!data.canUpdate) {
					return data;
				}

				return {
					canUpdate: true,
					props: data.props,
					effects: prev.canUpdate ? prev.effects : [],
				};
			});
		})
		.catch((err) => {
			setCodeValues(nodePath, (current) => {
				if (previousUpdate) {
					return previousUpdate;
				}

				return current;
			});
			showNotification(
				`Could not save sequence prop: ${
					err instanceof Error ? err.message : String(err)
				}`,
				4000,
			);
		});
};
