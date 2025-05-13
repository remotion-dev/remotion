import type {WhisperWasmModel} from './constants';
import {deleteObject} from './db/delete-object';
import {getModelUrl} from './get-model-url';

export const deleteModel = async (model: WhisperWasmModel) => {
	const url = getModelUrl(model);
	await deleteObject({key: url});
};
