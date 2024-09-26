import React, {useCallback, useMemo} from 'react';
import {BLUE, SELECTED_BACKGROUND} from '../../helpers/colors';
import {copyText} from '../../helpers/copy-text';
import {CopyButton} from '../CopyButton';
import {KnownBugs} from '../KnownBugs';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';
import {showNotification} from '../Notifications/NotificationCenter';
import type {Bug, UpdateInfo} from '../UpdateCheck';
import {Flex, Row, Spacing} from '../layout';

const container: React.CSSProperties = {
	padding: 20,
	paddingTop: 0,
};

const text: React.CSSProperties = {
	fontSize: 14,
};

const title: React.CSSProperties = {
	paddingTop: 12,
	paddingBottom: 8,
	...text,
};

const code: React.CSSProperties = {
	background: SELECTED_BACKGROUND,
	padding: '12px 10px',
	fontSize: 14,
	marginTop: 10,
	marginBottom: 10,
};

const link: React.CSSProperties = {
	fontWeight: 'bold',
	color: BLUE,
	textDecoration: 'none',
	...text,
};

const commands: {[key in UpdateInfo['packageManager']]: string} = {
	npm: 'npx remotion upgrade',
	yarn: 'yarn remotion upgrade',
	pnpm: 'pnpm exec remotion upgrade',
	bun: 'bun remotion upgrade',
	unknown: 'npx remotion upgrade',
};

export const UpdateModal: React.FC<{
	readonly info: UpdateInfo;
	readonly knownBugs: Bug[];
}> = ({info, knownBugs}) => {
	const hasKnownBugs = useMemo(() => {
		return knownBugs && knownBugs?.length > 0;
	}, [knownBugs]);

	const command = commands[info.packageManager];

	const onClick = useCallback(() => {
		copyText(command).catch((err) => {
			showNotification(`Could not copy: ${err.message}`, 2000);
		});
	}, [command]);

	return (
		<DismissableModal>
			<ModalHeader title="Update available" />
			<div style={container}>
				{hasKnownBugs ? (
					<>
						<div style={title}>
							The currently installed version {info.currentVersion} has the
							following known bugs:
						</div>
						<KnownBugs bugs={knownBugs as Bug[]} />
						<div style={{height: '20px'}} />
						<div style={text}>To upgrade, run the following command:</div>
					</>
				) : (
					<div style={title}>
						A new update for Remotion is available! Run the following command:
					</div>
				)}
				<Row align="center">
					<Flex>
						<pre onClick={onClick} style={code}>
							{command}
						</pre>
					</Flex>
					<Spacing x={1} />
					<CopyButton
						textToCopy={command}
						label="Copy"
						labelWhenCopied="Copied!"
					/>
				</Row>
				<div style={text}>
					This will upgrade Remotion from {info.currentVersion} to{' '}
					{info.latestVersion}.
				</div>
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
			</div>
		</DismissableModal>
	);
};
