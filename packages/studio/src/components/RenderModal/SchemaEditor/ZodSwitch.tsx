import React from 'react';
import {useZodTypesIfPossible} from '../../get-zod-if-possible';
import type {AnyZodSchema} from './zod-schema-type';
import {
	getEffectsInner,
	getZodSchemaDescription,
	getZodSchemaType,
} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodArrayEditor} from './ZodArrayEditor';
import {ZodBooleanEditor} from './ZodBooleanEditor';
import {ZodColorEditor} from './ZodColorEditor';
import {ZodDateEditor} from './ZodDateEditor';
import {ZodDefaultEditor} from './ZodDefaultEditor';
import {ZodDiscriminatedUnionEditor} from './ZodDiscriminatedUnionEditor';
import {ZodEffectEditor} from './ZodEffectEditor';
import {ZodEnumEditor} from './ZodEnumEditor';
import {ZodMatrixEditor} from './ZodMatrixEditor';
import {ZonNonEditableValue} from './ZodNonEditableValue';
import {ZodNullableEditor} from './ZodNullableEditor';
import {ZodNumberEditor} from './ZodNumberEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import {ZodOptionalEditor} from './ZodOptionalEditor';
import {ZodStaticFileEditor} from './ZodStaticFileEditor';
import {ZodStringEditor} from './ZodStringEditor';
import {ZodTextareaEditor} from './ZodTextareaEditor';
import {ZodTupleEditor} from './ZodTupleEditor';
import {ZodUnionEditor} from './ZodUnionEditor';

export type UpdaterFunction<T> = (
	updater: (oldValue: T) => T,
	{shouldSave}: {shouldSave: boolean},
) => void;

export const ZodSwitch: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: unknown;
	readonly setValue: UpdaterFunction<unknown>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, value, setValue, onRemove, mayPad}) => {
	const typeName = getZodSchemaType(schema);
	const description = getZodSchemaDescription(schema);
	const zodTypes = useZodTypesIfPossible();

	if (typeName === 'object') {
		return (
			<ZodObjectEditor
				setValue={setValue as UpdaterFunction<Record<string, unknown>>}
				value={value as Record<string, unknown>}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
				discriminatedUnionReplacement={null}
			/>
		);
	}

	if (typeName === 'string') {
		// In v4, .refine() doesn't wrap in ZodEffects, so check brand here too
		if (
			zodTypes &&
			description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND
		) {
			return (
				<ZodColorEditor
					value={value as string}
					setValue={setValue as UpdaterFunction<string>}
					jsonPath={jsonPath}
					schema={schema}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		if ((value as string).startsWith(window.remotion_staticBase)) {
			return (
				<ZodStaticFileEditor
					setValue={setValue as UpdaterFunction<string>}
					value={value as string}
					jsonPath={jsonPath}
					schema={schema}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		if (
			zodTypes &&
			description === zodTypes.ZodZypesInternals.REMOTION_TEXTAREA_BRAND
		) {
			return (
				<ZodTextareaEditor
					value={value as string}
					setValue={setValue as UpdaterFunction<string>}
					jsonPath={jsonPath}
					schema={schema}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		return (
			<ZodStringEditor
				value={value as string}
				setValue={setValue as UpdaterFunction<string>}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'date') {
		return (
			<ZodDateEditor
				value={value as Date}
				setValue={setValue as UpdaterFunction<Date>}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'number') {
		return (
			<ZodNumberEditor
				value={value as number}
				setValue={setValue as UpdaterFunction<number>}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'boolean') {
		return (
			<ZodBooleanEditor
				value={value as boolean}
				setValue={setValue as UpdaterFunction<boolean>}
				jsonPath={jsonPath}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'undefined') {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'undefined'}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'null') {
		return (
			<ZonNonEditableValue jsonPath={jsonPath} label={'null'} mayPad={mayPad} />
		);
	}

	if (typeName === 'any') {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'any (not editable)'}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'bigint') {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'BigInt (not editable)'}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'unknown') {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				label={'unknown (not editable)'}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'array') {
		// In v4, .refine() doesn't wrap in ZodEffects, so check brand here too
		if (
			zodTypes &&
			description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND
		) {
			return (
				<ZodMatrixEditor
					setValue={setValue as UpdaterFunction<unknown[]>}
					value={value as unknown[]}
					jsonPath={jsonPath}
					schema={schema}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		return (
			<ZodArrayEditor
				setValue={setValue as UpdaterFunction<unknown[]>}
				value={value as unknown[]}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'enum') {
		return (
			<ZodEnumEditor
				setValue={setValue as UpdaterFunction<string>}
				value={value as string}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
			/>
		);
	}

	// In v3, effects wrap schemas (e.g. .refine(), .transform()).
	// In v4, refine/transform are embedded as checks, so this only applies to v3.
	if (typeName === 'effects') {
		if (
			zodTypes &&
			description === zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND
		) {
			return (
				<ZodColorEditor
					value={value as string}
					setValue={setValue as UpdaterFunction<string>}
					jsonPath={jsonPath}
					schema={schema}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		if (
			zodTypes &&
			description === zodTypes.ZodZypesInternals.REMOTION_MATRIX_BRAND
		) {
			return (
				<ZodMatrixEditor
					setValue={setValue as UpdaterFunction<unknown[]>}
					value={value as unknown[]}
					jsonPath={jsonPath}
					schema={getEffectsInner(schema)}
					onRemove={onRemove}
					mayPad={mayPad}
				/>
			);
		}

		return (
			<ZodEffectEditor
				value={value}
				setValue={setValue}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'union') {
		return (
			<ZodUnionEditor
				schema={schema}
				jsonPath={jsonPath}
				value={value}
				setValue={setValue}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'optional') {
		return (
			<ZodOptionalEditor
				jsonPath={jsonPath}
				value={value}
				setValue={setValue}
				onRemove={onRemove}
				schema={schema}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'nullable') {
		return (
			<ZodNullableEditor
				jsonPath={jsonPath}
				value={value}
				setValue={setValue}
				onRemove={onRemove}
				schema={schema}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'default') {
		return (
			<ZodDefaultEditor
				jsonPath={jsonPath}
				value={value}
				setValue={setValue}
				onRemove={onRemove}
				schema={schema}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === 'discriminatedUnion') {
		return (
			<ZodDiscriminatedUnionEditor
				mayPad={mayPad}
				schema={schema}
				setValue={setValue as UpdaterFunction<Record<string, unknown>>}
				value={value as Record<string, unknown>}
				jsonPath={jsonPath}
				onRemove={onRemove}
			/>
		);
	}

	if (typeName === 'tuple') {
		return (
			<ZodTupleEditor
				setValue={setValue as UpdaterFunction<unknown[]>}
				value={value as unknown[]}
				jsonPath={jsonPath}
				schema={schema}
				onRemove={onRemove}
				mayPad={mayPad}
			/>
		);
	}

	return (
		<ZonNonEditableValue
			jsonPath={jsonPath}
			label={`${typeName} (not editable)`}
			mayPad={mayPad}
		/>
	);
};
