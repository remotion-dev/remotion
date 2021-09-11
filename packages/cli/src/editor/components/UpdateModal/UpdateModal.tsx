import React, {useCallback, useContext} from 'react';
import {SELECTED_BACKGROUND} from '../../helpers/colors';
import {copyCmd} from '../../helpers/copy-text';
import {ModalsContext} from '../../state/modals';
import {CopyButton} from '../CopyButton';
import {Flex, Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {UpdateInfo} from '../UpdateCheck';

const container: React.CSSProperties = {
	padding: 20,
	paddingTop: 0,
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

export const UpdateModal: React.FC<{
	info: UpdateInfo;
}> = ({info}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const command =
		info.packageManager === 'yarn' ? 'yarn upgrade' : 'npm run upgrade';

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title="Update available" />
			<div style={container}>
				<p>A new update to Remotion is available! Run the following command:</p>
				<Row align="center">
					<Flex>
						<pre onClick={() => copyCmd('yarn upgrade')} style={code}>
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
