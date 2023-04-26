import React, {useCallback} from 'react';
import {z} from 'remotion';
import {VERTICAL_SCROLLBAR_CLASSNAME} from '../../Menu/is-menu-item';
import {InvalidDefaultProps, InvalidSchema} from './SchemaErrorMessages';
import {ZodObjectEditor} from './ZodObjectEditor';

const scrollable: React.CSSProperties = {
	padding: '8px 12px',
	display: 'flex',
	flexDirection: 'column',
	overflowY: 'auto',
};

export const SchemaEditor: React.FC<{
	schema: z.ZodTypeAny;
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	zodValidationResult: z.SafeParseReturnType<unknown, unknown>;
	compact: boolean;
	defaultProps: unknown;
	onSave: (updater: (oldState: unknown) => unknown) => void;
	showSaveButton: boolean;
	saving: boolean;
}> = ({
	schema,
	value,
	setValue,
	zodValidationResult,
	compact,
	defaultProps,
	onSave,
	showSaveButton,
	saving,
}) => {
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

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<div style={scrollable} className={VERTICAL_SCROLLBAR_CLASSNAME}>
				<ZodObjectEditor
					value={value}
					setValue={setValue}
					jsonPath={[]}
					schema={schema}
					compact={compact}
					defaultValue={defaultProps}
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
				/>
			</div>
		);
	}

	return null;
};
