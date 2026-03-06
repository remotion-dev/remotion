import React, {useMemo, useState} from 'react';
import {useZodIfPossible} from '../../get-zod-if-possible';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import {SchemaArrayItemSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import type {AnyZodSchema} from './zod-schema-type';
import {getTupleItems} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import {ZodFieldValidation} from './ZodFieldValidation';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodTupleItemEditor} from './ZodTupleItemEditor';

export const ZodTupleEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: unknown[];
	readonly setValue: UpdaterFunction<unknown[]>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
}> = ({schema, jsonPath, setValue, value, onRemove, mayPad}) => {
	const {localValue, onChange} = useLocalState({
		value,
		schema,
		setValue,
	});
	const [expanded, setExpanded] = useState(true);

	const tupleItems = getTupleItems(schema);

	const suffix = useMemo(() => {
		return expanded ? ' [' : ' [...] ';
	}, [expanded]);
	const z = useZodIfPossible();
	if (!z) {
		throw new Error('expected zod');
	}

	return (
		<Fieldset shouldPad={mayPad} success={localValue.zodValidation.success}>
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
					valid={localValue.zodValidation.success}
					handleClick={() => setExpanded(!expanded)}
				/>
			</div>

			{expanded ? (
				<SchemaVerticalGuide isRoot={false}>
					{localValue.value.map((child, i) => {
						return (
							// eslint-disable-next-line react/no-array-index-key
							<React.Fragment key={i}>
								<ZodTupleItemEditor
									onChange={onChange}
									value={child}
									tupleItems={tupleItems}
									index={i}
									jsonPath={jsonPath}
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
			) : null}
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
