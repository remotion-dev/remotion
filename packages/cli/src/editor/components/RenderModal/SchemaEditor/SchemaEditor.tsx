import React, {useCallback} from 'react';
import type {AnyZodObject, z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {
	InvalidDefaultProps,
	InvalidSchema,
	TopLevelZodValue,
} from './SchemaErrorMessages';
import {ZodObjectEditor} from './ZodObjectEditor';

const scrollable: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

export const SchemaEditor: React.FC<{
	schema: AnyZodObject;
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
	defaultProps: Record<string, unknown>;
	onSave: (updater: (oldState: unknown) => unknown) => void;
	showSaveButton: boolean;
	saving: boolean;
	saveDisabledByParent: boolean;
}> = ({
	schema,
	value,
	setValue,
	zodValidationResult,
	defaultProps,
	onSave,
	showSaveButton,
	saving,
	saveDisabledByParent,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;

	const reset = useCallback(() => {
		setValue(defaultProps);
	}, [defaultProps, setValue]);

	if (!zodValidationResult.success) {
		const defaultPropsValid = schema.safeParse(defaultProps);

		if (!defaultPropsValid.success) {
			return <InvalidDefaultProps zodValidationResult={zodValidationResult} />;
		}

		return (
			<InvalidSchema reset={reset} zodValidationResult={zodValidationResult} />
		);
	}

	if (typeName !== z.ZodFirstPartyTypeKind.ZodObject) {
		return <TopLevelZodValue typeReceived={typeName} />;
	}

	return (
		<div style={scrollable} className={VERTICAL_SCROLLBAR_CLASSNAME}>
			<ZodObjectEditor
				value={value as Record<string, unknown>}
				setValue={setValue}
				jsonPath={[]}
				schema={schema}
				defaultValue={defaultProps as Record<string, unknown>}
				onSave={
					onSave as (
						newValue: (
							oldVal: Record<string, unknown>
						) => Record<string, unknown>
					) => void
				}
				showSaveButton={showSaveButton}
				onRemove={null}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad
			/>
		</div>
	);
};
