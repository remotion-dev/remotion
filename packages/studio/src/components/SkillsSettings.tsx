import type {GetRemotionSkillsInfoResponse} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {BLACK_ALPHA_22, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {getFileManagerName} from '../helpers/get-file-manager-name';
import {canEditStudioConfig} from '../helpers/settings-tab-availability';
import {useCopyFeedback} from '../helpers/use-copy-feedback';
import {BookIcon} from '../icons/book';
import {CaretDown} from '../icons/caret';
import {CloudDownloadIcon} from '../icons/cloud-download';
import {CopyIcon} from '../icons/copy';
import {FinderIcon} from '../icons/finder';
import {SkillsIcon} from '../icons/skills';
import {TrashIcon} from '../icons/trash';
import {callApi} from './call-api';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';
import {useSettings} from './SettingsContext';
import {Spinner} from './Spinner';

const INSTALL_COMMAND = 'npx remotion skills add';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	fontFamily: 'sans-serif',
	minWidth: 0,
	padding: '16px 16px 0',
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: 0,
};

const commandField: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: BLACK_ALPHA_22,
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
	display: 'flex',
	gap: 10,
	minHeight: 38,
};

const skillIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 16,
	width: 16,
};

const skillName: React.CSSProperties = {
	color: LIGHT_TEXT,
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

const actionIcon: React.CSSProperties = {
	height: 14,
	width: 14,
};

const loading: React.CSSProperties = {
	...description,
	marginTop: 14,
};

export const SkillSettingsRow: React.FC<{
	readonly skill: GetRemotionSkillsInfoResponse['skills'][number];
}> = ({skill}) => {
	const {
		installSkill,
		removeSkill,
		upgradeSkill,
		skillAction,
		remotionSkillsInfo,
	} = useSettings();
	const installations = useMemo(
		() =>
			(remotionSkillsInfo?.installations ?? []).filter(
				({name}) => name === skill.name,
			),
		[remotionSkillsInfo, skill.name],
	);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canManageSkills = canEditStudioConfig({
		isBrowserStudio: getBrowserStudioOperations() !== null,
		previewServerConnected: previewServerState.type === 'connected',
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});
	const installed = skill.installedInProject || skill.installedGlobally;
	const upgradeAvailable = installations.some(({outdated}) => outdated);
	const processingThisSkill = skillAction?.skill === skill.name;
	const installedLocation =
		skill.installedInProject && skill.installedGlobally
			? 'Project and global'
			: skill.installedInProject
				? 'Project'
				: skill.installedGlobally
					? 'Global'
					: null;
	const menuItems = useMemo((): ComboboxValue[] => {
		const items: ComboboxValue[] = [];
		if (canManageSkills && installed && upgradeAvailable) {
			items.push({
				id: 'delete',
				value: 'delete',
				type: 'item',
				label: 'Delete',
				leftItem: <TrashIcon color={LIGHT_TEXT} style={actionIcon} />,
				disabled: skillAction !== null,
				onClick: () => removeSkill(skill.name),
				keyHint: null,
				quickSwitcherLabel: null,
				subMenu: null,
			});
		}

		if (canManageSkills) {
			const fileManagerName = getFileManagerName(
				window.remotion_fileSystemPlatform,
			);
			for (const installation of installations) {
				const label =
					installations.length > 1
						? `Open ${installation.scope} skill in ${fileManagerName}`
						: `Open in ${fileManagerName}`;
				items.push({
					id: `open-${installation.scope}`,
					value: `open-${installation.scope}`,
					type: 'item',
					label,
					leftItem:
						window.remotion_fileSystemPlatform === 'darwin' ? (
							<FinderIcon size={16} />
						) : null,
					disabled: skillAction !== null,
					onClick: () => {
						callApi('/api/open-remotion-skill', {
							skill: skill.name,
							scope: installation.scope,
						}).catch((err: Error) => {
							showNotification(`Could not open skill: ${err.message}`, 3000);
						});
					},
					keyHint: null,
					quickSwitcherLabel: null,
					subMenu: null,
				});
			}
		}

		items.push({
			id: 'docs',
			value: 'docs',
			type: 'item',
			label: 'View docs',
			leftItem: <BookIcon color={LIGHT_TEXT} style={actionIcon} />,
			onClick: () => {
				window.open(
					`https://www.remotion.dev/skills#${skill.name}`,
					'_blank',
					'noopener,noreferrer',
				);
			},
			keyHint: null,
			quickSwitcherLabel: null,
			subMenu: null,
		});
		return items;
	}, [
		canManageSkills,
		installed,
		installations,
		removeSkill,
		skill.name,
		skillAction,
		upgradeAvailable,
	]);
	const segments = useMemo((): SegmentedButtonSegment[] => {
		const result: SegmentedButtonSegment[] = [];
		if (canManageSkills) {
			const actionLabel = upgradeAvailable
				? 'Upgrade'
				: installed
					? 'Delete'
					: 'Install';
			result.push({
				ariaLabel: `${actionLabel} ${skill.name}`,
				buttonId: null,
				disabled: skillAction !== null,
				idleColor: LIGHT_TEXT,
				onClick: () =>
					upgradeAvailable
						? upgradeSkill(skill.name)
						: installed
							? removeSkill(skill.name)
							: installSkill(skill.name),
				onPointerDown: null,
				renderContent: (color) =>
					processingThisSkill ? (
						<Spinner duration={0.5} size={14} />
					) : installed && !upgradeAvailable ? (
						<TrashIcon color={color} style={actionIcon} />
					) : (
						<>
							<CloudDownloadIcon color={color} style={actionIcon} />
							{upgradeAvailable ? (
								<span
									style={{fontSize: 12, lineHeight: '16px', color: 'inherit'}}
								>
									Upgrade
								</span>
							) : null}
						</>
					),
				segmentId: 'primary',
				style: upgradeAvailable
					? {columnGap: 4, padding: '0 4px'}
					: {padding: 0, width: 24},
				tooltipLabel: actionLabel,
				type: 'action',
			});
		}

		result.push({
			ariaLabel: `More actions for ${skill.name}`,
			buttonId: null,
			disabled: false,
			idleColor: LIGHT_TEXT,
			leaveLeftSpace: true,
			onOpenChange: null,
			renderContent: (color) => <CaretDown color={color} />,
			segmentId: 'secondary',
			selectedId: null,
			style: {padding: 0, width: 20},
			tooltipLabel: 'More actions',
			type: 'menu',
			values: menuItems,
		});
		return result;
	}, [
		canManageSkills,
		installSkill,
		installed,
		menuItems,
		processingThisSkill,
		removeSkill,
		skill.name,
		skillAction,
		upgradeAvailable,
		upgradeSkill,
	]);

	return (
		<div role="listitem" style={skillRow}>
			<SkillsIcon aria-hidden color={LIGHT_TEXT} style={skillIcon} />
			<span style={skillName}>/{skill.name}</span>
			{processingThisSkill ? (
				<span style={status}>
					{skillAction.type === 'installing'
						? 'Installing…'
						: skillAction.type === 'upgrading'
							? 'Upgrading…'
							: 'Removing…'}
				</span>
			) : installedLocation ? (
				<span style={status}>
					{installedLocation}
					{upgradeAvailable ? ' · Out of date' : ''}
				</span>
			) : null}
			<SegmentedButton segments={segments} style={null} />
		</div>
	);
};

export const SkillsSettings: React.FC = () => {
	const {error, remotionSkillsInfo, skillActionError} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canInstall = canEditStudioConfig({
		isBrowserStudio: getBrowserStudioOperations() !== null,
		previewServerConnected: previewServerState.type === 'connected',
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});
	const {copied, markCopied} = useCopyFeedback();
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
		copyText(INSTALL_COMMAND)
			.then(markCopied)
			.catch((err) => {
				showNotification(`Could not copy: ${err.message}`, 2000);
			});
	}, [markCopied]);
	const renderCopyAction: RenderInlineAction = useCallback(
		(color) => {
			return <CopyIcon copied={copied} color={color} style={copyIcon} />;
		},
		[copied],
	);
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
			{missingSkills > 0 && canInstall ? (
				<p style={description}>
					Install skills in this project to use them with your coding agent.
				</p>
			) : null}
			{skillActionError ? (
				<div style={{marginTop: 14}}>
					<ValidationMessage
						message={skillActionError}
						align="flex-start"
						type="error"
					/>
				</div>
			) : null}
			{missingSkills > 0 && !canInstall ? (
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
							aria-label="Copy install command"
						/>
					</div>
				</div>
			) : null}
			{remotionSkillsInfo ? (
				<div style={list} role="list" aria-label="Remotion Agent Skills">
					{remotionSkillsInfo.skills.map((skill) => {
						return <SkillSettingsRow key={skill.name} skill={skill} />;
					})}
				</div>
			) : null}
		</div>
	);
};
