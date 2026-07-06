import type {AnyRemotionOption} from '@remotion/renderer';
import React from 'react';
import {BLUE, INPUT_BACKGROUND, WHITE} from '../../helpers/colors';
import {Spacing} from '../layout';
import {MenuDivider} from '../Menu/MenuDivider';
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

const DESCRIPTION_FONT_SIZE_PX = 14;

const description: React.CSSProperties = {
	fontSize: DESCRIPTION_FONT_SIZE_PX,
	maxWidth: 400,
};

const link: React.CSSProperties = {
	fontSize: 14,
	maxWidth: 200,
	color: BLUE,
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
	color: WHITE,
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
					{option.docLink ? (
						<>
							<Spacing x={1} />
							<a style={link} href={option.docLink} target="_blank">
								Docs
							</a>
						</>
					) : null}
				</div>
				<div style={description}>
					<style>
						{`
							.__remotion-option-explainer-description a,
							.__remotion-option-explainer-description code {
								font-size: ${DESCRIPTION_FONT_SIZE_PX}px;
							}
						`}
					</style>
					<div className="__remotion-option-explainer-description">
						{option.description('ssr')}
					</div>
				</div>
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
