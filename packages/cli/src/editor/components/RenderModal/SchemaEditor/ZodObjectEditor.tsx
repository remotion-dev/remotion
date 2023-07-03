import {useMemo} from 'react';
import React from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {Fieldset} from './Fieldset';
import {SchemaSeparationLine} from './SchemaSeparationLine';
import {fieldsetLabel} from '../layout';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import {SchemaLabel} from './SchemaLabel';
import {deepEqual} from './deep-equal';

export const ZodObjectEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: Record<string, unknown>;
	defaultValue: Record<string, unknown>;
	setValue: UpdaterFunction<Record<string, unknown>>;
	onSave: UpdaterFunction<Record<string, unknown>>;
	showSaveButton: boolean;
	onRemove: null | (() => void);
	saving: boolean;
	saveDisabledByParent: boolean;
	mayPad: boolean;
}> = ({
	schema,
	jsonPath,
	setValue,
	value,
	defaultValue,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const {localValue, onChange, RevisionContextProvider, reset} = useLocalState({
		schema,
		setValue,
		value,
		defaultValue,
	});

	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodObject) {
		throw new Error('expected object');
	}

	const shape = def.shape();
	const keys = Object.keys(shape);

	const isRoot = jsonPath.length === 0;

	const isDefaultValue = useMemo(() => {
		return deepEqual(localValue.value, defaultValue);
	}, [defaultValue, localValue]);

	return (
		<Fieldset
			shouldPad={!isRoot && mayPad}
			success={localValue.zodValidation.success}
		>
			{isRoot ? null : (
				<SchemaLabel
					isDefaultValue={isDefaultValue}
					onReset={reset}
					jsonPath={jsonPath}
					onRemove={onRemove}
					suffix={' {'}
					onSave={() => {
						onSave(
							() => {
								return localValue.value;
							},
							false,
							false
						);
					}}
					saveDisabledByParent={saveDisabledByParent}
					saving={saving}
					showSaveButton={showSaveButton}
					valid={localValue.zodValidation.success}
				/>
			)}
			<RevisionContextProvider>
				<SchemaVerticalGuide isRoot={isRoot}>
					{keys.map((key, i) => {
						return (
							<React.Fragment key={key}>
								<ZodSwitch
									mayPad
									jsonPath={[...jsonPath, key]}
									schema={shape[key]}
									value={localValue.value[key]}
									// In case of null | {a: string, b: string} type, we need to fallback to the default value
									defaultValue={(defaultValue ?? value)[key]}
									setValue={(val, forceApply) => {
										onChange(
											(oldVal) => {
												return {
													...oldVal,
													[key]:
														typeof val === 'function' ? val(oldVal[key]) : val,
												};
											},
											forceApply,
											false
										);
									}}
									onSave={(val, forceApply) => {
										onSave(
											(oldVal) => {
												return {
													...oldVal,
													[key]:
														typeof val === 'function' ? val(oldVal[key]) : val,
												};
											},
											forceApply,
											false
										);
									}}
									onRemove={null}
									showSaveButton={showSaveButton}
									saving={saving}
									saveDisabledByParent={saveDisabledByParent}
								/>
								{i === keys.length - 1 ? null : <SchemaSeparationLine />}
							</React.Fragment>
						);
					})}
				</SchemaVerticalGuide>
			</RevisionContextProvider>

			{isRoot ? null : <div style={fieldsetLabel}>{'}'}</div>}
		</Fieldset>
	);
};
