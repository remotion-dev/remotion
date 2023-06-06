import React, {useCallback, useMemo} from 'react';
import type {z} from 'zod';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {createZodValues} from './create-zod-values';
import {deepEqual} from './deep-equal';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';
import {ZodArrayItemEditor} from './ZodArrayItemEditor';
import type {UpdaterFunction} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import {fieldsetLabel} from '../layout';
import {SchemaSeparationLine} from './SchemaSeparationLine';
import type {RenderInlineAction} from '../../InlineAction';
import {InlineAction} from '../../InlineAction';
import {Plus} from '../../../icons/plus';
import {ZodFieldValidation} from './ZodFieldValidation';
import {SchemaLabel} from './SchemaLabel';

export const ZodArrayEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown[];
	defaultValue: unknown[];
	setValue: UpdaterFunction<unknown[]>;
	onSave: UpdaterFunction<unknown[]>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	setValue,
	defaultValue,
	value,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const {localValue, onChange, RevisionContextProvider, reset} = useLocalState({
		value,
		schema,
		setValue,
		defaultValue,
	});

	const def = schema._def as z.ZodArrayDef;

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodArray) {
		throw new Error('expected object');
	}

	const onAdd = useCallback(() => {
		onChange(
			(oldV) => {
				return [...oldV, createZodValues(def.type, z, zodTypes)];
			},
			false,
			true
		);
	}, [def.type, onChange, z, zodTypes]);

	const isDefaultValue = useMemo(() => {
		return deepEqual(localValue.value, defaultValue);
	}, [defaultValue, localValue]);

	const renderAddButton: RenderInlineAction = useCallback((color) => {
		return <Plus color={color} style={{height: 12}} />;
	}, []);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<SchemaLabel
				onReset={reset}
				isDefaultValue={isDefaultValue}
				jsonPath={jsonPath}
				onRemove={onRemove}
				suffix={' ['}
				onSave={() => {
					onSave(() => localValue.value, false, false);
				}}
				saveDisabledByParent={saveDisabledByParent}
				saving={saving}
				showSaveButton={showSaveButton}
				valid={localValue.zodValidation.success}
			/>
			<RevisionContextProvider>
				<SchemaVerticalGuide isRoot={false}>
					{localValue.value.map((child, i) => {
						return (
							// eslint-disable-next-line react/no-array-index-key
							<React.Fragment key={`${i}${localValue.keyStabilityRevision}`}>
								<ZodArrayItemEditor
									onChange={onChange}
									value={child}
									def={def}
									index={i}
									jsonPath={jsonPath}
									defaultValue={defaultValue[i] ?? child}
									onSave={onSave}
									showSaveButton={showSaveButton}
									saving={saving}
									saveDisabledByParent={saveDisabledByParent}
									mayPad={mayPad}
								/>
								{i === localValue.value.length - 1 ? null : (
									<SchemaSeparationLine />
								)}
							</React.Fragment>
						);
					})}
				</SchemaVerticalGuide>
			</RevisionContextProvider>

			<div
				style={{
					...fieldsetLabel,
					alignItems: 'center',
					display: 'flex',
				}}
			>
				{']'}
				<InlineAction onClick={onAdd} renderAction={renderAddButton} />
			</div>
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
