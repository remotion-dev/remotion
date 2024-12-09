import React, {useMemo, useState} from 'react';
import type {z} from 'zod';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {createZodValues} from './create-zod-values';
import {deepEqual} from './deep-equal';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import {SchemaArrayItemSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodTupleItemEditor} from './ZodTupleItemEditor';

export const ZodTupleEditor: React.FC<{
	readonly schema: z.ZodTypeAny;
	readonly jsonPath: JSONPath;
	readonly value: unknown[];
	readonly defaultValue: unknown[];
	readonly setValue: UpdaterFunction<unknown[]>;
	readonly onSave: UpdaterFunction<unknown[]>;
	readonly showSaveButton: boolean;
	readonly onRemove: null | (() => void);
	readonly saving: boolean;
	readonly saveDisabledByParent: boolean;
	readonly mayPad: boolean;
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
		unsavedValue: value,
		schema,
		setValue,
		savedValue: defaultValue,
	});
	const [expanded, setExpanded] = useState(true);

	const def = schema._def as z.ZodTupleDef;

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodTuple) {
		throw new Error('expected object');
	}

	const isDefaultValue = useMemo(() => {
		return deepEqual(localValue.value, defaultValue);
	}, [defaultValue, localValue]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
				}}
			>
				<SchemaLabel
					onReset={reset}
					isDefaultValue={isDefaultValue}
					jsonPath={jsonPath}
					onRemove={onRemove}
					suffix={suffix}
					onSave={() => {
						onSave(() => localValue.value, false, false);
					}}
					saveDisabledByParent={saveDisabledByParent}
					saving={saving}
					showSaveButton={showSaveButton}
					valid={localValue.zodValidation.success}
					handleClick={() => setExpanded(!expanded)}
				/>
			</div>

			{expanded ? (
				<RevisionContextProvider>
					<SchemaVerticalGuide isRoot={false}>
						{localValue.value.map((child, i) => {
							return (
								// eslint-disable-next-line react/no-array-index-key
								<React.Fragment key={`${i}${localValue.keyStabilityRevision}`}>
									<ZodTupleItemEditor
										onChange={onChange}
										value={child}
										def={def}
										index={i}
										jsonPath={jsonPath}
										defaultValue={
											defaultValue?.[i] ??
											createZodValues(def.items[i], z, zodTypes)
										}
										onSave={onSave}
										showSaveButton={showSaveButton}
										saving={saving}
										saveDisabledByParent={saveDisabledByParent}
										mayPad={mayPad}
									/>
									<SchemaArrayItemSeparationLine
										schema={schema}
										index={i}
										onChange={onChange}
										isLast={i === localValue.value.length - 1}
										showAddButton={false}
									/>
								</React.Fragment>
							);
						})}
						{value.length === 0 ? (
							<SchemaArrayItemSeparationLine
								schema={schema}
								index={0}
								onChange={onChange}
								isLast
								showAddButton={false}
							/>
						) : null}
					</SchemaVerticalGuide>
				</RevisionContextProvider>
			) : null}
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
