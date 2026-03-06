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

export const ZodArrayEditor: React.FC<{
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
				<RevisionContextProvider>
					<SchemaVerticalGuide isRoot={false}>
						{localValue.value.map((child, i) => {
							return (
								// eslint-disable-next-line react/no-array-index-key
								<React.Fragment key={`${i}${localValue.keyStabilityRevision}`}>
									<ZodArrayItemEditor
										onChange={onChange}
										value={child}
										elementSchema={arrayElement}
										index={i}
										jsonPath={jsonPath}
										defaultValue={
											defaultValue?.[i] ??
											createZodValues(arrayElement, z, zodTypes)
										}
										mayPad={mayPad}
										mayRemove
									/>
									<SchemaArrayItemSeparationLine
										schema={schema}
										index={i}
										onChange={onChange}
										isLast={i === localValue.value.length - 1}
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
				</RevisionContextProvider>
			) : null}
			<ZodFieldValidation path={jsonPath} localValue={localValue} />
		</Fieldset>
	);
};
