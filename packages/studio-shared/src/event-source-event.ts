import type {StaticFile} from 'remotion';
import type {SequenceNodePath, CanUpdateSequencePropsResponse} from 'remotion';
import type {CanUpdateDefaultPropsResponse} from './api-requests';
import type {HotMiddlewareMessage} from './hot-middleware';
import type {CompletedClientRender, RenderJob} from './render-job';

export type EventSourceEvent =
	| {
			type: 'new-input-props';
			newProps: object;
	  }
	| {
			type: 'init';
			clientId: string;
			undoFile: string | null;
			redoFile: string | null;
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
			type: 'client-renders-updated';
			renders: CompletedClientRender[];
	  }
	| {
			type: 'new-public-folder';
			files: StaticFile[];
			folderExists: string | null;
	  }
	| {
			type: 'sequence-props-updated';
			fileName: string;
			nodePath: SequenceNodePath;
			result: CanUpdateSequencePropsResponse;
	  }
	| {
			type: 'default-props-updatable-changed';
			compositionId: string;
			result: CanUpdateDefaultPropsResponse;
	  }
	| {
			type: 'undo-redo-stack-changed';
			undoFile: string | null;
			redoFile: string | null;
	  }
	| {
			type: 'visual-control-values-changed';
			values: Array<{
				id: string;
				value: unknown;
				isUndefined: boolean;
			}>;
	  }
	| {
			type: 'hmr';
			hmrEvent: HotMiddlewareMessage;
	  };
