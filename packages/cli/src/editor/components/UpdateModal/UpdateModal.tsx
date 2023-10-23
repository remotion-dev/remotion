import React, {useCallback, useContext, useMemo} from 'react';
import {BLUE, SELECTED_BACKGROUND} from '../../helpers/colors';
import {copyText} from '../../helpers/copy-text';
import {ModalsContext} from '../../state/modals';
import {CopyButton} from '../CopyButton';
import {KnownBugs} from '../KnownBugs';
import {Flex, Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {sendErrorNotification} from '../Notifications/NotificationCenter';
import type {Bug, UpdateInfo} from '../UpdateCheck';

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
	info: UpdateInfo;
	knownBugs: Bug[];
}> = ({info, knownBugs}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const hasKnownBugs = useMemo(() => {
		return knownBugs && knownBugs?.length > 0;
	}, [knownBugs]);

	const command = commands[info.packageManager];

	const onClick = useCallback(() => {
		copyText(command).catch((err) => {
			sendErrorNotification(`Could not copy: ${err.message}`);
		});
	}, [command]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="Update available" />
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
		</ModalContainer>
	);
};
