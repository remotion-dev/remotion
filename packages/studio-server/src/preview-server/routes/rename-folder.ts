import {renameFolder} from '@remotion/codemods';
import type {RenameFolderRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const renameFolderHandler = runCompositionEdit<RenameFolderRequest>({
	entryType: 'rename-folder',
	getDescription: ({folderName, parentName, newName}) => {
		const oldPath = parentName ? `${parentName}/${folderName}` : folderName;
		const newPath = parentName ? `${parentName}/${newName}` : newName;
		return {
			undoMessage: `↩️  Rename of folder "${oldPath}" to "${newPath}"`,
			redoMessage: `↪️  Rename of folder "${oldPath}" to "${newPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Renamed folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		renameFolder({
			project: getCompositionEditProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
			newName: request.newName,
		}),
});
