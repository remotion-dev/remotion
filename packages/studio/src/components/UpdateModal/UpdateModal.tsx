import React, {useCallback, useMemo} from 'react';
import {
	BLUE,
	LIGHT_TEXT,
	SELECTED_BACKGROUND,
	WHITE,
} from '../../helpers/colors';
import {copyText} from '../../helpers/copy-text';
import {ClipboardIcon} from '../../icons/clipboard';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {KnownBugs} from '../KnownBugs';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {showNotification} from '../Notifications/NotificationCenter';
import type {Bug, UpdateInfo} from '../UpdateCheck';

const container: React.CSSProperties = {
	padding: '0 16px 8px',
};

const panelStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: 'hidden',
};

const text: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
};

const title: React.CSSProperties = {
	paddingTop: 12,
	paddingBottom: 8,
	...text,
};

const commandField: React.CSSProperties = {
	alignItems: 'center',
	background: SELECTED_BACKGROUND,
	borderRadius: 6,
	boxSizing: 'border-box',
	display: 'flex',
	marginBottom: 10,
	marginTop: 10,
	padding: '8px 8px 8px 10px',
	width: '100%',
};

const code: React.CSSProperties = {
	color: WHITE,
	flex: 1,
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
	minWidth: 0,
	overflowX: 'auto',
	whiteSpace: 'pre',
};

const copyIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 12,
	width: 12,
};

const link: React.CSSProperties = {
	...text,
	fontWeight: 'bold',
	color: BLUE,
	textDecoration: 'none',
};

const commands: {[key in UpdateInfo['packageManager']]: string} = {
	npm: 'npx remotion upgrade',
	yarn: 'yarn remotion upgrade',
	pnpm: 'pnpm exec remotion upgrade',
	bun: 'bun remotion upgrade',
	unknown: 'npx remotion upgrade',
};

const skillsUpdateCommand = 'npx remotion skills update';
const remotionUpgradeSkill = '/remotion-upgrade';

export const UpdateModal: React.FC<{
	readonly info: UpdateInfo;
	readonly knownBugs: Bug[];
}> = ({info, knownBugs}) => {
	const hasKnownBugs = useMemo(() => {
		return knownBugs && knownBugs?.length > 0;
	}, [knownBugs]);

	const updateAction = info.remotionUpgradeSkillAvailable
		? remotionUpgradeSkill
		: info.updateAvailable
			? commands[info.packageManager]
			: skillsUpdateCommand;
	const updateActionType = info.remotionUpgradeSkillAvailable
		? 'skill'
		: 'command';

	const onClick = useCallback(() => {
		copyText(updateAction).catch((err) => {
			showNotification(`Could not copy: ${err.message}`, 2000);
		});
	}, [updateAction]);

	const renderCopyAction: RenderInlineAction = useCallback((color) => {
		return <ClipboardIcon color={color} style={copyIcon} />;
	}, []);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title="Update available" />
			<div style={container}>
				{hasKnownBugs && info.updateAvailable ? (
					<>
						<div style={title}>
							The currently installed version {info.currentVersion} has the
							following known bugs:
						</div>
						<KnownBugs bugs={knownBugs as Bug[]} />
						<div style={{height: '20px'}} />
						<div style={text}>
							To upgrade, run the following {updateActionType}:
						</div>
					</>
				) : info.updateAvailable ? (
					<div style={title}>
						A new update for Remotion is available! Run the following{' '}
						{updateActionType}:
					</div>
				) : (
					<div style={title}>
						Your Remotion Agent Skills are out of date. Run the following{' '}
						{updateActionType}:
					</div>
				)}
				<div style={commandField}>
					<pre style={code}>{updateAction}</pre>
					<InlineAction
						variant={null}
						onClick={onClick}
						renderAction={renderCopyAction}
						title="Copy command"
					/>
				</div>
				{info.updateAvailable ? (
					<div style={text}>
						This will upgrade Remotion from {info.currentVersion} to{' '}
						{info.latestVersion}
						{info.skillsUpdateAvailable
							? ' and update your project Remotion Agent Skills.'
							: '.'}
					</div>
				) : null}
				{info.updateAvailable ? (
					<div style={text}>
						Read the{' '}
						<a
							style={link}
							target="_blank"
							href="https://github.com/remotion-dev/remotion/releases"
						>
							Release notes
						</a>{' '}
						to know what{"'s"} new in Remotion.
					</div>
				) : null}
			</div>
		</DismissableModal>
	);
};
