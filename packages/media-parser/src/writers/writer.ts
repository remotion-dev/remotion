type Writer = {
	write: (arr: Uint8Array) => Promise<void>;
	save: () => Promise<void>;
};

type CreateContent = () => Promise<Writer>;

export type WriterInterface = {
	createContent: CreateContent;
};
