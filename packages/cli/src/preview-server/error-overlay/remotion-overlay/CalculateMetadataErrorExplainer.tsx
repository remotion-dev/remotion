import React from 'react';
import {inlineCodeSnippet} from '../../../editor/components/Menu/styles';
import {BORDER_COLOR} from '../../../editor/helpers/colors';

export const CalculateMetadataErrorExplainer: React.FC<{}> = () => {
	return (
		<div style={style}>
			This error occured while calling{' '}
			<code style={inlineCodeSnippet}>calculateMetadata()</code>.
		</div>
	);
};

const style: React.CSSProperties = {
	borderRadius: 3,
	color: 'white',
	padding: 12,
	backgroundColor: BORDER_COLOR,
	fontSize: 14,
	fontFamily: 'sans-serif',
};
