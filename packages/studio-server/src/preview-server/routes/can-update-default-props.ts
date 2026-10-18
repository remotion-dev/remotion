import {readFileSync} from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import type {
	CanUpdateDefaultPropsResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import {getProjectInfo} from '../project-info';

export const {computeCanUpdateDefaultPropsFromContent} = CodemodsInternals;

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

// Compositions can be registered in files imported by the root file. The
// client sends the location of the registration, otherwise use the root file.
export const getDefaultPropsFile = async ({
	symbolicatedStack,
	remotionRoot,
	entryPoint,
}: {
	symbolicatedStack: SymbolicatedStackFrame | null;
	remotionRoot: string;
	entryPoint: string;
}): Promise<string> => {
	if (symbolicatedStack?.originalFileName) {
		return resolveFileInsideProject({
			remotionRoot,
			fileName: symbolicatedStack.originalFileName,
			action: 'update default props in',
		}).absolutePath;
	}

	const {rootFile} = await getProjectInfo(remotionRoot, entryPoint);
	if (!rootFile) {
		throw new Error('Cannot find root file in project');
	}

	return rootFile;
};

export const computeCanUpdateDefaultProps = async ({
	compositionId,
	symbolicatedStack,
	remotionRoot,
	entryPoint,
}: {
	compositionId: string;
	symbolicatedStack: SymbolicatedStackFrame | null;
	remotionRoot: string;
	entryPoint: string;
}): Promise<{
	result: CanUpdateDefaultPropsResponse;
	compositionFile: string | null;
}> => {
	try {
		const compositionFile = await getDefaultPropsFile({
			symbolicatedStack,
			remotionRoot,
			entryPoint,
		});

		checkIfTypeScriptFile(compositionFile);

		const input = readFileSync(compositionFile, 'utf-8');
		const result = computeCanUpdateDefaultPropsFromContent(
			input,
			compositionId,
		);

		if (
			!result.canUpdate &&
			!symbolicatedStack?.originalFileName &&
			CodemodsInternals.getCompositionFile({
				compositionId,
				project: {files: {[compositionFile]: input}, rootDir: remotionRoot},
			}) === null
		) {
			return {
				result: {
					canUpdate: false,
					reason: `Could not determine which file registers this composition, checked the root file: ${result.reason}`,
				},
				compositionFile,
			};
		}

		return {
			result,
			compositionFile,
		};
	} catch (err) {
		return {
			result: {
				canUpdate: false,
				reason: (err as Error).message,
			},
			compositionFile: null,
		};
	}
};
