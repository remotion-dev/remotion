import type {RedoRequest, RedoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {updateSequencePropsForEffectEdit} from '../sequence-props-watchers';
import {popRedo} from '../undo-stack';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const redoHandler: ApiHandler<RedoRequest, RedoResponse> = ({
	input,
	remotionRoot,
}) => {
	return withSourceFileWriteQueue(() => {
		const result = popRedo();
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
