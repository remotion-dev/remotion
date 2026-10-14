import type {UndoRequest, UndoResponse} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {popUndo} from '../undo-stack';
import {withSourceFileWriteQueue} from './source-file-write-queue';

export const undoHandler: ApiHandler<UndoRequest, UndoResponse> = () => {
	return withSourceFileWriteQueue(() => popUndo());
};
