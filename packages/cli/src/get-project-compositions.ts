import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {CodemodsInternals} from '@remotion/codemods';
import type {LogLevel} from '@remotion/renderer';
import {findEntryPoint} from './entry-point';

export const getProjectCompositions = ({
	remotionRoot,
	logLevel,
	fallbackFile,
}: {
	remotionRoot: string;
	logLevel: LogLevel;
	fallbackFile: string | null;
}) => {
	const {file} = findEntryPoint({
		args: [],
		remotionRoot,
		logLevel,
		allowDirectory: false,
	});
	const entryPoint = file ?? fallbackFile;
	if (entryPoint === null) {
		throw new Error(
			'Could not find the entry point of your Remotion project. Set it with Config.setEntryPoint(): https://www.remotion.dev/docs/config#setentrypoint',
		);
	}

	const compositions: Array<{
		id: string;
		width: number | null;
		height: number | null;
		file: string;
	}> = [];
	const files: Record<string, string> = {};
	const sourceDirectories = [path.dirname(entryPoint)];
	for (const directory of sourceDirectories) {
		for (const entry of readdirSync(directory, {withFileTypes: true})) {
			const fullPath = path.join(directory, entry.name);
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
				continue;
			}

			if (entry.isDirectory()) {
				sourceDirectories.push(fullPath);
				continue;
			}

			if (!entry.isFile() || !/\.(tsx|ts|jsx|js|mjs)$/.test(entry.name)) {
				continue;
			}

			const source = readFileSync(fullPath, 'utf-8');
			files[fullPath] = source;
			if (!/<[\w.]*(Composition|Still)\b/.test(source)) {
				continue;
			}

			try {
				for (const found of CodemodsInternals.getCompositionsInSource(source)) {
					compositions.push({...found, file: fullPath});
				}
			} catch {
				continue;
			}
		}
	}

	return {entryPoint, project: {rootDir: remotionRoot, files}, compositions};
};
