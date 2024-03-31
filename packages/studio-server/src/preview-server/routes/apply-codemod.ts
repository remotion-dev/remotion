import type {
	ApplyCodemodRequest,
	ApplyCodemodResponse,
} from '@remotion/studio-shared';
import {readFileSync, writeFileSync} from 'node:fs';
import {parseAndApplyCodemod} from '../../codemods/duplicate-composition';
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

		const {newContents} = await parseAndApplyCodemod({
			codeMod: codemod,
			input: readFileSync(projectInfo.rootFile, 'utf-8'),
		});
		if (!dryRun) {
			writeFileSync(projectInfo.rootFile, newContents);
		}

		return {
			success: true,
		};
	} catch (err) {
		return {
			success: false,
			reason: (err as Error).message,
			stack: (err as Error).stack as string,
		};
	}
};
