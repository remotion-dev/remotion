import React from 'react';

const menuDivider: React.CSSProperties = {
	marginTop: 4,
	marginBottom: 4,
	height: 1,
	backgroundColor: 'rgba(255, 255, 255, 0.05)',
};

export const MenuDivider: React.FC = () => {
	return <div style={menuDivider} />;
};
