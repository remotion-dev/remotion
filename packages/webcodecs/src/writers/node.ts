import fs from 'node:fs';
import type {CreateContent, Writer} from './writer';

const createContent = (filename: string): CreateContent => {
	return async () => {
		const writPromise = Promise.resolve();

		const remove = async () => {
			await fs.promises.unlink(filename).catch(() => {});
		};

		await remove();

		if (!fs.existsSync(filename)) {
			fs.writeFileSync(filename, '');
		}

		const writeStream = fs.openSync(filename, 'w');

		let written = 0;

		const write = async (data: Uint8Array) => {
			await new Promise<void>((resolve, reject) => {
				fs.write(writeStream, data, (err) => {
					if (err) {
						reject(err);
						return;
					}

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

					resolve();
				});
			});
		};

		const writer: Writer = {
			write: (arr: Uint8Array) => {
				writPromise.then(() => write(arr));
				return writPromise;
			},

			updateDataAt: (position: number, data: Uint8Array) => {
				writPromise.then(() => updateDataAt(position, data));
				return writPromise;
			},
			waitForFinish: async () => {
				await writPromise;
			},
			getWrittenByteCount: () => written,
			remove,
			save: async () => {
				try {
					fs.closeSync(writeStream);
					const file = await fs.promises.readFile(filename);
					return new Blob([file]);
				} catch (e) {
					return Promise.reject(e);
				}
			},
		};

		return writer;
	};
};

export const nodeWriter = (path: string) => {
	return {createContent: createContent(path)};
};
