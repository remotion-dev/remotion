import {readFileSync} from 'node:fs';
import type {File} from '@babel/types';
import {applyVisualControl} from '@remotion/codemods/internal';
import {RenderInternals} from '@remotion/renderer';
import type {
	ApplyVisualControlRequest,
	ApplyVisualControlResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';
import {formatLogFileLocation} from '../format-log-file-location';
import {waitForLiveEventsListener} from '../live-events';
import {
	printUndoHint,
	pushToUndoStack,
	suppressUndoStackInvalidation,
} from '../undo-stack';
import {suppressBundlerUpdateForFile} from '../watch-ignore-next-change';
import {
	getCodemodTimingPrefix,
	withSourceFileWriteQueue,
} from './source-file-write-queue';

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
> = ({input: {fileName, changes}, remotionRoot, logLevel}) => {
	return withSourceFileWriteQueue(() => {
		RenderInternals.Log.trace(
			{indent: false, logLevel},
			`[apply-visual-control] Received request for ${fileName} with ${changes.length} changes`,
		);
		const {absolutePath} = resolveFileInsideProject({
			remotionRoot,
			fileName,
			action: 'apply visual control change to',
		});

		const fileContents = readFileSync(absolutePath, 'utf-8');
		const ast = parseAst(fileContents);
		const logLine =
			changes.length > 0 ? getVisualControlChangeLine(ast, changes[0].id) : 1;

		const {newContents: output, changesMade} = applyVisualControl({
			input: fileContents,
			transformation: {
				type: 'apply-visual-control',
				changes,
			},
		});

		if (changesMade.length === 0) {
			throw new Error('No changes were made to the file');
		}

		pushToUndoStack({
			filePath: absolutePath,
			oldContents: fileContents,
			newContents: null,
			logLevel,
			remotionRoot,
			logLine,
			description: {
				undoMessage: '↩️  Visual control change',
				redoMessage: '↪️  Visual control change',
			},
			entryType: 'visual-control',
			suppressHmrOnFileRestore: true,
			nodePathRemappings: null,
		});
		suppressUndoStackInvalidation(absolutePath);
		suppressBundlerUpdateForFile(absolutePath);
		writeFileAndNotifyFileWatchers({
			file: absolutePath,
			content: output,
			originatorClientId: undefined,
			metadata: null,
		});

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
			`${getCodemodTimingPrefix(logLevel)}${RenderInternals.chalk.blueBright(`${locationLabel}`)} Applied visual control changes`,
		);

		printUndoHint(logLevel);

		return Promise.resolve({success: true});
	});
};
