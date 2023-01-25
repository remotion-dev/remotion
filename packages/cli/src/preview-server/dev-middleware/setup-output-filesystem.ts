import memfs from 'memfs';
import type {DevMiddlewareContext} from './types';

export function setupOutputFileSystem(context: DevMiddlewareContext) {
	const outputFileSystem = memfs.createFsFromVolume(new memfs.Volume());

	context.compiler.outputFileSystem = outputFileSystem;

	context.outputFileSystem = outputFileSystem;
}
