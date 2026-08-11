import {useCallback, useContext} from 'react';
import {Internals, type StaticFile} from 'remotion';
import {renameStaticFile} from '../../api/rename-static-file';
import {replaceUrl} from '../../helpers/url-state';
import {showNotification} from '../Notifications/NotificationCenter';

export const getStaticFileParent = (relativePath: string) => {
	const slashIndex = relativePath.lastIndexOf('/');
	return slashIndex === -1 ? '' : relativePath.slice(0, slashIndex);
};

export const getStaticFileBaseName = (relativePath: string) => {
	const slashIndex = relativePath.lastIndexOf('/');
	return slashIndex === -1 ? relativePath : relativePath.slice(slashIndex + 1);
};

export const getStaticFileRenameSelection = (
	fileName: string,
): [number, number] => {
	const dotIndex = fileName.lastIndexOf('.');
	return [0, dotIndex > 0 ? dotIndex : fileName.length];
};

export const getRenamedStaticFilePath = ({
	newName,
	relativePath,
}: {
	readonly newName: string;
	readonly relativePath: string;
}) => {
	const parent = getStaticFileParent(relativePath);
	return [parent, newName].filter(Boolean).join('/');
};

export const validateStaticFileRename = ({
	newName,
	newRelativePath,
	relativePath,
	staticFiles,
}: {
	readonly newName: string;
	readonly newRelativePath: string;
	readonly relativePath: string;
	readonly staticFiles: StaticFile[];
}) => {
	const trimmedName = newName.trim();
	if (trimmedName.length === 0) {
		return 'Name cannot be empty';
	}

	if (trimmedName !== newName) {
		return 'Name cannot start or end with whitespace';
	}

	if (newName.includes('/') || newName.includes('\\')) {
		return 'Name cannot include slashes';
	}

	const existingFile = staticFiles.find((file) => {
		return file.name === newRelativePath && file.name !== relativePath;
	});

	if (existingFile) {
		return 'An asset with this name already exists';
	}

	return null;
};

export const useRenameStaticFile = ({
	relativePath,
	staticFiles,
}: {
	readonly relativePath: string;
	readonly staticFiles: StaticFile[];
}) => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);

	return useCallback(
		async (newName: string) => {
			const newRelativePath = getRenamedStaticFilePath({
				newName,
				relativePath,
			});

			if (newRelativePath === relativePath) {
				return true;
			}

			const validationMessage = validateStaticFileRename({
				newName,
				newRelativePath,
				relativePath,
				staticFiles,
			});

			if (validationMessage) {
				showNotification(validationMessage, 2000);
				return false;
			}

			const notification = showNotification(
				`Renaming ${relativePath}...`,
				null,
			);

			try {
				await renameStaticFile({
					oldRelativePath: relativePath,
					newRelativePath,
				});

				if (
					canvasContent?.type === 'asset' &&
					canvasContent.asset === relativePath
				) {
					setCanvasContent({type: 'asset', asset: newRelativePath});
					replaceUrl(`/assets/${newRelativePath}`);
				}

				notification.replaceContent(`Renamed to ${newRelativePath}`, 2000);
				return true;
			} catch (err) {
				notification.replaceContent(
					`Could not rename ${relativePath}: ${(err as Error).message}`,
					3000,
				);
				return false;
			}
		},
		[canvasContent, relativePath, setCanvasContent, staticFiles],
	);
};
