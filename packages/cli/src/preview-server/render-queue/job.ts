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

type RenderJobDynamicFields =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			quality: number | null;
			frame: number;
			scale: number;
	  }
	| {
			type: 'composition';
	  };

export type RenderJob = {
	startedAt: number;
	compositionId: string;
	id: string;
	outputLocation: string;
	deletedOutputLocation: boolean;
} & RenderJobDynamicStatus &
	RenderJobDynamicFields;

export type RenderJobWithCleanup = RenderJob & {
	cleanup: (() => void)[];
};

type AddRenderRequestDynamicFields =
	| {
			type: 'still';
			imageFormat: StillImageFormat;
			quality: number | null;
			frame: number;
			scale: number;
	  }
	| {
			type: 'composition';
	  };

export type AddRenderRequest = {
	compositionId: string;
	outName: string;
} & AddRenderRequestDynamicFields;

export type RemoveRenderRequest = {
	jobId: string;
};

export type OpenInFileExplorerRequest = {
	// TODO: Don't allow paths outside Remotion directory
	directory: string;
};
