import type {StaticFile} from 'remotion';
import type {RenderJob} from './render-job';

export type EventSourceEvent =
	| {
			type: 'new-input-props';
			newProps: object;
	  }
	| {
			type: 'init';
			clientId: string;
	  }
	| {
			type: 'new-env-variables';
			newEnvVariables: Record<string, string>;
	  }
	| {
			type: 'root-file-changed';
	  }
	| {
			type: 'render-queue-updated';
			queue: RenderJob[];
	  }
	| {
			type: 'render-job-failed';
			compositionId: string;
			error: Error;
	  }
	| {
			type: 'watched-file-undeleted';
			file: string;
	  }
	| {
			type: 'watched-file-deleted';
			file: string;
	  }
	| {
			type: 'new-public-folder';
			files: StaticFile[];
			folderExists: string | null;
	  };
