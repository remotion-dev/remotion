import React, {useCallback, useContext, useMemo} from 'react';
import {SELECTED_BACKGROUND} from '../../helpers/colors';
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

const title: React.CSSProperties = {
	paddingTop: 12,
	paddingBottom: 8,
};

const code: React.CSSProperties = {
	background: SELECTED_BACKGROUND,
	padding: '12px 10px',
	fontSize: 17,
	marginTop: 10,
	marginBottom: 10,
};

const link: React.CSSProperties = {
	fontWeight: 'bold',
	color: 'inherit',
	textDecoration: 'none',
};

const commands: {[key in UpdateInfo['packageManager']]: string} = {
	npm: 'npm run upgrade',
	yarn: 'yarn upgrade',
	pnpm: 'pnpm run upgrade',
	unknown: 'npm run upgrade',
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

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="Update available" />
			<div style={container}>
				{hasKnownBugs ? (
					<>
						<div style={title}>Known bugs in {info.currentVersion}:</div>
						<KnownBugs bugs={knownBugs as Bug[]} />
						<div style={{height: '20px'}} />
						Run the followin command:
					</>
				) : (
					<p>
						A new update for Remotion is availale! Run the following command:
					</p>
				)}
				<Row align="center">
					<Flex>
						<pre
							onClick={() =>
								copyText(command).catch((err) => {
									sendErrorNotification(`Could not copy: ${err.message}`);
								})
							}
							style={code}
						>
							{command}
						</pre>
					</Flex>
					<Spacing x={1} />
					<CopyButton
						textToCopy={command}
						label="Copy command"
						labelWhenCopied="Copied!"
					/>
				</Row>
				<p>
					This will upgrade Remotion from {info.currentVersion} to{' '}
					{info.latestVersion}.
				</p>
				<p>
					Read the{' '}
					<a
						style={link}
						target="_blank"
						href="https://github.com/remotion-dev/remotion/releases"
					>
						Release notes
					</a>{' '}
					to know what{"'s"} new in Remotion.
				</p>
			</div>
		</ModalContainer>
	);
};
