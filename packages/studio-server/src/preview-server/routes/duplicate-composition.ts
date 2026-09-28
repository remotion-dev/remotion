import {duplicateComposition} from '@remotion/codemods';
import type {DuplicateCompositionRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const duplicateCompositionHandler =
	runCompositionEdit<DuplicateCompositionRequest>({
		entryType: 'duplicate-composition',
		getDescription: ({idToDuplicate, newId}) => ({
			undoMessage: `↩️  Duplication of composition "${idToDuplicate}" to "${newId}"`,
			redoMessage: `↪️  Duplication of composition "${idToDuplicate}" to "${newId}"`,
		}),
		getLogMessage: ({idToDuplicate, newId}) =>
			`Duplicated composition "${idToDuplicate}" to "${newId}"`,
		getResult: ({filePath, request}) =>
			duplicateComposition({
				project: getCompositionEditProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToDuplicate,
				newId: request.newId,
				tag: request.tag,
				metadata: {
					width: request.newWidth ?? undefined,
					height: request.newHeight ?? undefined,
					fps:
						request.tag === 'Still' ? undefined : (request.newFps ?? undefined),
					durationInFrames:
						request.tag === 'Still'
							? undefined
							: (request.newDurationInFrames ?? undefined),
				},
			}),
	});
