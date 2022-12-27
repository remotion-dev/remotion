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
	  };
