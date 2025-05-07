import type {WhisperWasmModel} from './constants';
import {MODELS} from './constants';
import {getKeysFromObjectStore} from './db/get-object-from-db';
import {openDb} from './db/open-db';
import {getModelUrl} from './get-model-url';

export const getLoadedModels = async (): Promise<WhisperWasmModel[]> => {
	const objectStore = await openDb('readonly');
	const loadedModels: WhisperWasmModel[] = [];

	const result = await getKeysFromObjectStore({
		objectStore,
	});

	for (const model of MODELS) {
		if (result.includes(getModelUrl(model))) {
			loadedModels.push(model);
		}
	}

	return loadedModels;
};
