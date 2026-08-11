import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';

export const convertEntryPointToServeUrl = (entryPoint: string) => {
	const fullPath = RenderInternals.isServeUrl(entryPoint)
		? entryPoint
		: path.resolve(process.cwd(), entryPoint);

	return fullPath;
};
