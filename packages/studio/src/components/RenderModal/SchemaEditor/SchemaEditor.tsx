import React from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {
	InvalidDefaultProps,
	InvalidSchema,
	TopLevelZodValue,
} from './SchemaErrorMessages';
import {defaultPropsEditorScrollableAreaRef} from './scroll-to-default-props-path';
import type {AnyZodSchema, ZodSafeParseResult} from './zod-schema-type';
import {getZodSchemaType, zodSafeParse} from './zod-schema-type';
import {ZodObjectEditor} from './ZodObjectEditor';

const scrollable: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

export const SchemaEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly value: Record<string, unknown>;
	readonly setValue: React.Dispatch<
		React.SetStateAction<Record<string, unknown>>
	>;
	readonly zodValidationResult: ZodSafeParseResult;
	readonly savedDefaultProps: Record<string, unknown>;
}> = ({schema, value, setValue, zodValidationResult, savedDefaultProps}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const typeName = getZodSchemaType(schema);

	if (!zodValidationResult.success) {
		const defaultPropsValid = zodSafeParse(schema, savedDefaultProps);

		if (!defaultPropsValid.success) {
			return <InvalidDefaultProps zodValidationResult={zodValidationResult} />;
		}

		return <InvalidSchema zodValidationResult={zodValidationResult} />;
	}

	if (typeName !== 'object') {
		return <TopLevelZodValue typeReceived={typeName} />;
	}

	return (
		<div
			ref={defaultPropsEditorScrollableAreaRef}
			style={scrollable}
			className={VERTICAL_SCROLLBAR_CLASSNAME}
		>
			<ZodObjectEditor
				discriminatedUnionReplacement={null}
				value={value as Record<string, unknown>}
				setValue={setValue}
				jsonPath={[]}
				schema={schema}
				onRemove={null}
				mayPad
			/>
		</div>
	);
};
