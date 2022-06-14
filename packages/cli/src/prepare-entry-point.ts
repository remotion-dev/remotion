import {RenderInternals} from '@remotion/renderer';
import {stat} from 'fs/promises';
import path from 'path';
import {bundleOnCli} from './setup-cache';
import {RenderStep} from './step';

export const prepareEntryPoint = async (
	file: string,
	otherSteps: RenderStep[]
): Promise<{
	urlOrBundle: string;
	steps: RenderStep[];
	shouldDelete: boolean;
}> => {
	if (RenderInternals.isServeUrl(file)) {
		return {urlOrBundle: file, steps: otherSteps, shouldDelete: false};
	}

	const joined = path.resolve(process.cwd(), file);

	const stats = await stat(joined);

	if (stats.isDirectory()) {
		return {urlOrBundle: joined, steps: otherSteps, shouldDelete: false};
	}

	const urlOrBundle = await bundleOnCli(joined, ['bundling', ...otherSteps]);

	return {urlOrBundle, steps: ['bundling', ...otherSteps], shouldDelete: true};
};
