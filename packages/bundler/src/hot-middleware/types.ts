import webpack from 'webpack';

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
	overlay: true,
	reload: false,
	log: console.log.bind(console),
	warn: true,
	name: '',
	autoConnect: true,
	overlayStyles: {},
	overlayWarnings: false,
	ansiColors: {},
	heartbeat: 10 * 1000,
};

export type HotMiddlewareOptions = typeof hotMiddlewareOptions;

export type WebpackStats = ReturnType<webpack.Stats['toJson']>;

export type ModuleMap = {[key: string]: string};
