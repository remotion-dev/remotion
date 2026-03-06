import React, {useCallback} from 'react';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {RemTextarea} from '../../NewComposition/RemTextarea';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import type {AnyZodSchema} from './zod-schema-type';
import {zodSafeParse} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const textareaStyle: React.CSSProperties = {
	resize: 'vertical',
	minHeight: 100,
};

export const ZodTextareaEditor: React.FC<{
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

	const zodTypes = useZodTypesIfPossible();
	if (!zodTypes) {
		throw new Error('expected zod textarea');
	}

	const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
		(e) => {
			setValue(() => e.target.value, {shouldSave: false});
		},
		[setValue],
	);

	const onBlur: React.FocusEventHandler<HTMLTextAreaElement> =
		useCallback(() => {
			setValue((v) => v, {shouldSave: true});
		}, [setValue]);

	const zodValidation = React.useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
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
				<RemTextarea
					onChange={onChange}
					onBlur={onBlur}
					value={value}
					status={zodValidation ? 'ok' : 'error'}
					placeholder={jsonPath.join('.')}
					name={jsonPath.join('.')}
					style={textareaStyle}
				/>
				<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
			</div>
		</Fieldset>
	);
};
