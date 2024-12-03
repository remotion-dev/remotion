export type Writer = {
	write: (arr: Uint8Array) => Promise<void>;
	save: () => Promise<Blob>;
	getWrittenByteCount: () => number;
	updateDataAt: (position: number, data: Uint8Array) => Promise<void>;
	waitForFinish: () => Promise<void>;
	remove: () => Promise<void>;
};

export type CreateContent = (options: {
	filename: string;
	mimeType: string;
}) => Promise<Writer>;

export type WriterInterface = {
	createContent: CreateContent;
};
