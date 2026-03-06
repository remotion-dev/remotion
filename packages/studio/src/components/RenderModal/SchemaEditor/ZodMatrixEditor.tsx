import React, {useMemo, useState} from 'react';
import {useCallback} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {SchemaLabel} from './SchemaLabel';
import {SchemaArrayItemSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import {zodSafeParse, type AnyZodSchema} from './zod-schema-type';
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
	readonly setValue: UpdaterFunction<unknown[]>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, setValue, value, onRemove, mayPad}) => {
	const onChange: UpdaterFunction<unknown[]> = useCallback(
		(
			updater: (oldV: unknown[]) => unknown[],
			{shouldSave}: {shouldSave: boolean},
		) => {
			setValue(updater, {shouldSave});
		},
		[setValue],
	);

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);
	const [expanded, setExpanded] = useState(true);

	const arrayElement = getArrayElement(schema);

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);

	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const dimensions = Math.sqrt(value.length);

	if (!Number.isInteger(dimensions)) {
		throw new Error('Invalid matrix');
	}

	const chunkedItems = useMemo(() => {
		return value.reduce<number[][]>((acc, item, index) => {
			const chunkIndex = Math.floor(index / dimensions);
			acc[chunkIndex] = acc[chunkIndex] || [];
			acc[chunkIndex].push(item as number);
			return acc;
		}, [] as number[][]);
	}, [value, dimensions]);

	return (
		<Fieldset shouldPad={mayPad}>
			<SchemaLabel
				jsonPath={jsonPath}
				onRemove={onRemove}
				suffix={suffix}
				valid={zodValidation.success}
				handleClick={() => setExpanded(!expanded)}
			/>

			{expanded ? (
				<SchemaVerticalGuide isRoot={false}>
					{chunkedItems.map((row, rowIndex) => {
						return (
							<React.Fragment
								// eslint-disable-next-line react/no-array-index-key
								key={rowIndex}
							>
								<div style={rowStyle}>
									{row.map((item, _index) => {
										const actualIndex = rowIndex * dimensions + _index;

										return (
											<div
												// eslint-disable-next-line react/no-array-index-key
												key={_index}
												style={{flex: 1}}
											>
												<ZodArrayItemEditor
													onChange={onChange}
													value={item}
													elementSchema={arrayElement}
													index={actualIndex}
													jsonPath={jsonPath}
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
			) : null}
			<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
		</Fieldset>
	);
};
