export type RenderJob = {
	startedAt: number;
	compositionId: string;
	type: 'still' | 'composition';
	id: string;
};
