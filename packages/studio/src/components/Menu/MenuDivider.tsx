import React from 'react';
import {INPUT_BORDER_COLOR_HOVERED} from '../../helpers/colors';

const menuDivider: React.CSSProperties = {
	marginTop: 4,
	marginBottom: 4,
	height: 1,
	backgroundColor: INPUT_BORDER_COLOR_HOVERED,
};

export const MenuDivider: React.FC = () => {
	return <div style={menuDivider} />;
};
