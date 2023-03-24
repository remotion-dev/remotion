import {useState} from 'react';
import type {z} from 'remotion';
import {RemotionInput} from '../../NewComposition/RemInput';
import {label, optionRow} from '../layout';
import type {JSONPath} from './zod-types';

export const ZodStringEditor: React.FC<{
	schema: z.ZodTypeAny;
	jsonPath: JSONPath;
}> = ({jsonPath}) => {
	const [value, setValue] = useState('');

	return (
		<div style={optionRow}>
			<div style={label}>{jsonPath[jsonPath.length - 1]}</div>
			<RemotionInput
				value={value}
				status="ok"
				placeholder={jsonPath.join('.')}
				onChange={(e) => {
					setValue(e.target.value);
				}}
			/>
		</div>
	);
};
