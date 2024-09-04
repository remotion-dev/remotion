export type Writer = {
	write: (arr: Uint8Array) => Promise<void>;
	save: () => Promise<void>;
	getWrittenByteCount: () => number;
	updateDataAt: (position: number, data: Uint8Array) => Promise<void>;
	waitForFinish: () => Promise<void>;
};

type CreateContent = () => Promise<Writer>;

export type WriterInterface = {
	createContent: CreateContent;
};
