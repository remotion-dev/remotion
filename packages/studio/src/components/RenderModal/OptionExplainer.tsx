import type {AnyRemotionOption} from '@remotion/renderer';
import React from 'react';
import {INPUT_BACKGROUND} from '../../helpers/colors';
import {MenuDivider} from '../Menu/MenuDivider';
import {Spacing} from '../layout';
import {CliCopyButton} from './CliCopyButton';

const container: React.CSSProperties = {
	fontSize: 14,
	paddingTop: 10,
	paddingBottom: 10,
	backgroundColor: INPUT_BACKGROUND,
};

const padding: React.CSSProperties = {
	paddingLeft: 20,
	paddingRight: 20,
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
	textDecoration: 'none',
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

const flexSpacer: React.CSSProperties = {
	display: 'flex',
	flex: 1,
};

const copyWrapper: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'flex-end',
};

export const OptionExplainer: React.FC<{
	readonly option: AnyRemotionOption<unknown>;
}> = ({option}) => {
	return (
		<div style={container} className="__remotion-info-button-container">
			<div style={padding}>
				<div>
					<strong style={title}>{option.name}</strong>
					<Spacing x={1} />
					<a style={link} href={option.docLink} target="_blank">
						Docs
					</a>
				</div>
				<div style={description}>{option.description('ssr')}</div>
			</div>
			<Spacing y={0.5} block />
			<MenuDivider />
			<Spacing y={0.5} block />
			<div>
				<div style={infoRow}>
					<div style={infoRowLabel}>CLI flag</div>
					<div style={flexSpacer} />
					<code>--{option.cliFlag}</code>
					<div style={copyWrapper}>
						<CliCopyButton valueToCopy={option.cliFlag} />
					</div>
				</div>
				{option.ssrName ? (
					<div style={infoRow}>
						<div style={infoRowLabel}>Node.JS option</div>
						<div style={flexSpacer} />
						<code>{option.ssrName}</code>
						<Spacing x={3.75} />
					</div>
				) : null}
				<div style={infoRow} />
			</div>
		</div>
	);
};
