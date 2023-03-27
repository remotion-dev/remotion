import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'remotion';
import {Spacing} from '../../layout';
import {InputDragger} from '../../NewComposition/InputDragger';
import {RightAlignInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {label, optionRow, rightRow} from '../layout';
import type {JSONPath} from './zod-types';

type LocalState = {
	value: string;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const getMinValue = (schema: z.ZodTypeAny) => {
	const minCheck = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'min'
	);
	if (!minCheck) {
		return -Infinity;
	}

	if (minCheck.kind !== 'min') {
		throw new Error('Expected min check');
	}

	if (!minCheck.inclusive) {
		return -Infinity;
	}

	return minCheck.value;
};

const getMaxValue = (schema: z.ZodTypeAny) => {
	const maxCheck = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'max'
	);
	if (!maxCheck) {
		return Infinity;
	}

	if (maxCheck.kind !== 'max') {
		throw new Error('Expected max check');
	}

	if (!maxCheck.inclusive) {
		return Infinity;
	}

	return maxCheck.value;
};

const getStep = (schema: z.ZodTypeAny): number | undefined => {
	const multipleStep = (schema as z.ZodNumber)._def.checks.find(
		(c) => c.kind === 'multipleOf'
	);

	if (!multipleStep) {
		return undefined;
	}

	if (multipleStep.kind !== 'multipleOf') {
		throw new Error('Expected multipleOf check');
	}

	return multipleStep.value;
};

export const ZodNumberEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: number;
	setValue: React.Dispatch<React.SetStateAction<number>>;
	compact: boolean;
}> = ({jsonPath, value, schema, setValue, compact}) => {
	const [localValue, setLocalValue] = useState<LocalState>(() => {
		return {
			value: String(value),
			zodValidation: schema.safeParse(value),
		};
	});

	const onChange = useCallback(
		(newValue: string) => {
			const safeParse = schema.safeParse(Number(newValue));
			const newLocalState: LocalState = {
				value: newValue,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(Number(newValue));
			}
		},
		[schema, setValue]
	);

	const onValueChange = useCallback(
		(newValue: number) => {
			const safeParse = schema.safeParse(newValue);
			const newLocalState: LocalState = {
				value: String(newValue),
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(newValue);
			}
		},
		[schema, setValue]
	);

	const style = useMemo(() => {
		if (compact) {
			return {...optionRow, paddingLeft: 0, paddingRight: 0};
		}

		return optionRow;
	}, [compact]);

	// TODO: Error message does not align well

	return (
		<div style={style}>
			<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
			<div style={rightRow}>
				<RightAlignInput>
					<InputDragger
						type={'number'}
						value={localValue.value}
						status={localValue.zodValidation.success ? 'ok' : 'error'}
						placeholder={jsonPath.join('.')}
						onTextChange={onChange}
						onValueChange={onValueChange}
						min={getMinValue(schema)}
						max={getMaxValue(schema)}
						step={getStep(schema)}
					/>
				</RightAlignInput>
				{!localValue.zodValidation.success && (
					<>
						<Spacing y={1} block />
						<ValidationMessage
							align="flex-end"
							message={localValue.zodValidation.error.format()._errors[0]}
							type="error"
						/>
					</>
				)}
			</div>
		</div>
	);
};
