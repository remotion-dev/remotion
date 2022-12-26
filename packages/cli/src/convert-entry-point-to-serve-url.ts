import {RenderInternals} from '@remotion/renderer';
import path from 'path';

export const convertEntryPointToServeUrl = (entryPoint: string) => {
	const fullPath = RenderInternals.isServeUrl(entryPoint)
		? entryPoint
		: path.join(process.cwd(), entryPoint);

	return fullPath;
};
