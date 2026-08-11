import type {UndoRequest, UndoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {popUndo} from '../undo-stack';

export const undoHandler: ApiHandler<UndoRequest, UndoResponse> = () => {
	return Promise.resolve(popUndo());
};
