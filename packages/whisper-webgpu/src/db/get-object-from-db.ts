import {openDb} from './open-db';

export const getObjectFromObjectStore = ({
	objectStore,
	key,
}: {
	objectStore: IDBObjectStore;
	key: string;
}) => {
	return new Promise<Uint8Array>((resolve, reject) => {
		const request = objectStore.get(key);
		request.onsuccess = () => {
			resolve(request.result as Uint8Array);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};

export const getKeysFromObjectStore = ({
	objectStore,
}: {
	objectStore: IDBObjectStore;
}) => {
	return new Promise<IDBValidKey[]>((resolve, reject) => {
		const request = objectStore.getAllKeys();
		request.onsuccess = () => {
			resolve(request.result as IDBValidKey[]);
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};

export const getObject = async ({key}: {key: string}) => {
	const objectStore = await openDb('readonly');

	return getObjectFromObjectStore({objectStore, key});
};
