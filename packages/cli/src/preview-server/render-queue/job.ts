export type RenderJob = {
	startedAt: number;
	compositionId: string;
	type: 'still' | 'composition';
	id: string;
};

export type AddRenderRequest = {
	compositionId: string;
	type: 'still' | 'composition';
};
