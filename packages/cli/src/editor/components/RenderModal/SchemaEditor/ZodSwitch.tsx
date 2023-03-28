import React from 'react';
import {z} from 'remotion';
import type {JSONPath} from './zod-types';
import {ZodArrayEditor} from './ZodArrayEditor';
import {ZodEffectEditor} from './ZodEffectEditor';
import {ZodNumberEditor} from './ZodNumberEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import {ZodStringEditor} from './ZodStringEditor';

export const ZodSwitch: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
	onSave: (newValue: (oldVal: unknown) => unknown) => void;
	compact: boolean;
	showSaveButton: boolean;
	onRemove: null | (() => void);
}> = ({
	schema,
	jsonPath,
	compact,
	value,
	setValue,
	defaultValue,
	onSave,
	showSaveButton,
	onRemove,
}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;
	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		// TODO: Better UI for this
		return <div>any</div>;
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<ZodObjectEditor
				setValue={setValue}
				value={value}
				defaultValue={defaultValue}
				jsonPath={jsonPath}
				schema={schema}
				compact={compact}
				onSave={
					onSave as (
						newValue: (
							oldVal: Record<string, unknown>
						) => Record<string, unknown>
					) => void
				}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodString) {
		return (
			<ZodStringEditor
				value={value as string}
				setValue={setValue as React.Dispatch<React.SetStateAction<string>>}
				jsonPath={jsonPath}
				schema={schema}
				compact={compact}
				onSave={onSave}
				defaultValue={defaultValue as string}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodNumber) {
		return (
			<ZodNumberEditor
				value={value as number}
				setValue={setValue as React.Dispatch<React.SetStateAction<unknown>>}
				jsonPath={jsonPath}
				schema={schema}
				compact={compact}
				defaultValue={defaultValue as number}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodArray) {
		return (
			<ZodArrayEditor
				setValue={setValue as React.Dispatch<React.SetStateAction<unknown[]>>}
				value={value as unknown[]}
				jsonPath={jsonPath}
				schema={schema}
				compact={compact}
				defaultValue={defaultValue as unknown[]}
				onSave={onSave as (newValue: (oldVal: unknown[]) => unknown[]) => void}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
		return (
			<ZodEffectEditor
				value={value}
				setValue={setValue}
				jsonPath={jsonPath}
				schema={schema}
				compact={compact}
				defaultValue={defaultValue}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
			/>
		);
	}

	return <div>unknown</div>;
};
