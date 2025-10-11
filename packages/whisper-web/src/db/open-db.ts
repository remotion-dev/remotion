import {DB_NAME, DB_OBJECT_STORE_NAME, DB_VERSION} from '../constants';

export const openDb = (transactionMode: IDBTransactionMode) => {
	return new Promise<IDBObjectStore>((resolve, reject) => {
		const rq = indexedDB.open(DB_NAME, DB_VERSION);

		rq.onupgradeneeded = (event) => {
			try {
				const db = rq.result;
				if (event.oldVersion < DB_VERSION) {
					db.createObjectStore(DB_OBJECT_STORE_NAME, {autoIncrement: false});
				} else {
					const {transaction} = event.currentTarget as IDBOpenDBRequest;
					if (!transaction) {
						throw new Error('No transaction available during upgrade');
					}

					const objectStore = transaction.objectStore(DB_OBJECT_STORE_NAME);
					if (!objectStore) {
						throw new Error('Could not access object store during upgrade');
					}

					objectStore.clear();
				}
			} catch (err) {
				reject(new Error(`Failed to upgrade database: ${err}`));
			}
		};

		rq.onsuccess = () => {
			try {
				const db = rq.result;
				const transaction = db.transaction(
					[DB_OBJECT_STORE_NAME],
					transactionMode,
				);

				transaction.onerror = () => {
					reject(new Error('Transaction failed'));
				};

				transaction.onabort = () => {
					reject(new Error('Transaction aborted'));
				};

				const objectStore = transaction.objectStore(DB_OBJECT_STORE_NAME);
				resolve(objectStore);
			} catch (err) {
				reject(new Error(`Failed to open database: ${err}`));
			}
		};

		rq.onerror = () => {
			const error = rq.error?.message ?? 'Unknown error';
			reject(new Error(`Failed to open IndexedDB: ${error}`));
		};

		rq.onblocked = () => {
			reject(new Error('Database is blocked by another connection'));
		};
	});
};
