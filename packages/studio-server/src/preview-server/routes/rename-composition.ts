import {renameComposition} from '@remotion/codemods';
import type {RenameCompositionRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const renameCompositionHandler =
	runCompositionEdit<RenameCompositionRequest>({
		entryType: 'rename-composition',
		getDescription: ({idToRename, newId}) => ({
			undoMessage: `↩️  Rename of composition "${idToRename}" to "${newId}"`,
			redoMessage: `↪️  Rename of composition "${idToRename}" to "${newId}"`,
		}),
		getLogMessage: ({idToRename, newId}) =>
			`Renamed composition "${idToRename}" to "${newId}"`,
		getResult: ({filePath, request}) =>
			renameComposition({
				project: getCompositionEditProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToRename,
				newId: request.newId,
			}),
	});
