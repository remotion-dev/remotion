import {deleteComposition} from '@remotion/codemods';
import type {DeleteCompositionRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const deleteCompositionHandler =
	runCompositionEdit<DeleteCompositionRequest>({
		entryType: 'delete-composition',
		getDescription: ({idToDelete}) => ({
			undoMessage: `↩️  Deletion of composition "${idToDelete}"`,
			redoMessage: `↪️  Deletion of composition "${idToDelete}"`,
		}),
		getLogMessage: ({idToDelete}) => `Deleted composition "${idToDelete}"`,
		getResult: ({filePath, request}) =>
			deleteComposition({
				project: getCompositionEditProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToDelete,
			}),
	});
