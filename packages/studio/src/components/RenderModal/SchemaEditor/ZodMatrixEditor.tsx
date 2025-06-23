import React, {useMemo, useState} from 'react';
import type {z} from 'zod';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {SchemaArrayItemSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import {ZodArrayItemEditor} from './ZodArrayItemEditor';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {createZodValues} from './create-zod-values';
import {deepEqual} from './deep-equal';
import {useLocalState} from './local-state';
import type {JSONPath} from './zod-types';

const rowStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
};

export const ZodMatrixEditor: React.FC<{
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

	const def = schema._def as z.ZodArrayDef;

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

	const isDefaultValue = useMemo(() => {
		return deepEqual(localValue.value, defaultValue);
	}, [defaultValue, localValue]);

	const dimensions = Math.sqrt(localValue.value.length);

	if (!Number.isInteger(dimensions)) {
		throw new Error('Invalid matrix');
	}

	const chunkedItems = useMemo(() => {
		return localValue.value.reduce<number[][]>((acc, item, index) => {
			const chunkIndex = Math.floor(index / dimensions);
			acc[chunkIndex] = acc[chunkIndex] || [];
			acc[chunkIndex].push(item as number);
			return acc;
		}, [] as number[][]);
	}, [localValue.value, dimensions]);

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
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

			{expanded ? (
				<RevisionContextProvider>
					<SchemaVerticalGuide isRoot={false}>
						{chunkedItems.map((row, rowIndex) => {
							return (
								<React.Fragment
									// eslint-disable-next-line react/no-array-index-key
									key={`${rowIndex}${localValue.keyStabilityRevision}`}
								>
									<div style={rowStyle}>
										{row.map((item, _index) => {
											const actualIndex = rowIndex * dimensions + _index;

											return (
												<div
													// eslint-disable-next-line react/no-array-index-key
													key={`${_index}${localValue.keyStabilityRevision}`}
													style={{flex: 1}}
												>
													<ZodArrayItemEditor
														onChange={onChange}
														value={item}
														def={def}
														index={actualIndex}
														jsonPath={jsonPath}
														defaultValue={
															defaultValue?.[actualIndex] ??
															createZodValues(def.type, z, zodTypes)
														}
														onSave={onSave}
														showSaveButton={showSaveButton}
														saving={saving}
														saveDisabledByParent={saveDisabledByParent}
														mayPad={mayPad}
														mayRemove={false}
													/>
												</div>
											);
										})}
									</div>
								</React.Fragment>
							);
						})}
						{value.length === 0 ? (
							<SchemaArrayItemSeparationLine
								schema={schema}
								index={0}
								onChange={onChange}
								isLast
								showAddButton
							/>
						) : null}
					</SchemaVerticalGuide>
				</RevisionContextProvider>
			) : null}
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
