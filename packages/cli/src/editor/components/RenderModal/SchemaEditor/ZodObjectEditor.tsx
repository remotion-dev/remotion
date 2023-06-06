import React, {useCallback} from 'react';
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

	const {localValue, onChange} = useLocalState({
		schema,
		setValue,
		value,
	});

	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodObject) {
		throw new Error('expected object');
	}

	const shape = def.shape();
	const keys = Object.keys(shape);

	const isRoot = jsonPath.length === 0;

	const onRes = useCallback(() => {
		onChange(() => defaultValue, true);
	}, [defaultValue, onChange]);

	return (
		<div>
			<Fieldset shouldPad={!isRoot} success={localValue.zodValidation.success}>
				{isRoot ? null : (
					<SchemaLabel
						isDefaultValue
						onReset={onRes}
						jsonPath={jsonPath}
						onRemove={onRemove}
						suffix={' {'}
						onSave={() => {
							onSave(() => {
								return localValue.value;
							}, false);
						}}
						saveDisabledByParent={saveDisabledByParent}
						saving={saving}
						showSaveButton={showSaveButton}
						valid={localValue.zodValidation.success}
					/>
				)}
				<SchemaVerticalGuide isRoot={isRoot}>
					{keys.map((key, i) => {
						return (
							<React.Fragment key={key}>
								<ZodSwitch
									mayPad={mayPad}
									jsonPath={[...jsonPath, key]}
									schema={shape[key]}
									value={localValue.value[key]}
									// In case of null | {a: string, b: string} type, we need to fallback to the default value
									defaultValue={(defaultValue ?? value)[key]}
									setValue={(val, forceApply) => {
										onChange((oldVal) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										}, forceApply);
									}}
									onSave={(val, forceApply) => {
										onSave((oldVal) => {
											return {
												...oldVal,
												[key]:
													typeof val === 'function' ? val(oldVal[key]) : val,
											};
										}, forceApply);
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
				{isRoot ? null : <div style={fieldsetLabel}>{'}'}</div>}
			</Fieldset>
		</div>
	);
};
