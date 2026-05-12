import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {File} from '@babel/types';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyVisualControlRequest,
	ApplyVisualControlResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst, serializeAst} from '../../codemods/parse-ast';
import {applyCodemod} from '../../codemods/recast-mods';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {waitForLiveEventsListener} from '../live-events';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {warnAboutPrettierOnce} from './log-update';

const getVisualControlChangeLine = (file: File, changeId: string): number => {
	let line = 1;
	recast.types.visit(file.program, {
		visitCallExpression(callPath) {
			const {node} = callPath;
			if (
				node.callee.type === 'Identifier' &&
				node.callee.name === 'visualControl'
			) {
				const firstArg = node.arguments[0];
				if (firstArg?.type === 'StringLiteral' && firstArg.value === changeId) {
					line = node.loc?.start.line ?? 1;
					return false;
				}
			}

			this.traverse(callPath);
		},
	});

	return line;
};

export const applyVisualControlHandler: ApiHandler<
	ApplyVisualControlRequest,
	ApplyVisualControlResponse
> = async ({input: {fileName, changes}, remotionRoot, logLevel}) => {
	RenderInternals.Log.trace(
		{indent: false, logLevel},
		`[apply-visual-control] Received request for ${fileName} with ${changes.length} changes`,
	);
	const absolutePath = path.resolve(remotionRoot, fileName);
	const fileRelativeToRoot = path.relative(remotionRoot, absolutePath);
	if (fileRelativeToRoot.startsWith('..')) {
		throw new Error(
			'Cannot apply visual control change to a file outside the project',
		);
	}

	const fileContents = readFileSync(absolutePath, 'utf-8');
	const ast = parseAst(fileContents);
	const logLine =
		changes.length > 0 ? getVisualControlChangeLine(ast, changes[0].id) : 1;

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

	pushToUndoStack({
		filePath: absolutePath,
		oldContents: fileContents,
		logLevel,
		remotionRoot,
		logLine,
		description: {
			undoMessage: 'Undo: Visual control change',
			redoMessage: 'Redo: Visual control change',
		},
		entryType: 'visual-control',
		suppressHmrOnFileRestore: true,
	});
	suppressUndoStackInvalidation(absolutePath);
	suppressBundlerUpdateForFile(absolutePath);
	writeFileAndNotifyFileWatchers(absolutePath, output);

	waitForLiveEventsListener().then((listener) => {
		listener.sendEventToClient({
			type: 'visual-control-values-changed',
			values: changes.map((change) => ({
				id: change.id,
				value: change.newValueIsUndefined
					? null
					: JSON.parse(change.newValueSerialized),
				isUndefined: change.newValueIsUndefined,
			})),
		});
	});

	const locationLabel = formatLogFileLocation({
		remotionRoot,
		absolutePath,
		line: logLine,
	});
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`${RenderInternals.chalk.blueBright(`${locationLabel}:`)} Applied visual control changes`,
	);
	if (!formatted) {
		warnAboutPrettierOnce(logLevel);
	}

	printUndoHint(logLevel);

	return {
		success: true,
	};
};
