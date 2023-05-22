import React, {useMemo} from 'react';
import type {z} from 'zod';
import {FAIL_COLOR} from '../../../helpers/colors';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodEffectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	setValue: UpdaterFunction<unknown>;
	compact: boolean;
	defaultValue: unknown;
	onSave: UpdaterFunction<unknown>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue: updateValue,
	compact,
	defaultValue,
	onSave,
	onRemove,
	showSaveButton,
	saving,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange} = useLocalState({
		value,
		schema,
		setValue: updateValue,
	});

	const def = schema._def;
	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodEffects) {
		throw new Error('expected effect');
	}

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
					compact={compact}
					defaultValue={defaultValue}
					onSave={onSave}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
				/>
			</div>
			{!localValue.zodValidation.success && (
				<legend>
					<ValidationMessage
						align="flex-start"
						message={localValue.zodValidation.error.format()._errors[0]}
						type="error"
					/>
				</legend>
			)}
		</fieldset>
	);
};
