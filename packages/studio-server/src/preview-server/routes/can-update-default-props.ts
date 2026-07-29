import {readFileSync} from 'node:fs';
import {computeCanUpdateDefaultPropsFromContent} from '@remotion/studio-codemods';
import type {CanUpdateDefaultPropsResponse} from '@remotion/studio-shared';
import {getProjectInfo} from '../project-info';

export {computeCanUpdateDefaultPropsFromContent} from '@remotion/studio-codemods';

export const checkIfTypeScriptFile = (file: string) => {
	if (
		!file.endsWith('.tsx') &&
		!file.endsWith('.ts') &&
		!file.endsWith('.mtsx') &&
		!file.endsWith('.mts')
	) {
		throw new Error('Cannot update Root file if not using TypeScript');
	}
};

export const computeCanUpdateDefaultProps = async ({
	compositionId,
	remotionRoot,
	entryPoint,
}: {
	compositionId: string;
	remotionRoot: string;
	entryPoint: string;
}): Promise<{
	result: CanUpdateDefaultPropsResponse;
	rootFile: string | null;
}> => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot, entryPoint);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const input = readFileSync(projectInfo.rootFile, 'utf-8');
		const result = computeCanUpdateDefaultPropsFromContent(
			input,
			compositionId,
		);

		return {
			result,
			rootFile: projectInfo.rootFile,
		};
	} catch (err) {
		return {
			result: {
				canUpdate: false,
				reason: (err as Error).message,
			},
			rootFile: null,
		};
	}
};
