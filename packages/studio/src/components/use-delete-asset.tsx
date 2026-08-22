import {useCallback} from 'react';
import {deleteStaticFile} from '../api/delete-static-file';
import {useConfirmationDialog} from './ConfirmationDialog';
import {inlineCodeSnippet} from './Menu/styles';
import {showNotification} from './Notifications/NotificationCenter';

export const useDeleteAsset = (relativePath: string | null) => {
	const confirm = useConfirmationDialog();

	return useCallback(() => {
		if (relativePath === null) {
			return;
		}

		confirm({
			title: 'Delete asset',
			message: (
				<>
					Do you want to delete the asset{' '}
					<code style={inlineCodeSnippet}>{relativePath}</code> from your public
					folder?
				</>
			),
			confirmLabel: 'Delete',
		})
			.then((confirmed) => {
				if (!confirmed) {
					return;
				}

				const notification = showNotification(
					`Deleting ${relativePath}...`,
					null,
				);

				deleteStaticFile(relativePath)
					.then(() => {
						notification.replaceContent(`Deleted ${relativePath}`, 2000);
					})
					.catch((err) => {
						notification.replaceContent(
							`Could not delete ${relativePath}: ${(err as Error).message}`,
							3000,
						);
					});
			})
			.catch((err) => {
				showNotification(
					`Could not delete ${relativePath}: ${(err as Error).message}`,
					3000,
				);
			});
	}, [confirm, relativePath]);
};
