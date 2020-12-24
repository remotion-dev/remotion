import React, {useCallback, useContext} from 'react';
import {PreviewSize, PreviewSizeContext} from '../state/preview-size';

export const SizeSelector: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setSize(e.target.value as PreviewSize);
		},
		[setSize]
	);

	return (
		<div>
			<select onChange={onChange} value={size}>
				<option value="auto">Fit</option>
				<option value="0.25">25%</option>
				<option value="0.5">50%</option>
				<option value="1">100%</option>
			</select>
		</div>
	);
};
