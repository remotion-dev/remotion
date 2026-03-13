import React, {useCallback, useMemo, useState} from 'react';
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

export const ZodArrayEditor: React.FC<{
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

	const [expanded, setExpanded] = useState(true);

	const arrayElement = getArrayElement(schema);

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	const zodValidation = useMemo(
		() => zodSafeParse(schema, value),
		[schema, value],
	);

	return (
		<Fieldset shouldPad={mayPad}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
				}}
			>
				<SchemaLabel
					jsonPath={jsonPath}
					onRemove={onRemove}
					suffix={suffix}
					valid={zodValidation.success}
					handleClick={() => setExpanded(!expanded)}
				/>
			</div>

			{expanded ? (
				<SchemaVerticalGuide isRoot={false}>
					{value.map((child, i) => {
						return (
							// eslint-disable-next-line react/no-array-index-key
							<React.Fragment key={i}>
								<ZodArrayItemEditor
									onChange={onChange}
									value={child}
									elementSchema={arrayElement}
									index={i}
									jsonPath={jsonPath}
									mayPad={mayPad}
									mayRemove
								/>
								<SchemaArrayItemSeparationLine
									schema={schema}
									index={i}
									onChange={onChange}
									isLast={i === value.length - 1}
									showAddButton
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
							showAddButton
						/>
					) : null}
				</SchemaVerticalGuide>
			) : null}
			<ZodFieldValidation path={jsonPath} zodValidation={zodValidation} />
		</Fieldset>
	);
};
