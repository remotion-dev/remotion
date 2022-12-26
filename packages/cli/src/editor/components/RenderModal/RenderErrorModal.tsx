import React, {useCallback, useContext} from 'react';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {ModalsContext} from '../../state/modals';
import {SPACING_UNIT} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {notificationCenter} from '../Notifications/NotificationCenter';
import {removeRenderJob} from '../RenderQueue/actions';

const container: React.CSSProperties = {
	padding: 20,
	maxWidth: 1200,
	paddingTop: 0,
};

const codeBlock: React.CSSProperties = {
	backgroundColor: 'black',
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

export const RenderErrorModal: React.FC<{job: RenderJob}> = ({job}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onClickOnRemove = useCallback(() => {
		setSelectedModal(null);
		removeRenderJob(job).catch((err) => {
			notificationCenter.current?.addNotification({
				content: 'Failed to remove render job: ' + err.message,
				created: Date.now(),
				duration: 2000,
				id: String(Math.random()),
			});
			console.log(err);
		});
	}, [job, setSelectedModal]);

	if (job.status !== 'failed') {
		throw new Error('should not have rendered this modal');
	}

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${job.compositionId}`} />
			<div style={container}>
				<p>The render failed because of the following error:</p>
				<div style={codeBlock}>{job.error.stack}</div>
				<div style={spacer} />
				<div style={buttonRow}>
					<Button onClick={onClickOnRemove}>Remove render</Button>
					<div style={spacer} />
					<Button onClick={onQuit}>Close</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
