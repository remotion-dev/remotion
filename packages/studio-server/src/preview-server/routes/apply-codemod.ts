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
> = async ({input: {codemod, dryRun}, remotionRoot}) => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const input = readFileSync(projectInfo.rootFile, 'utf-8');

		const {newContents} = await parseAndApplyCodemod({
			codeMod: codemod,
			input,
		});
		const diff = simpleDiff({
			oldLines: input.split('\n'),
			newLines: newContents.split('\n'),
		});

		if (!dryRun) {
			const formatted = await formatOutput(newContents);
			writeFileSync(projectInfo.rootFile, formatted);
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
