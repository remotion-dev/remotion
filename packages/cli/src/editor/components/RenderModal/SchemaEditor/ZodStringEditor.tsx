import {useCallback} from 'react';
import type {z} from 'remotion';
import {RemotionInput} from '../../NewComposition/RemInput';
import {label, optionRow} from '../layout';
import type {JSONPath} from './zod-types';

export const ZodStringEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
	value: string;
	setValue: (value: string) => void;
}> = ({jsonPath, value, setValue}) => {
	const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setValue(e.target.value);
		},
		[setValue]
	);

	return (
		<div style={optionRow}>
			<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
			<RemotionInput
				value={value}
				status="ok"
				placeholder={jsonPath.join('.')}
				onChange={onChange}
			/>
		</div>
	);
};
