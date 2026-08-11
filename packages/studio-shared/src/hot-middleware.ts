export type HotMiddlewareMessage =
	| {
			action: 'building';
			name?: string;
	  }
	| {
			action: 'built' | 'sync';
			name: string;
			time: number | undefined;
			errors: unknown[];
			warnings: unknown[];
			hash: string | undefined;
			modules: {
				[key: string]: string;
			};
	  };

export const hotMiddlewareOptions = {
	timeout: 20 * 1000,
	reload: true,
	warn: true,
};

export type HotMiddlewareOptions = typeof hotMiddlewareOptions;

export type ModuleMap = {[key: string]: string};
