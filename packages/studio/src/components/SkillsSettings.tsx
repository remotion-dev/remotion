import React, {useCallback, useMemo} from 'react';
import {
	BLUE,
	BORDER_WHITE_ALPHA_12,
	LIGHT_TEXT,
	WHITE,
} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {CheckCircleFilled} from '../icons/check-circle-filled';
import {ClipboardIcon} from '../icons/clipboard';
import {Minus} from '../icons/minus';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {useSettings} from './SettingsContext';

const INSTALL_COMMAND = 'npx remotion skills add';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	fontFamily: 'sans-serif',
	minWidth: 0,
	padding: 16,
	paddingBottom: 32,
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
};

const commandField: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: 'rgba(0, 0, 0, 0.22)',
	borderRadius: 4,
	display: 'flex',
	marginTop: 8,
	padding: '5px 6px 5px 9px',
};

const command: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: '24px',
	margin: 0,
	minWidth: 0,
	overflowX: 'auto',
	whiteSpace: 'pre',
};

const copyIcon: React.CSSProperties = {
	height: 12,
	width: 12,
};

const list: React.CSSProperties = {
	marginTop: 14,
};

const skillRow: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: BORDER_WHITE_ALPHA_12,
	display: 'flex',
	gap: 10,
	minHeight: 38,
	padding: '0 10px',
};

const lastSkillRow: React.CSSProperties = {
	...skillRow,
	borderBottom: 'none',
};

const statusIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 14,
	width: 14,
};

const skillName: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.4,
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const status: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: 1.4,
	whiteSpace: 'nowrap',
};

const loading: React.CSSProperties = {
	...description,
	marginTop: 14,
};

export const SkillsSettings: React.FC = () => {
	const {error, remotionSkillsInfo} = useSettings();
	const installedSkills = useMemo(() => {
		return (
			remotionSkillsInfo?.skills.filter(
				({installedGlobally, installedInProject}) =>
					installedGlobally || installedInProject,
			).length ?? 0
		);
	}, [remotionSkillsInfo]);
	const missingSkills =
		(remotionSkillsInfo?.skills.length ?? 0) - installedSkills;

	const onCopy = useCallback(() => {
		copyText(INSTALL_COMMAND).catch((err) => {
			showNotification(`Could not copy: ${err.message}`, 2000);
		});
	}, []);
	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon color={color} style={copyIcon} />;
	}, []);

	return (
		<div style={container}>
			{remotionSkillsInfo === null && error === null ? (
				<p style={loading}>Checking installed skills...</p>
			) : null}
			{remotionSkillsInfo === null && error ? (
				<div style={{marginTop: 14}}>
					<ValidationMessage message={error} align="flex-start" type="error" />
				</div>
			) : null}
			{missingSkills > 0 ? (
				<div>
					<p style={description}>
						Not all skills are installed. Run this command in the project
						directory, then reload Studio and restart your coding agent.
					</p>
					<div style={commandField}>
						<pre style={command}>{INSTALL_COMMAND}</pre>
						<InlineAction
							variant={null}
							onClick={onCopy}
							renderAction={renderCopyAction}
							title="Copy install command"
						/>
					</div>
				</div>
			) : null}
			{remotionSkillsInfo ? (
				<div style={list} role="list" aria-label="Remotion Agent Skills">
					{remotionSkillsInfo.skills.map((skill, index) => {
						const installed =
							skill.installedInProject || skill.installedGlobally;
						const installedLocation =
							skill.installedInProject && skill.installedGlobally
								? 'Project and global'
								: skill.installedInProject
									? 'Project'
									: skill.installedGlobally
										? 'Global'
										: 'Not installed';

						return (
							<div
								key={skill.name}
								role="listitem"
								style={
									index === remotionSkillsInfo.skills.length - 1
										? lastSkillRow
										: skillRow
								}
							>
								{installed ? (
									<CheckCircleFilled
										aria-hidden
										style={{...statusIcon, fill: BLUE}}
									/>
								) : (
									<Minus aria-hidden color={LIGHT_TEXT} style={statusIcon} />
								)}
								<span style={skillName}>/{skill.name}</span>
								<span style={status}>{installedLocation}</span>
							</div>
						);
					})}
				</div>
			) : null}
		</div>
	);
};
