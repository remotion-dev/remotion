import React, {useCallback, useMemo, useState} from 'react';
import {z} from 'remotion';
import {
	FAIL_COLOR,
	INPUT_BORDER_COLOR_UNHOVERED,
	LIGHT_TEXT,
} from '../../../helpers/colors';
import {Spacing} from '../../layout';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {optionRow} from '../layout';
import type {JSONPath} from './zod-types';
import {ZodSwitch} from './ZodSwitch';

const container: React.CSSProperties = {
	width: '100%',
};

const fullWidth: React.CSSProperties = {
	width: '100%',
};

const fieldsetLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	paddingLeft: 10,
	paddingRight: 10,
	display: 'flex',
	flexDirection: 'row',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	width: '100%',
};

const flex: React.CSSProperties = {
	flex: 1,
};

type LocalState = {
	value: unknown[];
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
	revision: number;
};

export const ZodArrayEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: unknown[];
	setValue: (value: unknown[]) => void;
}> = ({schema, jsonPath, setValue: updateValue, value}) => {
	const [localValue, setLocalValue] = useState<LocalState>({
		value,
		zodValidation: schema.safeParse(value),
		revision: 0,
	});

	const def = schema._def;

	const typeName = def.typeName as z.ZodFirstPartyTypeKind;
	if (typeName !== z.ZodFirstPartyTypeKind.ZodArray) {
		throw new Error('expected object');
	}

	const isRoot = jsonPath.length === 0;
	const Element = isRoot ? 'div' : 'fieldset';

	const {paddingLeft, paddingTop} = optionRow;

	const fieldset: React.CSSProperties = useMemo(() => {
		return {
			borderRadius: 4,
			borderColor: localValue.zodValidation.success
				? INPUT_BORDER_COLOR_UNHOVERED
				: FAIL_COLOR,
		};
	}, [localValue.zodValidation.success]);

	const onChange = useCallback(
		(newValue: unknown[], incrementRevision: boolean) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
				// TODO: Use callback function to increment
				revision: localValue.revision + (incrementRevision ? 1 : 0),
			};
			setLocalValue(newLocalState);

			if (safeParse.success) {
				updateValue(newValue);
			}
		},
		[localValue.revision, schema, updateValue]
	);

	return (
		<div style={isRoot ? undefined : {paddingLeft, paddingTop}}>
			<div style={fullWidth}>
				<Element style={fieldset}>
					{isRoot ? null : (
						<legend style={fieldsetLabel}>
							{jsonPath[jsonPath.length - 1]}
							<Spacing x={1} />
							{!localValue.zodValidation.success && (
								<ValidationMessage
									align="flex-end"
									message={localValue.zodValidation.error.format()._errors[0]}
									type="error"
								/>
							)}
						</legend>
					)}
					<div style={isRoot ? undefined : container}>
						{localValue.value.map((child, i) => {
							return (
								<div // eslint-disable-next-line react/no-array-index-key
									key={`${i}${localValue.revision}`}
									style={row}
								>
									<button
										onClick={(e) => {
											e.preventDefault();
											onChange(
												[...value.slice(0, i), ...value.slice(i + 1)],
												true
											);
										}}
										type="button"
									>
										remove
									</button>
									<div style={flex}>
										<ZodSwitch
											jsonPath={[...jsonPath, i]}
											schema={def.type}
											value={child}
											setValue={(val) => {
												onChange(
													[...value.slice(0, i), val, ...value.slice(i + 1)],
													false
												);
											}}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</Element>
			</div>
		</div>
	);
};
