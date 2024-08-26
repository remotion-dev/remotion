type Writer = {
	write: (arr: Uint8Array) => Promise<void>;
	save: () => Promise<void>;
	getWrittenByteCount: () => number;
	updateVIntAt: (position: number, vint: number) => number;
};

type CreateContent = () => Promise<Writer>;

export type WriterInterface = {
	createContent: CreateContent;
};
