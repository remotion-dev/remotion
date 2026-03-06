import {useMemo} from 'react';
import React, {useCallback} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {RemotionInput} from '../../NewComposition/RemInput';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

export const ZodStringEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: string;
	readonly setValue: UpdaterFunction<string>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({jsonPath, value, setValue, schema, onRemove, mayPad}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setValue(() => e.target.value);
		},
		[setValue],
	);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				handleClick={null}
				jsonPath={jsonPath}
				onRemove={onRemove}
				valid={zodValidation.success}
				suffix={null}
			/>
			<div style={fullWidth}>
				<RemotionInput
					value={value}
					status={zodValidation.success ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					onChange={onChange}
					rightAlign={false}
					name={jsonPath.join('.')}
				/>
				<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
			</div>
		</Fieldset>
	);
};
