import {updateCompositionMetadata} from '@remotion/codemods';
import type {UpdateCompositionMetadataRequest} from '@remotion/studio-shared';
import {
	getCompositionEditProject,
	runCompositionEdit,
} from './run-composition-edit';

export const updateCompositionMetadataHandler =
	runCompositionEdit<UpdateCompositionMetadataRequest>({
		entryType: 'update-composition-metadata',
		getDescription: ({idToUpdate}) => ({
			undoMessage: `↩️  Update of metadata of composition "${idToUpdate}"`,
			redoMessage: `↪️  Update of metadata of composition "${idToUpdate}"`,
		}),
		getLogMessage: ({idToUpdate}) =>
			`Updated metadata of composition "${idToUpdate}"`,
		getResult: ({filePath, request}) =>
			updateCompositionMetadata({
				project: getCompositionEditProject(filePath),
				compositionFile: filePath,
				compositionId: request.idToUpdate,
				metadata: {
					width: request.newWidth ?? undefined,
					height: request.newHeight ?? undefined,
					fps: request.newFps ?? undefined,
					durationInFrames: request.newDurationInFrames ?? undefined,
				},
			}),
	});
