import React from 'react';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';

const FONT_SIZE = 13;

const container: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	gap: 10,
	minWidth: 0,
};

const packageDetails: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const packageName: React.CSSProperties = {
	color: WHITE,
	display: 'block',
	fontFamily: 'monospace',
	fontSize: FONT_SIZE,
	lineHeight: 1.4,
	overflow: 'hidden',
	textDecoration: 'none',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const descriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: FONT_SIZE,
	lineHeight: 1.4,
};

const status: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: 1.4,
	whiteSpace: 'nowrap',
};

export const InstallablePackageComp: React.FC<{
	readonly isInstalled: boolean;
	readonly pkg: string;
	readonly link: string;
	readonly description: string;
}> = ({isInstalled, pkg, link, description}) => {
	return (
		<div style={container}>
			<div style={packageDetails}>
				<a href={link} style={packageName} target="_blank">
					{pkg}
				</a>
				<div style={descriptionStyle}>{description}</div>
			</div>
			<span style={status}>{isInstalled ? 'Installed' : 'Not installed'}</span>
		</div>
	);
};
