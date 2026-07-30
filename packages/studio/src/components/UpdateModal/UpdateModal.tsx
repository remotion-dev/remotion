import React, {useCallback, useMemo} from 'react';
import {BLUE, LIGHT_TEXT, SELECTED_BACKGROUND} from '../../helpers/colors';
import {copyText} from '../../helpers/copy-text';
import {CopyButton} from '../CopyButton';
import {KnownBugs} from '../KnownBugs';
import {Flex, Row, Spacing} from '../layout';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {showNotification} from '../Notifications/NotificationCenter';
import type {Bug, UpdateInfo} from '../UpdateCheck';

const container: React.CSSProperties = {
	padding: 20,
	paddingTop: 0,
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

const code: React.CSSProperties = {
	background: SELECTED_BACKGROUND,
	color: LIGHT_TEXT,
	fontFamily: 'monospace',
	padding: '12px 10px',
	fontSize: 14,
	lineHeight: 1.5,
	marginTop: 10,
	marginBottom: 10,
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

	return (
		<DismissableModal>
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
				<Row align="center">
					<Flex>
						<pre onClick={onClick} style={code}>
							{updateAction}
						</pre>
					</Flex>
					<Spacing x={1} />
					<CopyButton
						textToCopy={updateAction}
						label="Copy"
						labelWhenCopied="Copied!"
					/>
				</Row>
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
