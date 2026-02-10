export type CompletedClientRenderMetadata = {
	width: number;
	height: number;
	sizeInBytes: number;
};

export type CompletedClientRender = {
	id: string;
	type: 'client-video' | 'client-still';
	compositionId: string;
	outName: string;
	startedAt: number;
	deletedOutputLocation: boolean;
	metadata: CompletedClientRenderMetadata;
};
