import type {webpack} from '@remotion/bundler';

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
	path: '/__webpack_hmr',
	timeout: 20 * 1000,
	reload: true,
	warn: true,
	heartbeat: 10 * 1000,
};

export type HotMiddlewareOptions = typeof hotMiddlewareOptions;

export type WebpackStats = ReturnType<webpack.Stats['toJson']>;

export type ModuleMap = {[key: string]: string};
