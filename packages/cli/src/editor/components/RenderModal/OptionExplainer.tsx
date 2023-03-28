import type {RemotionOption} from '@remotion/renderer';
import React from 'react';
import {Spacing} from '../layout';
import {MenuDivider} from '../Menu/MenuDivider';
import {CliCopyButton} from './CliCopyButton';

const container: React.CSSProperties = {
	fontSize: 14,
	paddingTop: 10,
	paddingBottom: 10,
};

const padding: React.CSSProperties = {
	paddingLeft: 12,
	paddingRight: 12,
};

const title: React.CSSProperties = {
	fontSize: 14,
};

const description: React.CSSProperties = {
	fontSize: 14,
	maxWidth: 400,
};

const link: React.CSSProperties = {
	fontSize: 14,
	maxWidth: 200,
	color: '#0b84f3',
	wordWrap: 'break-word',
};

const infoRow: React.CSSProperties = {
	...padding,
	fontSize: 14,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const infoRowLabel: React.CSSProperties = {
	width: 150,
	fontSize: 14,
	color: 'white',
};

export const OptionExplainer: React.FC<{
	option: RemotionOption;
}> = ({option}) => {
	return (
		<div style={container} className="__remotion-info-button-container">
			<div style={padding}>
				<div>
					<strong style={title}>{option.name}</strong>
				</div>
				<div style={description}>{option.description}</div>
			</div>
			<Spacing y={0.5} block />
			<MenuDivider />
			<Spacing y={0.5} block />
			<div>
				<div style={infoRow}>
					<div style={infoRowLabel}>CLI flag:</div>
					<code>{option.cliFlag}</code>
					<div style={{display: 'flex', justifyContent: 'flex-end', flex: 1}}>
						<CliCopyButton valueToCopy={option.cliFlag} />
					</div>
				</div>
				<div style={infoRow}>
					<div style={infoRowLabel}>Node.JS option:</div>
					<code>{option.ssrName}</code>
				</div>
				<div style={infoRow}>
					<a style={link} href={option.docLink} target="_blank">
						Docs
					</a>
				</div>
			</div>
		</div>
	);
};
