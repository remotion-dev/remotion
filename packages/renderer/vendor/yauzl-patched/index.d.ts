import type {EventEmitter} from 'events';
import type {Readable} from 'stream';

export interface Entry {
	fileName: string;
	externalFileAttributes: number;
	versionMadeBy: number;
}

export interface ZipFile extends EventEmitter {
	readEntry(): void;
	close(): void;
	openReadStream(
		entry: Entry,
		callback: (err: Error | null, readStream?: Readable) => void,
	): void;
}

export function open(
	path: string,
	options: {lazyEntries: true},
	callback?: (err: Error | null, zipfile: ZipFile) => void,
): void;
