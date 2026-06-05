import React, {useCallback, useContext, useState} from 'react';
import {deleteStaticFile} from '../../api/delete-static-file';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Row, Spacing} from '../layout';
import {inlineCodeSnippet} from '../Menu/styles';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {DismissableModal} from './DismissableModal';

const content: React.CSSProperties = {
	padding: 16,
	fontSize: 14,
	flex: 1,
	minWidth: 500,
};

export const DeleteStaticFileModal: React.FC<{
	readonly relativePath: string;
}> = ({relativePath}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const [submitting, setSubmitting] = useState(false);

	const onDelete = useCallback(() => {
		setSubmitting(true);
		const notification = showNotification(`Deleting ${relativePath}...`, null);

		deleteStaticFile(relativePath)
			.then(() => {
				setSelectedModal(null);
				notification.replaceContent(`Deleted ${relativePath}`, 2000);
			})
			.catch((err) => {
				setSubmitting(false);
				notification.replaceContent(
					`Could not delete ${relativePath}: ${(err as Error).message}`,
					3000,
				);
			});
	}, [relativePath, setSelectedModal]);

	return (
		<DismissableModal>
			<ModalHeader title={'Delete asset'} />
			<div style={content}>
				Do you want to delete the asset{' '}
				<code style={inlineCodeSnippet}>{relativePath}</code> from your public
				folder?
			</div>
			<ModalFooterContainer>
				<Row align="center" justify="flex-end">
					<Button onClick={() => setSelectedModal(null)}>Cancel</Button>
					<Spacing x={1} />
					<Button onClick={onDelete} disabled={submitting}>
						Delete
					</Button>
				</Row>
			</ModalFooterContainer>
		</DismissableModal>
	);
};
