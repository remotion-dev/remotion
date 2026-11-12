import type {UndoRequest, UndoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {updateSequencePropsForEffectEdit} from '../sequence-props-watchers';
import {popUndo} from '../undo-stack';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const undoHandler: ApiHandler<UndoRequest, UndoResponse> = ({
	input,
	remotionRoot,
}) => {
	return withSourceFileWriteQueue(() => {
		const result = popUndo();
		return result.success
			? {
					...result,
					...updateSequencePropsForEffectEdit(
						input.sequenceProps ?? [],
						remotionRoot,
					),
				}
			: result;
	});
};
