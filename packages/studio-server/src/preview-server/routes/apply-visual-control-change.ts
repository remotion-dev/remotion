import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyVisualControlRequest,
	ApplyVisualControlResponse,
} from '@remotion/studio-shared';
import {parseAst, serializeAst} from '../../codemods/parse-ast';
import {applyCodemod} from '../../codemods/recast-mods';
import {makeHyperlink} from '../../hyperlinks/make-link';
import type {ApiHandler} from '../api-types';
import {suppressHmrForFile} from '../hmr-suppression';
import {pushToUndoStack, suppressUndoStackInvalidation} from '../undo-stack';
import {warnAboutPrettierOnce} from './log-update';

export const applyVisualControlHandler: ApiHandler<
	ApplyVisualControlRequest,
	ApplyVisualControlResponse
> = async ({input: {fileName, changes}, remotionRoot, logLevel}) => {
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

	let output = serializeAst(newAst);
	let formatted = false;

	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	type PrettierType = typeof import('prettier');
	try {
		const prettier: PrettierType = await import('prettier');
		const {format, resolveConfig, resolveConfigFile} = prettier;
		const configFilePath = await resolveConfigFile();
		if (configFilePath) {
			const prettierConfig = await resolveConfig(configFilePath);
			if (prettierConfig) {
				output = await format(output, {
					...prettierConfig,
					filepath: 'test.tsx',
					plugins: [],
					endOfLine: 'auto',
				});
				formatted = true;
			}
		}
	} catch {
		// Prettier not available, use unformatted output
	}

	pushToUndoStack(absolutePath, fileContents);
	suppressUndoStackInvalidation(absolutePath);
	suppressHmrForFile(absolutePath);
	writeFileSync(absolutePath, output);

	const locationLabel = `${fileRelativeToRoot}`;
	const fileLink = makeHyperlink({
		url: `file://${absolutePath}`,
		text: locationLabel,
		fallback: locationLabel,
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`${RenderInternals.chalk.blueBright(`${fileLink}:`)} Applied visual control changes`,
	);
	if (!formatted) {
		warnAboutPrettierOnce(logLevel);
	}

	return {
		success: true,
	};
};
