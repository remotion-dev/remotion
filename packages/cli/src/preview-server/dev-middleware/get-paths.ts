import type {DevMiddlewareContext} from './types';

type PublicPath = {
	outputPath: string;
	publicPath: string;
};

export function getPaths(context: DevMiddlewareContext) {
	const {stats} = context;

	const publicPaths: PublicPath[] = [];
	if (!stats) {
		return publicPaths;
	}

	const {compilation} = stats;

	// The `output.path` is always present and always absolute
	const outputPath = compilation.getPath(compilation.outputOptions.path || '');
	const publicPath = compilation.outputOptions.publicPath
		? compilation.getPath(compilation.outputOptions.publicPath)
		: '';

	publicPaths.push({outputPath, publicPath});

	return publicPaths;
}
