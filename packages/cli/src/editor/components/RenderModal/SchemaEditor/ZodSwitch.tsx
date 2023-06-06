import React from 'react';
import type {z} from 'zod';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import type {JSONPath} from './zod-types';
import {ZodArrayEditor} from './ZodArrayEditor';
import {ZodBooleanEditor} from './ZodBooleanEditor';
import {ZodColorEditor} from './ZodColorEditor';
import {ZodDateEditor} from './ZodDateEditor';
import {ZodDefaultEditor} from './ZodDefaultEditor';
import {ZodEffectEditor} from './ZodEffectEditor';
import {ZodEnumEditor} from './ZodEnumEditor';
import {ZonNonEditableValue} from './ZodNonEditableValue';
import {ZodNullableEditor} from './ZodNullableEditor';
import {ZodNumberEditor} from './ZodNumberEditor';
import {ZodObjectEditor} from './ZodObjectEditor';
import {ZodOptionalEditor} from './ZodOptionalEditor';
import {ZodStaticFileEditor} from './ZodStaticFileEditor';
import {ZodStringEditor} from './ZodStringEditor';
import {ZodUnionEditor} from './ZodUnionEditor';

export type UpdaterFunction<T> = (
	updater: (oldValue: T) => T,
	forceApply: boolean,
	increment: boolean
) => void;

export const ZodSwitch: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown;
	defaultValue: unknown;
	setValue: UpdaterFunction<unknown>;
	onSave: UpdaterFunction<unknown>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	value,
	setValue,
	defaultValue,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const def: z.ZodTypeDef = schema._def;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const typeName = (def as any).typeName as z.ZodFirstPartyTypeKind;

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	// TODO: (Maybe?) enable saving of inserted input props by cmd+s /ctrl + s (also for JSON view)

	if (typeName === z.ZodFirstPartyTypeKind.ZodObject) {
		return (
			<ZodObjectEditor
				setValue={setValue as UpdaterFunction<Record<string, unknown>>}
				value={value as Record<string, unknown>}
				defaultValue={defaultValue as Record<string, unknown>}
				jsonPath={jsonPath}
				schema={schema}
				onSave={onSave as UpdaterFunction<Record<string, unknown>>}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodString) {
		if ((value as string).startsWith(window.remotion_staticBase)) {
			return (
				<ZodStaticFileEditor
					setValue={setValue as UpdaterFunction<string>}
					value={value as string}
					jsonPath={jsonPath}
					schema={schema}
					defaultValue={defaultValue as string}
					onSave={onSave as (newValue: (oldVal: string) => string) => void}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={saveDisabledByParent}
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
				onSave={onSave as UpdaterFunction<string>}
				defaultValue={defaultValue as string}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodDate) {
		return (
			<ZodDateEditor
				value={value as Date}
				setValue={setValue as UpdaterFunction<Date>}
				jsonPath={jsonPath}
				schema={schema}
				onSave={onSave as UpdaterFunction<Date>}
				defaultValue={defaultValue as Date}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodNumber) {
		return (
			<ZodNumberEditor
				value={value as number}
				setValue={setValue as UpdaterFunction<number>}
				jsonPath={jsonPath}
				schema={schema}
				defaultValue={defaultValue as number}
				onSave={onSave as UpdaterFunction<number>}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodBoolean) {
		return (
			<ZodBooleanEditor
				value={value as boolean}
				setValue={setValue as UpdaterFunction<boolean>}
				jsonPath={jsonPath}
				defaultValue={defaultValue as boolean}
				onSave={onSave as UpdaterFunction<boolean>}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
				schema={schema}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodUndefined) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				label={'undefined'}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodNull) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				label={'null'}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodAny) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				label={'any (not editable)'}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodBigInt) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				label={'BigInt (not editable)'}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodUnknown) {
		return (
			<ZonNonEditableValue
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				label={'unknown (not editable)'}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodArray) {
		return (
			<ZodArrayEditor
				setValue={setValue as UpdaterFunction<unknown[]>}
				value={value as unknown[]}
				jsonPath={jsonPath}
				schema={schema}
				defaultValue={defaultValue as unknown[]}
				onSave={onSave as UpdaterFunction<unknown[]>}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodEnum) {
		return (
			<ZodEnumEditor
				setValue={setValue as UpdaterFunction<string>}
				value={value as string}
				jsonPath={jsonPath}
				schema={schema}
				defaultValue={defaultValue as string}
				onSave={onSave as UpdaterFunction<string>}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodEffects) {
		if (
			zodTypes &&
			schema._def.description ===
				zodTypes.ZodZypesInternals.REMOTION_COLOR_BRAND
		) {
			return (
				<ZodColorEditor
					value={value as string}
					setValue={setValue as UpdaterFunction<string>}
					jsonPath={jsonPath}
					schema={schema}
					onSave={onSave as UpdaterFunction<string>}
					defaultValue={defaultValue as string}
					showSaveButton={showSaveButton}
					onRemove={onRemove}
					saving={saving}
					saveDisabledByParent={saveDisabledByParent}
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
				defaultValue={defaultValue}
				onSave={onSave}
				showSaveButton={showSaveButton}
				onRemove={onRemove}
				saving={saving}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodUnion) {
		return (
			<ZodUnionEditor
				schema={schema}
				showSaveButton={showSaveButton}
				jsonPath={jsonPath}
				value={value}
				defaultValue={defaultValue}
				setValue={setValue}
				onSave={onSave}
				onRemove={onRemove}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodOptional) {
		return (
			<ZodOptionalEditor
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				defaultValue={defaultValue}
				value={value}
				setValue={setValue}
				onSave={onSave}
				onRemove={onRemove}
				schema={schema}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodNullable) {
		return (
			<ZodNullableEditor
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				defaultValue={defaultValue}
				value={value}
				setValue={setValue}
				onSave={onSave}
				onRemove={onRemove}
				schema={schema}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	if (typeName === z.ZodFirstPartyTypeKind.ZodDefault) {
		return (
			<ZodDefaultEditor
				jsonPath={jsonPath}
				showSaveButton={showSaveButton}
				defaultValue={defaultValue}
				value={value}
				setValue={setValue}
				onSave={onSave}
				onRemove={onRemove}
				schema={schema}
				saving={saving}
				saveDisabledByParent={saveDisabledByParent}
				mayPad={mayPad}
			/>
		);
	}

	return (
		<ZonNonEditableValue
			jsonPath={jsonPath}
			showSaveButton={showSaveButton}
			label={`${typeName} (not editable)`}
			saving={saving}
			mayPad={mayPad}
		/>
	);
};
