import React from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';
import {RENDER_STATUS_INDICATOR_SIZE} from './CircularProgress';

const iconStyle: React.CSSProperties = {
	height: RENDER_STATUS_INDICATOR_SIZE,
	width: RENDER_STATUS_INDICATOR_SIZE,
};

export const SuccessIcon: React.FC = () => {
	return (
		<svg style={iconStyle} viewBox="0 0 512 512">
			<path
				fill={LIGHT_TEXT}
				d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM369 209L241 337l-17 17-17-17-64-64-17-17L160 222.1l17 17 47 47L335 175l17-17L385.9 192l-17 17z"
			/>
		</svg>
	);
};
