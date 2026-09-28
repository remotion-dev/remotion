import {unwrapFolder} from '@remotion/codemods';
import type {UnwrapFolderRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const unwrapFolderHandler = runCompositionEdit<UnwrapFolderRequest>({
	entryType: 'delete-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Deletion of folder "${folderPath}"`,
			redoMessage: `↪️  Deletion of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Deleted folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		unwrapFolder({
			project: getCompositionEditProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
		}),
});
