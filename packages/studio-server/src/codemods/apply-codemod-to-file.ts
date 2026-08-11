import {existsSync, readFileSync} from 'node:fs';
import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {resolveFileInsideProject} from '../helpers/resolve-file-inside-project';
import {checkIfTypeScriptFile} from '../preview-server/routes/can-update-default-props';
import {formatOutput, parseAndApplyCodemod} from './duplicate-composition';

export const resolveFilePathFromSymbolicatedStack = (
	remotionRoot: string,
	stack: SymbolicatedStackFrame,
): string => {
	if (!stack.originalFileName) {
		throw new Error(
			'Could not determine the file where this composition is defined',
		);
	}

	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName: stack.originalFileName,
		action: 'apply codemod to',
	});

	if (!existsSync(absolutePath)) {
		throw new Error(`File not found: ${stack.originalFileName}`);
	}

	return absolutePath;
};

export const applyCodemodToFile = async ({
	filePath,
	codeMod,
}: {
	filePath: string;
	codeMod: RecastCodemod;
}): Promise<string> => {
	checkIfTypeScriptFile(filePath);

	const input = readFileSync(filePath, 'utf-8');
	const {newContents} = parseAndApplyCodemod({
		codeMod,
		input,
	});

	return formatOutput(newContents);
};
