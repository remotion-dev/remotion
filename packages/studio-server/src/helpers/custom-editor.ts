import type {ChildProcess} from 'node:child_process';
import {spawn} from 'node:child_process';
import {accessSync, constants, existsSync, lstatSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {CustomEditor, LogLevel} from '@remotion/renderer';
import {
	customEditorColumnNumberPlaceholder,
	customEditorLineNumberPlaceholder,
	customEditorTargetPathPlaceholder,
	RenderInternals,
} from '@remotion/renderer';

type CustomEditorPathType = 'file' | 'directory' | 'symbolic-link' | null;

export type CustomEditorResolutionContext = {
	platform: NodeJS.Platform;
	env: NodeJS.ProcessEnv;
	currentWorkingDirectory: string;
	inspectPath: (filePath: string) => CustomEditorPathType;
	canExecute: (filePath: string) => boolean;
};

export type ResolvedCustomEditorExecutable = {
	executable: string;
	spawnAsMacApplication: boolean;
};

const defaultResolutionContext: CustomEditorResolutionContext = {
	platform: process.platform,
	env: process.env,
	currentWorkingDirectory: process.cwd(),
	inspectPath: (filePath) => {
		try {
			const stat = lstatSync(filePath);
			if (stat.isSymbolicLink()) {
				return 'symbolic-link';
			}

			if (stat.isFile()) {
				return 'file';
			}

			return stat.isDirectory() ? 'directory' : null;
		} catch {
			return null;
		}
	},
	canExecute: (filePath) => {
		try {
			accessSync(filePath, constants.X_OK);
			return true;
		} catch {
			return false;
		}
	},
};

const getExecutableCandidates = ({
	executable,
	context,
}: {
	executable: string;
	context: CustomEditorResolutionContext;
}) => {
	const pathApi = context.platform === 'win32' ? path.win32 : path.posix;
	const hasDirectory =
		pathApi.isAbsolute(executable) ||
		executable.includes('/') ||
		executable.includes('\\');
	if (hasDirectory) {
		return [
			pathApi.isAbsolute(executable)
				? executable
				: pathApi.resolve(context.currentWorkingDirectory, executable),
		];
	}

	const pathDirectories = (context.env.PATH ?? '')
		.split(context.platform === 'win32' ? ';' : ':')
		.filter(Boolean);
	if (context.platform !== 'win32') {
		return pathDirectories.map((directory) =>
			pathApi.join(directory, executable),
		);
	}

	const currentExtension = path.win32.extname(executable).toLowerCase();
	const extensions = currentExtension
		? ['']
		: (context.env.PATHEXT ?? '.COM;.EXE')
				.split(';')
				.map((extension) => extension.toLowerCase())
				.filter((extension) => extension === '.com' || extension === '.exe');
	return pathDirectories.flatMap((directory) =>
		extensions.map((extension) =>
			pathApi.join(directory, `${executable}${extension}`),
		),
	);
};

export const resolveCustomEditorExecutable = (
	editor: CustomEditor,
	context: CustomEditorResolutionContext = defaultResolutionContext,
): ResolvedCustomEditorExecutable | null => {
	for (const candidate of getExecutableCandidates({
		executable: editor.executable,
		context,
	})) {
		const pathType = context.inspectPath(candidate);
		if (
			context.platform === 'darwin' &&
			(pathType === 'directory' || pathType === 'symbolic-link') &&
			candidate.toLowerCase().endsWith('.app')
		) {
			return {executable: candidate, spawnAsMacApplication: true};
		}

		if (pathType !== 'file' && pathType !== 'symbolic-link') {
			continue;
		}

		if (context.platform === 'win32') {
			const extension = path.win32.extname(candidate).toLowerCase();
			if (extension !== '.exe' && extension !== '.com') {
				continue;
			}
		} else if (!context.canExecute(candidate)) {
			continue;
		}

		return {executable: candidate, spawnAsMacApplication: false};
	}

	return null;
};

export const normalizeCustomEditorTargetPath = ({
	targetPath,
	platform,
	release,
	currentWorkingDirectory,
}: {
	targetPath: string;
	platform: NodeJS.Platform;
	release: string;
	currentWorkingDirectory: string;
}) => {
	if (
		platform === 'linux' &&
		targetPath.startsWith('/mnt/') &&
		/Microsoft/i.test(release)
	) {
		return path.posix.relative(currentWorkingDirectory, targetPath);
	}

	return targetPath;
};

export const expandCustomEditorArguments = ({
	argumentTemplates,
	targetPath,
	lineNumber,
	columnNumber,
}: {
	argumentTemplates: readonly string[];
	targetPath: string;
	lineNumber: number;
	columnNumber: number;
}) => {
	return argumentTemplates.map((argument) =>
		argument
			.replaceAll(customEditorTargetPathPlaceholder, targetPath)
			.replaceAll(customEditorLineNumberPlaceholder, String(lineNumber))
			.replaceAll(customEditorColumnNumberPlaceholder, String(columnNumber)),
	);
};

export const launchCustomEditor = ({
	editor,
	resolvedExecutable,
	targetPath,
	lineNumber,
	columnNumber,
	logLevel,
	spawnProcess,
}: {
	editor: CustomEditor;
	resolvedExecutable: ResolvedCustomEditorExecutable;
	targetPath: string;
	lineNumber: number;
	columnNumber: number;
	logLevel: LogLevel;
	spawnProcess: typeof spawn | null;
}): Promise<boolean> => {
	if (
		!existsSync(targetPath) ||
		!Number.isInteger(lineNumber) ||
		lineNumber <= 0
	) {
		return Promise.resolve(false);
	}

	const safeColumnNumber =
		Number.isInteger(columnNumber) && columnNumber > 0 ? columnNumber : 1;
	const normalizedTargetPath = normalizeCustomEditorTargetPath({
		targetPath,
		platform: process.platform,
		release: os.release(),
		currentWorkingDirectory: process.cwd(),
	});
	const editorArguments = expandCustomEditorArguments({
		argumentTemplates: editor.arguments,
		targetPath: normalizedTargetPath,
		lineNumber,
		columnNumber: safeColumnNumber,
	});
	const command = resolvedExecutable.spawnAsMacApplication
		? 'open'
		: resolvedExecutable.executable;
	const args = resolvedExecutable.spawnAsMacApplication
		? ['-a', resolvedExecutable.executable, ...editorArguments]
		: editorArguments;

	return new Promise<boolean>((resolve) => {
		let child: ChildProcess;
		try {
			child = (spawnProcess ?? spawn)(command, args, {
				detached: true,
				shell: false,
				stdio: 'ignore',
			});
		} catch (error) {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				`Could not launch custom editor ${editor.name}:`,
				error,
			);
			resolve(false);
			return;
		}

		child.once('error', (error) => {
			RenderInternals.Log.error(
				{indent: false, logLevel},
				`Could not launch custom editor ${editor.name}:`,
				error,
			);
			resolve(false);
		});
		child.once('spawn', () => {
			child.unref();
			resolve(true);
		});
		child.on('exit', (exitCode) => {
			if (exitCode) {
				RenderInternals.Log.error(
					{indent: false, logLevel},
					`Custom editor ${editor.name} exited with code ${exitCode}.`,
				);
			}
		});
	});
};
