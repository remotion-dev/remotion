import type {
	ApplyVisualControlRequest,
	ApplyVisualControlResponse,
} from '@remotion/studio-shared';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseAst, serializeAst} from '../../codemods/parse-ast';
import {applyCodemod} from '../../codemods/recast-mods';
import type {ApiHandler} from '../api-types';

export const applyVisualControlHandler: ApiHandler<
	ApplyVisualControlRequest,
	ApplyVisualControlResponse
> = ({input: {fileName, changes}, remotionRoot}) => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error(
			'Cannot apply visual control change to a file outside the project',
		);
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	const ast = parseAst(fileContents);

	const {newAst, changesMade} = applyCodemod({
		file: ast,
		codeMod: {
			type: 'apply-visual-control',
			changes,
		},
	});

	if (changesMade.length === 0) {
		throw new Error('No changes were made to the file');
	}

	const output = serializeAst(newAst);

	writeFileSync(absolutePath, output);

	return Promise.resolve({
		success: true,
	});
};
