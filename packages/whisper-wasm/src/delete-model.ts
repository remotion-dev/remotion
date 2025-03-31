import type {WhisperModel} from './constants';
import {deleteObject} from './db/delete-object';
import {getModelUrl} from './get-model-url';

export const deleteModel = async (model: WhisperModel) => {
	const url = getModelUrl(model);
	await deleteObject({key: url});
};
