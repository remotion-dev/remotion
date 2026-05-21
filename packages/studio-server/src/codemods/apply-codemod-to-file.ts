import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
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

	const absolutePath = path.resolve(remotionRoot, stack.originalFileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error('Cannot apply codemod to a file outside the project');
	}

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
