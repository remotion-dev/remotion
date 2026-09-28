import {moveComposition} from '@remotion/codemods';
import type {MoveCompositionRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
	toCodemodDestination,
} from './run-composition-edit';

export const moveCompositionHandler =
	runCompositionEdit<MoveCompositionRequest>({
		entryType: 'move-composition-or-folder',
		getDescription: ({compositionId}) => ({
			undoMessage: `↩️  Move of composition "${compositionId}"`,
			redoMessage: `↪️  Move of composition "${compositionId}"`,
		}),
		getLogMessage: ({compositionId}) => `Moved composition "${compositionId}"`,
		getResult: ({filePath, request}) =>
			moveComposition({
				project: getCompositionEditProject(filePath),
				compositionFile: filePath,
				compositionId: request.compositionId,
				destination: toCodemodDestination(request.destination),
			}),
	});
