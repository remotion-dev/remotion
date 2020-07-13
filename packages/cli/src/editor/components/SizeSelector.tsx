import React, {useCallback} from 'react';
import {useRecoilState} from 'recoil';
import {previewSizeState} from '../state/preview-size';

export const SizeSelector: React.FC = () => {
	const [value, setValue] = useRecoilState(previewSizeState);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setValue(e.target.value);
		},
		[setValue]
	);

	return (
		<div>
			<select onChange={onChange}>
				<option selected={value === 'auto'} value="auto">
					Fit
				</option>
				<option selected={value === '0.25'} value="0.25">
					25%
				</option>
				<option selected={value === '0.5'} value="0.5">
					50%
				</option>
				<option selected={value === '1'} value="1">
					100%
				</option>
			</select>
		</div>
	);
};
