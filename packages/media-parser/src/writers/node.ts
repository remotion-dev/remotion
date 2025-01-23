import fs from 'node:fs';
import {Log} from '../log';
import type {CreateContent, Writer} from './writer';

const createContent = (filename: string): CreateContent => {
	return async ({logLevel}) => {
		let writPromise = Promise.resolve();

		const remove = async () => {
			Log.verbose(logLevel, 'Removing file', filename);
			await fs.promises.unlink(filename).catch(() => {});
		};

		await remove();

		if (!fs.existsSync(filename)) {
			Log.verbose(logLevel, 'Creating file', filename);
			fs.writeFileSync(filename, '');
		}

		const writeStream = fs.openSync(filename, 'w');

		let written = 0;

		const write = async (data: Uint8Array) => {
			await new Promise<void>((resolve, reject) => {
				fs.write(writeStream, data, 0, data.length, undefined, (err) => {
					if (err) {
						reject(err);
						return;
					}

					Log.verbose(logLevel, 'Wrote', data.length, 'bytes to', filename);
					resolve();
				});
			});
			written += data.byteLength;
		};

		const updateDataAt = (position: number, data: Uint8Array) => {
			return new Promise<void>((resolve, reject) => {
				fs.write(writeStream, data, 0, data.length, position, (err) => {
					if (err) {
						reject(err);
						return;
					}

					Log.verbose(
						logLevel,
						'Wrote',
						data.length,
						'bytes to',
						filename,
						'at position',
						position,
					);

					resolve();
				});
			});
		};

		const writer: Writer = {
			write: (arr: Uint8Array) => {
				writPromise = writPromise.then(() => write(arr));
				return writPromise;
			},

			updateDataAt: (position: number, data: Uint8Array) => {
				writPromise = writPromise.then(() => updateDataAt(position, data));
				return writPromise;
			},
			getWrittenByteCount: () => written,
			remove,
			finish: async () => {
				await writPromise;
				try {
					Log.verbose(logLevel, 'Closing file', filename);
					fs.closeSync(writeStream);
					return Promise.resolve();
				} catch (e) {
					return Promise.reject(e);
				}
			},
			getBlob: async () => {
				const file = await fs.promises.readFile(filename);
				return new Blob([file]);
			},
		};

		return writer;
	};
};

export const nodeWriter = (path: string) => {
	return {createContent: createContent(path)};
};
