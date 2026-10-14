import type {RedoRequest, RedoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {popRedo} from '../undo-stack';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const redoHandler: ApiHandler<RedoRequest, RedoResponse> = () => {
	return withSourceFileWriteQueue(() => popRedo());
};
