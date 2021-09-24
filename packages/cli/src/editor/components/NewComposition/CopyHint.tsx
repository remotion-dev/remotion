import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

const style: React.CSSProperties = {
	fontSize: 12,
	color: LIGHT_TEXT,
};

export const CopyHint: React.FC = () => {
	return (
		<div style={style}>
			Copy this into <br /> your src/Video.tsx file.
		</div>
	);
};
