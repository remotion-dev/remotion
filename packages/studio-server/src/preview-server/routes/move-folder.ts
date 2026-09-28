import {moveFolder} from '@remotion/codemods';
import type {MoveFolderRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
	toCodemodDestination,
} from './run-composition-edit';

export const moveFolderHandler = runCompositionEdit<MoveFolderRequest>({
	entryType: 'move-composition-or-folder',
	getDescription: ({folderName, parentName}) => {
		const folderPath = parentName ? `${parentName}/${folderName}` : folderName;
		return {
			undoMessage: `↩️  Move of folder "${folderPath}"`,
			redoMessage: `↪️  Move of folder "${folderPath}"`,
		};
	},
	getLogMessage: ({folderName, parentName}) =>
		`Moved folder "${parentName ? `${parentName}/${folderName}` : folderName}"`,
	getResult: ({filePath, request}) =>
		moveFolder({
			project: getCompositionEditProject(filePath),
			compositionFile: filePath,
			folder: {name: request.folderName, parentName: request.parentName},
			destination: toCodemodDestination(request.destination),
		}),
});
