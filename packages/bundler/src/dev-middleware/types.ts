import type memfs from 'memfs';

import webpack, {Watching} from 'webpack';

export type DevMiddlewareContext = {
	state: boolean;
	stats: webpack.Stats | undefined;
	callbacks: ((stats: webpack.Stats) => undefined | Promise<void>)[];
	compiler: webpack.Compiler;
	watching: Watching | undefined;
	logger: ReturnType<webpack.Compiler['getInfrastructureLogger']>;
	outputFileSystem: memfs.IFs | undefined;
};
