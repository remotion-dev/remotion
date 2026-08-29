import React from 'react';
import {WHITE_ALPHA_50} from '../../helpers/colors';

const sectionHeader: React.CSSProperties = {
	color: WHITE_ALPHA_50,
	fontSize: 10,
	lineHeight: '12px',
	paddingBottom: 2,
	paddingLeft: 8,
	paddingRight: 8,
	paddingTop: 6,
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

export const MenuSectionHeader: React.FC<{
	readonly children: string;
}> = ({children}) => {
	return <div style={sectionHeader}>{children}</div>;
};
