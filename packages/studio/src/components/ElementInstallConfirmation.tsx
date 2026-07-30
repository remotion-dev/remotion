import React from 'react';
import {
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	WARNING_COLOR,
	WHITE,
	WHITE_ALPHA_08,
	WHITE_ALPHA_12,
} from '../helpers/colors';
import {WarningTriangle} from './NewComposition/ValidationMessage';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 20,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const introductionStyle: React.CSSProperties = {
	margin: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const elementNameStyle: React.CSSProperties = {
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	fontWeight: 600,
	lineHeight: 1.5,
};

const sourceStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'baseline',
	gap: 8,
	minWidth: 0,
	flexWrap: 'wrap',
};

const sourceLabelStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 500,
	lineHeight: 1.4,
};

const sourceValueStyle: React.CSSProperties = {
	minWidth: 0,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.4,
	overflowWrap: 'anywhere',
};

const unverifiedSourceValueStyle: React.CSSProperties = {
	...sourceValueStyle,
	color: WARNING_COLOR,
};

const sectionStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 10,
};

const sectionHeaderStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: 12,
	minWidth: 0,
};

const sectionTitleStyle: React.CSSProperties = {
	margin: 0,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 600,
	lineHeight: 1.4,
};

const sectionDescriptionStyle: React.CSSProperties = {
	margin: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.4,
};

const metadataStyle: React.CSSProperties = {
	margin: 0,
	borderTop: `1px solid ${WHITE_ALPHA_08}`,
	borderBottom: `1px solid ${WHITE_ALPHA_08}`,
};

const metadataRowStyle: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '100px minmax(0, 1fr)',
	alignItems: 'baseline',
	gap: 12,
	paddingTop: 9,
	paddingBottom: 9,
};

const metadataRowWithBorderStyle: React.CSSProperties = {
	...metadataRowStyle,
	borderTop: `1px solid ${WHITE_ALPHA_08}`,
};

const metadataTermStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 500,
	lineHeight: 1.4,
};

const metadataDescriptionStyle: React.CSSProperties = {
	margin: 0,
	minWidth: 0,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 400,
	lineHeight: 1.4,
	overflowWrap: 'anywhere',
};

const codeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.4,
};

const overwriteStyle: React.CSSProperties = {
	color: WARNING_COLOR,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 500,
	lineHeight: 1.4,
};

const dependencyListStyle: React.CSSProperties = {
	margin: 0,
	padding: 0,
	borderTop: `1px solid ${WHITE_ALPHA_08}`,
	listStyleType: 'none',
};

const dependencyRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: 16,
	minWidth: 0,
	paddingTop: 8,
	paddingBottom: 8,
	borderBottom: `1px solid ${WHITE_ALPHA_08}`,
};

const dependencyNameStyle: React.CSSProperties = {
	minWidth: 0,
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.4,
	overflowWrap: 'anywhere',
};

const dependencyInstallStatusStyle: React.CSSProperties = {
	flexShrink: 0,
	color: WARNING_COLOR,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 500,
	lineHeight: 1.4,
};

const dependencyAvailableStatusStyle: React.CSSProperties = {
	...dependencyInstallStatusStyle,
	color: LIGHT_TEXT,
};

const warningStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'flex-start',
	gap: 10,
	minWidth: 0,
};

const warningIconStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	marginTop: 1,
	flexShrink: 0,
	fill: WARNING_COLOR,
};

const warningMessageStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 2,
	minWidth: 0,
};

const warningTitleStyle: React.CSSProperties = {
	margin: 0,
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 600,
	lineHeight: 1.4,
};

const warningDescriptionStyle: React.CSSProperties = {
	margin: 0,
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 400,
	lineHeight: 1.5,
};

const sourceDetailsStyle: React.CSSProperties = {
	paddingTop: 2,
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.4,
};

const sourceSummaryStyle: React.CSSProperties = {
	cursor: 'pointer',
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.4,
};

const sourceCodeBlockStyle: React.CSSProperties = {
	marginTop: 10,
	marginBottom: 0,
	maxHeight: 240,
	overflow: 'auto',
	padding: 12,
	border: `1px solid ${WHITE_ALPHA_12}`,
	borderRadius: 6,
	backgroundColor: INPUT_BACKGROUND,
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.5,
	whiteSpace: 'pre',
};

const sourceCodeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const makeSourceControlsVisible = (sourceCode: string) => {
	return sourceCode.replace(
		/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,
		(character) => {
			return `\\u${character.codePointAt(0)?.toString(16).padStart(4, '0')}`;
		},
	);
};

export const ElementInstallConfirmation: React.FC<{
	readonly displayName: string;
	readonly sourceLabel: string;
	readonly sourceIsUnverified: boolean;
	readonly compositionId: string;
	readonly filePath: string;
	readonly overwritesExistingFile: boolean;
	readonly dependenciesToReview: string[];
	readonly missingPackages: string[];
	readonly sourceCode: string;
}> = ({
	displayName,
	sourceLabel,
	sourceIsUnverified,
	compositionId,
	filePath,
	overwritesExistingFile,
	dependenciesToReview,
	missingPackages,
	sourceCode,
}) => {
	return (
		<div style={container}>
			<div style={sectionStyle}>
				<p style={introductionStyle}>
					Review what will be added to your project before installing{' '}
					<span style={elementNameStyle}>{displayName}</span>.
				</p>
				<div style={sourceStyle}>
					<div style={sourceLabelStyle}>Request source</div>
					<div
						style={
							sourceIsUnverified ? unverifiedSourceValueStyle : sourceValueStyle
						}
					>
						{sourceLabel}
					</div>
				</div>
			</div>

			<section style={sectionStyle} aria-labelledby="element-install-location">
				<div style={sectionHeaderStyle}>
					<h3 id="element-install-location" style={sectionTitleStyle}>
						Installation
					</h3>
				</div>
				<dl style={metadataStyle}>
					<div style={metadataRowStyle}>
						<dt style={metadataTermStyle}>Composition</dt>
						<dd style={metadataDescriptionStyle}>
							<code style={codeStyle}>{compositionId}</code>
						</dd>
					</div>
					<div style={metadataRowWithBorderStyle}>
						<dt style={metadataTermStyle}>Destination</dt>
						<dd style={metadataDescriptionStyle}>
							<code style={codeStyle}>{filePath}</code>
						</dd>
					</div>
					{overwritesExistingFile ? (
						<div style={metadataRowWithBorderStyle}>
							<dt style={metadataTermStyle}>File change</dt>
							<dd style={overwriteStyle}>Replace existing source file</dd>
						</div>
					) : null}
				</dl>
			</section>

			<section
				style={sectionStyle}
				aria-labelledby="element-install-dependencies"
			>
				<div style={sectionHeaderStyle}>
					<h3 id="element-install-dependencies" style={sectionTitleStyle}>
						Element dependencies
					</h3>
					<p style={sectionDescriptionStyle}>
						{missingPackages.length === 0
							? 'No packages will be installed.'
							: `${missingPackages.length} package${missingPackages.length === 1 ? '' : 's'} will be installed.`}
					</p>
				</div>
				{dependenciesToReview.length > 0 ? (
					<ul style={dependencyListStyle} role="list">
						{dependenciesToReview.map((packageName) => {
							const willInstall = missingPackages.includes(packageName);
							return (
								<li key={packageName} style={dependencyRowStyle}>
									<div style={dependencyNameStyle}>{packageName}</div>
									<div
										style={
											willInstall
												? dependencyInstallStatusStyle
												: dependencyAvailableStatusStyle
										}
									>
										{willInstall ? 'Will install' : 'Available'}
									</div>
								</li>
							);
						})}
					</ul>
				) : null}
			</section>

			<div style={warningStyle}>
				<WarningTriangle style={warningIconStyle} />
				<div style={warningMessageStyle}>
					<p style={warningTitleStyle}>Review before installing</p>
					<p style={warningDescriptionStyle}>
						This adds executable source code to your project. Package lifecycle
						scripts may also run during installation, with access to your files
						and the network.
					</p>
				</div>
			</div>

			<details style={sourceDetailsStyle}>
				<summary style={sourceSummaryStyle}>Review Element source</summary>
				<pre style={sourceCodeBlockStyle}>
					<code style={sourceCodeStyle}>
						{makeSourceControlsVisible(sourceCode)}
					</code>
				</pre>
			</details>
		</div>
	);
};
