import React, {useMemo, useState} from 'react';
import type {z} from 'zod';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {fieldsetLabel} from '../layout';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {SchemaSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';
import {deepEqual} from './deep-equal';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

export type ObjectDiscrimatedUnionReplacement = {
	discriminator: string;
	markup: React.ReactNode;
};

export const ZodObjectEditor: React.FC<{
	readonly schema: z.ZodTypeAny;
	readonly jsonPath: JSONPath;
	readonly unsavedValue: Record<string, unknown>;
	readonly savedValue: Record<string, unknown>;
	readonly setValue: UpdaterFunction<Record<string, unknown>>;
	readonly onSave: UpdaterFunction<Record<string, unknown>>;
	readonly showSaveButton: boolean;
	readonly onRemove: null | (() => void);
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
	readonly discriminatedUnionReplacement: ObjectDiscrimatedUnionReplacement | null;
}> = ({
	schema,
	jsonPath,
	setValue,
	unsavedValue,
	savedValue,
	onSave,
	showSaveButton,
	onRemove,
	saving,
	saveDisabledByParent,
	mayPad,
	discriminatedUnionReplacement,
}) => {
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const [expanded, setExpanded] = useState(true);
	const {localValue, onChange, RevisionContextProvider, reset} = useLocalState({
		schema,
		setValue,
		unsavedValue,
		savedValue,
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
		return deepEqual(localValue.value, savedValue);
	}, [savedValue, localValue]);

	const suffix = useMemo(() => {
		return expanded ? ' {' : ' {...}';
	}, [expanded]);

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
					suffix={suffix}
					onSave={() => {
						onSave(
							() => {
								return localValue.value;
							},
							false,
							false,
						);
					}}
					saveDisabledByParent={saveDisabledByParent}
					saving={saving}
					showSaveButton={showSaveButton}
					valid={localValue.zodValidation.success}
					handleClick={() => setExpanded(!expanded)}
				/>
			)}

			{expanded ? (
				<RevisionContextProvider>
					<SchemaVerticalGuide isRoot={isRoot}>
						{keys.map((key, i) => {
							if (
								discriminatedUnionReplacement &&
								key === discriminatedUnionReplacement.discriminator
							) {
								return discriminatedUnionReplacement.markup;
							}

							return (
								<React.Fragment key={key}>
									<ZodSwitch
										mayPad
										jsonPath={[...jsonPath, key]}
										schema={shape[key]}
										value={localValue.value[key]}
										// In case of null | {a: string, b: string} type, we need to fallback to the default value
										defaultValue={(savedValue ?? unsavedValue)[key]}
										setValue={(val, forceApply) => {
											onChange(
												(oldVal) => {
													return {
														...oldVal,
														[key]:
															typeof val === 'function'
																? val(oldVal[key])
																: val,
													};
												},
												forceApply,
												false,
											);
										}}
										onSave={(val, forceApply) => {
											onSave(
												(oldVal) => {
													return {
														...oldVal,
														[key]:
															typeof val === 'function'
																? val(oldVal[key])
																: val,
													};
												},
												forceApply,
												false,
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
			) : null}

			{isRoot || !expanded ? null : <div style={fieldsetLabel}>{'}'}</div>}
		</Fieldset>
	);
};
