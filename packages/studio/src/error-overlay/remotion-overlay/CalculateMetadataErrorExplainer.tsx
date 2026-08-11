import React from 'react';
import {inlineCodeSnippet} from '../../components/Menu/styles';
import {BLACK_HEX, WHITE} from '../../helpers/colors';

export const CalculateMetadataErrorExplainer: React.FC<{}> = () => {
	return (
		<div style={style}>
			This error occurred while calling{' '}
			<code style={inlineCodeSnippet}>calculateMetadata()</code>.
		</div>
	);
};

const style: React.CSSProperties = {
	borderRadius: 3,
	color: WHITE,
	padding: 12,
	backgroundColor: BLACK_HEX,
	fontSize: 14,
	fontFamily: 'sans-serif',
};
