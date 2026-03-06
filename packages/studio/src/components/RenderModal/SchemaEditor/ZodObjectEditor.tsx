import React, {useMemo, useState} from 'react';
import {fieldsetLabel} from '../layout';
import {Fieldset} from './Fieldset';
import {useLocalState} from './local-state';
import {SchemaLabel} from './SchemaLabel';
import {SchemaSeparationLine} from './SchemaSeparationLine';
import {SchemaVerticalGuide} from './SchemaVerticalGuide';
import type {AnyZodSchema} from './zod-schema-type';
import {getObjectShape, getZodSchemaType} from './zod-schema-type';
import type {JSONPath} from './zod-types';
import type {UpdaterFunction} from './ZodSwitch';
import {ZodSwitch} from './ZodSwitch';

export type ObjectDiscrimatedUnionReplacement = {
	discriminator: string;
	markup: React.ReactNode;
};

export const ZodObjectEditor: React.FC<{
	readonly schema: AnyZodSchema;
	readonly jsonPath: JSONPath;
	readonly value: Record<string, unknown>;
	readonly setValue: UpdaterFunction<Record<string, unknown>>;
	readonly onRemove: null | (() => void);
	readonly mayPad: boolean;
	readonly discriminatedUnionReplacement: ObjectDiscrimatedUnionReplacement | null;
}> = ({
	schema,
	jsonPath,
	setValue,
	value,
	onRemove,
	mayPad,
	discriminatedUnionReplacement,
}) => {
	const [expanded, setExpanded] = useState(true);
	const {localValue, onChange} = useLocalState({
		schema,
		setValue,
		value,
	});

	const typeName = getZodSchemaType(schema);
	if (typeName !== 'object') {
		throw new Error('expected object');
	}

	const shape = getObjectShape(schema);
	const keys = Object.keys(shape);

	const isRoot = jsonPath.length === 0;

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
					jsonPath={jsonPath}
					onRemove={onRemove}
					suffix={suffix}
					valid={localValue.zodValidation.success}
					handleClick={() => setExpanded(!expanded)}
				/>
			)}

			{expanded ? (
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
											false,
										);
									}}
									onRemove={null}
								/>
								{i === keys.length - 1 ? null : <SchemaSeparationLine />}
							</React.Fragment>
						);
					})}
				</SchemaVerticalGuide>
			) : null}
			{isRoot || !expanded ? null : <div style={fieldsetLabel}>{'}'}</div>}
		</Fieldset>
	);
};
