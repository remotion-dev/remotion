import React, {useCallback} from 'react';
import {useRecoilState} from 'recoil';
import {previewSizeState} from '../state/preview-size';

export const SizeSelector: React.FC = () => {
	const [, setSize] = useRecoilState(previewSizeState);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setSize(e.target.value);
		},
		[setSize]
	);

	return (
		<div>
			<select onChange={onChange}>
				<option value="0.25">25%</option>
				<option value="0.5">50%</option>
				<option value="1">100%</option>
			</select>
		</div>
	);
};
