import {openDb} from './open-db';

export const putObject = async ({
	key,
	value,
}: {
	key: string;
	value: Uint8Array;
}) => {
	const objectStore = await openDb('readwrite');

	return new Promise<void>((resolve, reject) => {
		try {
			const putRq = objectStore.put(value, key);

			putRq.onsuccess = () => {
				resolve();
			};

			putRq.onerror = () => {
				reject(new Error(`Failed to store "${key}" in IndexedDB`));
			};
		} catch (e) {
			reject(new Error(`Failed to store "${key}" in IndexedDB: ${e}`));
		}
	});
};
