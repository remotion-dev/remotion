import {PreviewSize} from '@remotion/player';
import React, {useCallback, useContext, useMemo} from 'react';
import {
	persistPreviewSizeOption,
	PreviewSizeContext,
} from '../state/preview-size';
import {CONTROL_BUTTON_PADDING} from './ControlButton';

export const SizeSelector: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			setSize(() => {
				persistPreviewSizeOption(e.target.value as PreviewSize);
				return e.target.value as PreviewSize;
			});
		},
		[setSize]
	);

	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

	return (
		<div style={style}>
			<select
				aria-label="Select the size of the preview"
				onChange={onChange}
				value={size}
			>
				<option value="auto">Fit</option>
				<option value="0.25">25%</option>
				<option value="0.5">50%</option>
				<option value="1">100%</option>
			</select>
		</div>
	);
};
