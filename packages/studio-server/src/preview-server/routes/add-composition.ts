import type {AddCompositionRequest} from '@remotion/studio-shared';
import {addCompositionToFile} from '../../codemods/add-composition-to-file';
import {runCompositionEdit} from './run-composition-edit';

export const addCompositionHandler = runCompositionEdit<AddCompositionRequest>({
	entryType: 'new-composition',
	getDescription: ({options}) => ({
		undoMessage: `↩️  Creation of composition "${options.newId}"`,
		redoMessage: `↪️  Creation of composition "${options.newId}"`,
	}),
	getLogMessage: ({options}) => `Created composition "${options.newId}"`,
	getResult: ({filePath, request}) =>
		addCompositionToFile({filePath, options: request.options}),
});
