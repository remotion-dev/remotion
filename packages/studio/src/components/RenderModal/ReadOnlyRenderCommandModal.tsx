import React from 'react';
import {SELECTED_BACKGROUND} from '../../helpers/colors';
import {CopyButton} from '../CopyButton';
import {Flex, Row, Spacing} from '../layout';
import {ModalHeader} from '../ModalHeader';
import {DismissableModal} from '../NewComposition/DismissableModal';

const container: React.CSSProperties = {
	padding: 20,
	paddingTop: 0,
	maxWidth: 760,
};

const text: React.CSSProperties = {
	fontSize: 14,
	lineHeight: 1.5,
};

const title: React.CSSProperties = {
	...text,
	paddingTop: 14,
	paddingBottom: 10,
};

const code: React.CSSProperties = {
	background: SELECTED_BACKGROUND,
	padding: '12px 10px',
	fontSize: 14,
	marginTop: 10,
	marginBottom: 10,
	whiteSpace: 'pre-wrap',
	wordBreak: 'break-word',
};

export const ReadOnlyRenderCommandModal: React.FC<{
	readonly command: string;
}> = ({command}) => {
	return (
		<DismissableModal>
			<ModalHeader title="Render from CLI" />
			<div style={container}>
				<div style={title}>
					The deployed Studio is read-only. Copy this command and run it on your
					machine to render with the current props and settings.
				</div>
				<Row align="center">
					<Flex>
						<pre style={code}>{command}</pre>
					</Flex>
					<Spacing x={1} />
					<CopyButton
						textToCopy={command}
						label="Copy"
						labelWhenCopied="Copied!"
					/>
				</Row>
			</div>
		</DismissableModal>
	);
};
