import type {RenderJob} from './preview-server/render-queue/job';

export type EventSourceEvent =
	| {
			type: 'new-input-props';
			newProps: object;
	  }
	| {
			type: 'init';
	  }
	| {
			type: 'new-env-variables';
			newEnvVariables: Record<string, string>;
	  }
	| {
			type: 'render-queue-updated';
			queue: RenderJob[];
	  }
	| {
			type: 'render-job-failed';
			compositionId: string;
			error: Error;
	  };
