import type {LogLevel} from '../log';

export type Writer = {
	write: (arr: Uint8Array) => Promise<void>;
	finish: () => Promise<void>;
	getWrittenByteCount: () => number;
	updateDataAt: (position: number, data: Uint8Array) => Promise<void>;
	remove: () => Promise<void>;
	getBlob: () => Promise<Blob>;
};

export type CreateContent = (options: {
	filename: string;
	mimeType: string;
	logLevel: LogLevel;
}) => Promise<Writer>;

export type WriterInterface = {
	createContent: CreateContent;
};
