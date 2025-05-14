import type {WhisperWebModel} from './constants';
import {deleteObject} from './db/delete-object';
import {getModelUrl} from './get-model-url';

export const deleteModel = async (model: WhisperWebModel) => {
	const url = getModelUrl(model);
	await deleteObject({key: url});
};
