import React, {useCallback, useMemo, useState} from 'react';
import type {z} from 'remotion';
import {Spacing} from '../../layout';
import {RemotionInput} from '../../NewComposition/RemInput';
import {ValidationMessage} from '../../NewComposition/ValidationMessage';
import {label, optionRow} from '../layout';
import type {JSONPath} from './zod-types';

type LocalState = {
	value: string;
	zodValidation: z.SafeParseReturnType<unknown, unknown>;
};

const fullWidth: React.CSSProperties = {
	width: '100%',
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

	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			const safeParse = schema.safeParse(e.target.valueAsNumber);
			const newLocalState: LocalState = {
				value: e.target.value,
				zodValidation: safeParse,
			};
			setLocalValue(newLocalState);
			if (safeParse.success) {
				setValue(e.target.valueAsNumber);
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

	return (
		<div style={style}>
			<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
			<div style={fullWidth}>
				<RemotionInput
					value={localValue.value}
					status={localValue.zodValidation.success ? 'ok' : 'error'}
					type={'number'}
					placeholder={jsonPath.join('.')}
					onChange={onChange}
				/>
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
