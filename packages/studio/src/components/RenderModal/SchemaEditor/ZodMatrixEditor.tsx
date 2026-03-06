import React, {useMemo, useState} from 'react';
import {
	useZodIfPossible,
	useZodTypesIfPossible,
} from '../../get-zod-if-possible';
import {createZodValues} from './create-zod-values';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import {SchemaArrayItemSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import type {AnyZodSchema} from './zod-schema-type';
import {getArrayElement} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodArrayItemEditor} from './ZodArrayItemEditor';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';

const rowStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
};

export const ZodMatrixEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: unknown[];
	readonly defaultValue: unknown[];
	readonly setValue: UpdaterFunction<unknown[]>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, setValue, defaultValue, value, onRemove, mayPad}) => {
	const {localValue, onChange, RevisionContextProvider} = useLocalState({
		unsavedValue: value,
		schema,
		setValue,
		savedValue: defaultValue,
	});

	const [expanded, setExpanded] = useState(true);

	const arrayElement = getArrayElement(schema);

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodTypes = useZodTypesIfPossible();

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
				jsonPath={jsonPath}
				onRemove={onRemove}
				suffix={suffix}
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
														elementSchema={arrayElement}
														index={actualIndex}
														jsonPath={jsonPath}
														defaultValue={
															defaultValue?.[actualIndex] ??
															createZodValues(arrayElement, z, zodTypes)
														}
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
