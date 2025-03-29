import {openDb} from './open-db';

export const getObject = async ({key}: {key: string}) => {
	const objectStore = await openDb('readonly');

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
