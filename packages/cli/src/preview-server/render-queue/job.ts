import type {StillImageFormat} from '@remotion/renderer';

type RenderJobDynamicStatus =
	| {
			status: 'done';
	  }
	| {
			status: 'running';
	  }
	| {
			status: 'idle';
	  }
	| {
			status: 'failed';
			error: {
				message: string;
				stack: string | undefined;
			};
	  };

export type RenderJob = {
	startedAt: number;
	compositionId: string;
	type: 'still' | 'composition';
	id: string;
	outputLocation: string;
	imageFormat: StillImageFormat;
	quality: number | null;
} & RenderJobDynamicStatus;

export type AddRenderRequest = {
	compositionId: string;
	type: 'still' | 'composition';
	outName: string;
	imageFormat: StillImageFormat;
	quality: number | null;
};

export type RemoveRenderRequest = {
	jobId: string;
};

export type OpenInFileExplorerRequest = {
	// TODO: Don't allow paths outside Remotion directory
	directory: string;
};
