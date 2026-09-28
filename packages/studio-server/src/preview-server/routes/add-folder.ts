import {addFolder} from '@remotion/codemods';
import type {AddFolderRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const addFolderHandler = runCompositionEdit<AddFolderRequest>({
	entryType: 'new-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Creation of folder "${folderPath}"`,
			redoMessage: `↪️  Creation of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Created folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		addFolder({
			project: getCompositionEditProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
		}),
});
