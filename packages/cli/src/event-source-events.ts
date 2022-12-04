// eslint-disable-next-line no-restricted-imports
import type {StaticFile} from 'remotion';

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
			type: 'new-public-folder';
			files: StaticFile[];
	  };
