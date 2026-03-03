import {readFileSync, writeFileSync} from 'node:fs';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
} from '@remotion/studio-shared';
import {
	formatOutput,
	parseAndApplyCodemod,
} from '../../codemods/duplicate-composition';
import {simpleDiff} from '../../codemods/simple-diff';
import type {ApiHandler} from '../api-types';
import {getProjectInfo} from '../project-info';
import {checkIfTypeScriptFile} from './can-update-default-props';

let warnedAboutPrettier = false;

export const applyCodemodHandler: ApiHandler<
	ApplyCodemodRequest,
	ApplyCodemodResponse
> = async ({input: {codemod, dryRun}, logLevel, remotionRoot, entryPoint}) => {
	try {
		const time = Date.now();
		const projectInfo = await getProjectInfo(remotionRoot, entryPoint);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const input = readFileSync(projectInfo.rootFile, 'utf-8');

		const {newContents} = parseAndApplyCodemod({
			codeMod: codemod,
			input,
		});
		const {output, formatted} = await formatOutput(newContents);

		const diff = simpleDiff({
			oldLines: input.split('\n'),
			newLines: output.split('\n'),
		});

		if (!dryRun) {
			writeFileSync(projectInfo.rootFile, output);
			const end = Date.now() - time;
			RenderInternals.Log.info(
				{indent: false, logLevel},
				RenderInternals.chalk.blue(`Edited root file in ${end}ms`),
			);
			if (!formatted && !warnedAboutPrettier) {
				warnedAboutPrettier = true;
				RenderInternals.Log.warn(
					{indent: false, logLevel},
					RenderInternals.chalk.yellow(
						'Could not format the file using Prettier. Install "prettier" and add a config file to enable automatic formatting.',
					),
				);
			}
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
