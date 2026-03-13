import type {RedoRequest, RedoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {popRedo} from '../undo-stack';

export const redoHandler: ApiHandler<RedoRequest, RedoResponse> = () => {
	return Promise.resolve(popRedo());
};
