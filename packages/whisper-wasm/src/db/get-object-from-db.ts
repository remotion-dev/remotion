export const getObjectFromDb = (objectStore: IDBObjectStore, key: string) => {
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
