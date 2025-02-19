import React from 'react';
import {useMobileLayout} from '../helpers/mobile-layout';

const icon: React.CSSProperties = {
	display: 'flex',
	width: 36,
	height: 36,
	justifyContent: 'center',
	alignItems: 'center',
	margin: 0,
};

const outer: React.CSSProperties = {
	textAlign: 'center',
	display: 'flex',
	alignItems: 'center',
	flexDirection: 'column',
	color: 'var(--ifm-font-color-base)',
	cursor: 'pointer',
	filter: 'drop-shadow(0px 0px 4px var(--background))',
	textDecoration: 'none',
};

const labelStyle: React.CSSProperties = {
	fontSize: 12,
};

export const TemplateIcon: React.FC<{
	readonly label: string;
	readonly children: React.ReactNode;
}> = ({children, label}) => {
	const mobileLayout = useMobileLayout();

	return (
		<span style={outer}>
			<div style={icon}>{children}</div>
			{mobileLayout ? null : <div style={labelStyle}>{label}</div>}
		</span>
	);
};
