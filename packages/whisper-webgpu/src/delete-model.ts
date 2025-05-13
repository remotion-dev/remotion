import type {WhisperWebGpuModel} from './constants';
import {deleteObject} from './db/delete-object';
import {getModelUrl} from './get-model-url';

export const deleteModel = async (model: WhisperWebGpuModel) => {
	const url = getModelUrl(model);
	await deleteObject({key: url});
};
