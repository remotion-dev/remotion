import {openDb} from './open-db';

export const deleteObject = async ({key}: {key: string}) => {
	const objectStore = await openDb('readwrite');

	return new Promise<void>((resolve, reject) => {
		const request = objectStore.delete(key);
		request.onsuccess = () => {
			resolve();
		};

		request.onerror = () => {
			reject(request.error);
		};
	});
};
