import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
} from '@remotion/studio-shared';
import {readFileSync, writeFileSync} from 'node:fs';
import {
	formatOutput,
	parseAndApplyCodemod,
} from '../../codemods/duplicate-composition';
import {simpleDiff} from '../../codemods/simple-diff';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {checkIfTypeScriptFile} from './can-update-default-props';

export const applyCodemodHandler: ApiHandler<
	ApplyCodemodRequest,
	ApplyCodemodResponse
> = async ({input: {codemod, dryRun}, logLevel, remotionRoot}) => {
	try {
		const time = Date.now();
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const input = readFileSync(projectInfo.rootFile, 'utf-8');

		const {newContents} = parseAndApplyCodemod({
			codeMod: codemod,
			input,
		});
		const formatted = await formatOutput(newContents);

		const diff = simpleDiff({
			oldLines: input.split('\n'),
			newLines: formatted.split('\n'),
		});

		if (!dryRun) {
			writeFileSync(projectInfo.rootFile, formatted);
			const end = Date.now() - time;
			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.blue(`Edited root file in ${end}ms`),
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
