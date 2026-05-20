import {readFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
} from '@remotion/studio-shared';
import {
	applyCodemodToFile,
	resolveFilePathFromSymbolicatedStack,
} from '../../codemods/apply-codemod-to-file';
import {simpleDiff} from '../../codemods/simple-diff';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {checkIfTypeScriptFile} from './can-update-default-props';

export const applyCodemodHandler: ApiHandler<
	ApplyCodemodRequest,
	ApplyCodemodResponse
> = async ({
	input: {codemod, dryRun, symbolicatedStack},
	logLevel,
	remotionRoot,
	entryPoint,
}) => {
	try {
		const time = Date.now();

		const filePath = symbolicatedStack
			? resolveFilePathFromSymbolicatedStack(remotionRoot, symbolicatedStack)
			: (await getProjectInfo(remotionRoot, entryPoint)).rootFile;

		if (!filePath) {
			throw new Error('Cannot find file for composition in project');
		}

		checkIfTypeScriptFile(filePath);

		const input = readFileSync(filePath, 'utf-8');
		const formatted = await applyCodemodToFile({
			filePath,
			codeMod: codemod,
		});

		const diff = simpleDiff({
			oldLines: input.split('\n'),
			newLines: formatted.split('\n'),
		});

		if (!dryRun) {
			writeFileAndNotifyFileWatchers(filePath, formatted, undefined);
			const end = Date.now() - time;
			const relativePath = path.relative(remotionRoot, filePath);
			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.blue(`Edited ${relativePath} in ${end}ms`),
			);
		}

		return {
			success: true,
			diff,
		};
	} catch (err) {
		return {
			success: false,
			reason: (err as Error).message,
			stack: (err as Error).stack as string,
		};
	}
};
