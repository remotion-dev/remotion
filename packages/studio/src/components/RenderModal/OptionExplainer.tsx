import type {AnyRemotionOption} from '@remotion/renderer';
import React from 'react';
import {BLUE, INPUT_BACKGROUND, LIGHT_TEXT, WHITE} from '../../helpers/colors';
import {Spacing} from '../layout';
import {MenuDivider} from '../Menu/MenuDivider';
import {CliCopyButton} from './CliCopyButton';

export type OptionExplainerOption = Pick<
	AnyRemotionOption<unknown>,
	'name' | 'description' | 'docLink' | 'ssrName'
> & {
	readonly cliFlag?: string;
};

const container: React.CSSProperties = {
	fontSize: 14,
	paddingTop: 10,
	paddingBottom: 10,
	backgroundColor: INPUT_BACKGROUND,
	color: WHITE,
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
	color: LIGHT_TEXT,
	fontSize: DESCRIPTION_FONT_SIZE_PX,
	lineHeight: 1.5,
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

export type OptionExplainerInfoRow = {
	readonly label: string;
	readonly value: string;
};

export const OptionExplainer: React.FC<{
	readonly option: OptionExplainerOption;
	readonly extraInfoRows?: readonly OptionExplainerInfoRow[];
	readonly showApiOption?: boolean;
	readonly showCliFlag?: boolean;
}> = ({
	option,
	extraInfoRows = [],
	showApiOption = true,
	showCliFlag = true,
}) => {
	const shouldShowApiOption = showApiOption && option.ssrName !== null;
	const shouldShowCliFlag = showCliFlag && option.cliFlag !== undefined;
	const hasInfoRows =
		extraInfoRows.length > 0 || shouldShowCliFlag || shouldShowApiOption;

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
							.__remotion-option-explainer-description,
							.__remotion-option-explainer-description * {
								color: inherit;
								font-size: ${DESCRIPTION_FONT_SIZE_PX}px;
								line-height: inherit;
							}

							.__remotion-option-explainer-description a {
								color: ${BLUE};
								text-decoration: none;
							}

							.__remotion-option-explainer-description code {
								color: ${BLUE};
								font-family: monospace;
							}
						`}
					</style>
					<div className="__remotion-option-explainer-description">
						{option.description('ssr')}
					</div>
				</div>
			</div>
			{hasInfoRows ? (
				<>
					<Spacing y={0.5} block />
					<MenuDivider />
					<Spacing y={0.5} block />
					<div>
						{extraInfoRows.map((row) => (
							<div key={row.label} style={infoRow}>
								<div style={infoRowLabel}>{row.label}</div>
								<div style={flexSpacer} />
								<code>{row.value}</code>
								<div style={copyWrapper}>
									<CliCopyButton valueToCopy={row.value} />
								</div>
							</div>
						))}
						{shouldShowCliFlag ? (
							<div style={infoRow}>
								<div style={infoRowLabel}>CLI flag</div>
								<div style={flexSpacer} />
								<code>--{option.cliFlag}</code>
								<div style={copyWrapper}>
									<CliCopyButton valueToCopy={option.cliFlag} />
								</div>
							</div>
						) : null}
						{shouldShowApiOption ? (
							<div style={infoRow}>
								<div style={infoRowLabel}>API option</div>
								<div style={flexSpacer} />
								<code>{option.ssrName}</code>
								<Spacing x={3.75} />
							</div>
						) : null}
						<div style={infoRow} />
					</div>
				</>
			) : null}
		</div>
	);
};
