import type memfs from 'memfs';
import webpack from 'webpack';

export type DevMiddlewareContext = {
	state: boolean;
	stats: webpack.Stats | undefined;
	callbacks: ((stats: webpack.Stats) => undefined | Promise<void>)[];
	compiler: webpack.Compiler;
	logger: ReturnType<webpack.Compiler['getInfrastructureLogger']>;
	outputFileSystem: memfs.IFs | undefined;
};
