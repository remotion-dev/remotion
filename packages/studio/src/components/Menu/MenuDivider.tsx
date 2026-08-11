import React from 'react';
import {WHITE_ALPHA_05} from '../../helpers/colors';

const menuDivider: React.CSSProperties = {
	marginTop: 4,
	marginBottom: 4,
	height: 1,
	backgroundColor: WHITE_ALPHA_05,
};

export const MenuDivider: React.FC = () => {
	return <div style={menuDivider} />;
};
