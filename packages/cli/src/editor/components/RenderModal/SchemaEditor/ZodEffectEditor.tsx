import React, {useCallback, useMemo, useState} from 'react';
import {z} from 'remotion';
import {FAIL_COLOR} from '../../../helpers/colors';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

type LocalState = {
	value: unknown;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodEffectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: (value: unknown) => void;
}> = ({schema, jsonPath, value, setValue: updateValue}) => {
	const [localValue, setLocalValue] = useState<LocalState>({
		value,
		zodValidation: schema.safeParse(value),
	});

	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodEffects) {
		throw new Error('expected effect');
	}

	const onChange = useCallback(
		(newValue: unknown) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);

			if (safeParse.success) {
				updateValue(newValue);
			}
		},
		[schema, updateValue]
	);

	const container = useMemo((): React.CSSProperties => {
		if (!localValue.zodValidation.success) {
			return {
				border: `1px solid ${FAIL_COLOR}`,
				borderRadius: 4,
			};
		}

		return {
			border: 'none',
			padding: 0,
		};
	}, [localValue.zodValidation.success]);

	return (
		<fieldset style={container}>
			<div style={fullWidth}>
				<ZodSwitch
					value={value}
					setValue={onChange}
					jsonPath={jsonPath}
					schema={def.schema}
				/>
			</div>
			{!localValue.zodValidation.success && (
				<legend>
					<ValidationMessage
						align="flex-end"
						message={localValue.zodValidation.error.format()._errors[0]}
						type="error"
					/>
				</legend>
			)}
		</fieldset>
	);
};
