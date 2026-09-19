import React, {useCallback, useContext} from 'react';
import {CopyStackTrace} from '../../error-overlay/remotion-overlay/CopyStackTrace';
import {RENDER_STATUS_BACKGROUND} from '../../helpers/colors';
import {SetSelectedModalContext} from '../../state/modals';
import {Button} from '../Button';
import {Flex, SPACING_UNIT} from '../layout';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalContainer} from '../ModalContainer';
import {ModalHeader} from '../ModalHeader';

const container: React.CSSProperties = {
	padding: 20,
	maxWidth: 900,
	paddingTop: 0,
};

const codeBlock: React.CSSProperties = {
	backgroundColor: RENDER_STATUS_BACKGROUND,
	whiteSpace: 'pre',
	padding: 12,
	borderRadius: 4,
	fontFamily: 'monospace',
	overflow: 'auto',
	maxHeight: 300,
};

const spacer: React.CSSProperties = {
	height: SPACING_UNIT,
	width: SPACING_UNIT,
};

const buttonRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
};

export const QueueJobErrorModal: React.FC<{
	readonly title: string;
	readonly error: {message: string; stack: string | null};
}> = ({title, error}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const onClose = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	const errorDetails = error.stack?.split('\n')[0].includes(error.message)
		? error.stack
		: [error.message, error.stack].filter(Boolean).join('\n');

	return (
		<ModalContainer
			ariaLabel={title}
			onOutsideClick={onClose}
			onEscape={onClose}
		>
			<ModalHeader title={title} />
			<div style={container}>
				<p>The job failed because of the following error:</p>
				<div className={HORIZONTAL_SCROLLBAR_CLASSNAME} style={codeBlock}>
					{errorDetails}
				</div>
				<div style={spacer} />
				<div style={buttonRow}>
					<CopyStackTrace errorText={errorDetails} />
					<Flex />
					<Button onClick={onClose}>Close</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
