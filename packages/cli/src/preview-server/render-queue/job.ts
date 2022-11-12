export type RenderJob = {
	startedAt: number;
	compositionId: string;
	type: 'still' | 'composition';
	id: string;
	outputLocation: string;
};

export type AddRenderRequest = {
	compositionId: string;
	type: 'still' | 'composition';
	outName: string;
};

export type OpenInFileExplorerRequest = {
	// TODO: Don't allow paths outside Remotion directory
	directory: string;
};
