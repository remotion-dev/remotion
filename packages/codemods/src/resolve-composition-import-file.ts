import type {CodemodProject} from './codemod-project';
import {findProjectFile} from './internals';
import {getJsxSourceLocation} from './recast-loc-to-offset';
import {findRegistrationRoot} from './registration-source-edits';
import {resolveRootComponentInProject} from './resolve-composition-component-location';
import {parseAst} from './sequence-props/parse-ast';

export const resolveCompositionImportFile = ({
	entryPoint,
	project,
	compositionFile,
}: {
	entryPoint: string;
	project: CodemodProject;
	compositionFile: string | null;
}) => {
	let registeredRoot: ReturnType<typeof resolveRootComponentInProject> | null =
		null;
	try {
		registeredRoot = resolveRootComponentInProject({entryPoint, project});
	} catch (error) {
		if (compositionFile === null) {
			throw new Error(
				`Could not determine the root file. Pass --root-file <file>. ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	const target = compositionFile ?? registeredRoot?.filePath;
	if (target === undefined) {
		throw new Error(
			'Could not determine the root file. Pass --root-file <file>.',
		);
	}

	const filePath = findProjectFile({filePath: target, project});
	if (registeredRoot !== null && filePath === registeredRoot.filePath) {
		const insertionRoot = findRegistrationRoot({
			ast: parseAst(project.files[filePath]),
			folder: null,
		});
		const actual = insertionRoot.loc
			? getJsxSourceLocation(project.files[filePath], insertionRoot.loc.start)
			: null;
		const expected = registeredRoot.root.loc?.start;
		if (
			!actual ||
			!expected ||
			actual.line !== expected.line ||
			actual.column !== expected.column
		) {
			throw new Error(
				`The insertion target in "${filePath}" is not the registered root component. Pass --root-file <file> with an unambiguous root component.`,
			);
		}
	}

	return filePath;
};
