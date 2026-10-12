import type React from 'react';
import {TRANSPARENT, WHITE_ALPHA_20} from '../../helpers/colors';

export const timelinePremountStyle: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	height: '100%',
	background: `repeating-linear-gradient(
		-45deg,
		${TRANSPARENT},
		${TRANSPARENT} 2px,
		${WHITE_ALPHA_20} 2px,
		${WHITE_ALPHA_20} 4px
	)`,
};
