import {getStylePropertyLonghandKeys} from '@remotion/studio-shared';
import type {
	InteractivitySchema,
	InteractivitySchemaField,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import type {SaveSequencePropChange} from './save-sequence-prop';

const isVisibleFieldSchema = (
	fieldSchema: InteractivitySchemaField | undefined,
): fieldSchema is Exclude<InteractivitySchemaField, {type: 'hidden'}> =>
	fieldSchema !== undefined && fieldSchema.type !== 'hidden';

const getDefaultValue = (
	fieldSchema: Exclude<InteractivitySchemaField, {type: 'hidden'}>,
) =>
	fieldSchema.default !== undefined
		? JSON.stringify(fieldSchema.default)
		: null;

export const getSequencePropResetChanges = ({
	fileName,
	nodePath,
	fieldKey,
	value,
	defaultValue,
	schema,
}: {
	readonly fileName: string;
	readonly nodePath: SequencePropsSubscriptionKey;
	readonly fieldKey: string;
	readonly value: unknown;
	readonly defaultValue: string | null;
	readonly schema: InteractivitySchema;
}): SaveSequencePropChange[] => {
	const flatSchema = Internals.getFlatSchemaWithAllKeys(schema);
	const longhandChanges = getStylePropertyLonghandKeys(fieldKey).flatMap(
		(longhandKey): SaveSequencePropChange[] => {
			const fieldSchema = flatSchema[longhandKey];
			if (!isVisibleFieldSchema(fieldSchema)) {
				return [];
			}

			return [
				{
					fileName,
					nodePath,
					fieldKey: longhandKey,
					value: fieldSchema.default,
					defaultValue: getDefaultValue(fieldSchema),
					schema,
				},
			];
		},
	);

	return [
		{fileName, nodePath, fieldKey, value, defaultValue, schema},
		...longhandChanges,
	];
};
