import type {JSXElement} from '@babel/types';
import * as recast from 'recast';
import type {CodemodProject, CodemodResult} from './codemod-project';
import {getCodemodResult} from './codemod-project';
import {
	type CompositionTarget,
	type CompositionMetadata,
	type FolderReference,
	assertNewCompositionId,
	validateMetadata,
} from './composition-editing';
import {findProjectFile} from './internals';
import {getRegistrationInsertionSourceEdit} from './registration-source-edits';
import {ensureNamedImport} from './sequence-props/imports';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
} from './source-edits';

export type AddCompositionOptions<Project extends CodemodProject> =
	CompositionTarget & {
		project: Project;
		component: {importName: string; importPath: string};
		metadata: CompositionMetadata;
		folder?: FolderReference;
	};

export const addComposition = <Project extends CodemodProject>({
	project,
	compositionFile,
	compositionId,
	component,
	metadata,
	folder,
}: AddCompositionOptions<Project>): CodemodResult<Project> => {
	assertNewCompositionId({project, compositionFile, compositionId});
	validateMetadata(metadata);
	if (!/^[A-Z_$][\w$]*$/.test(component.importName)) {
		throw new Error(
			'component.importName must be a named component export beginning with an uppercase letter, _ or $',
		);
	}

	const filePath = findProjectFile({project, filePath: compositionFile});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const snapshots = captureImportSnapshots(ast);
	const tag = ensureNamedImport({
		ast,
		importedName: 'Composition',
		sourcePath: 'remotion',
		localName: 'Composition',
	});
	const componentName = ensureNamedImport({
		ast,
		importedName: component.importName,
		sourcePath: component.importPath,
		localName: component.importName,
	});
	const b = recast.types.builders;
	const insertion = b.jsxElement(
		b.jsxOpeningElement(
			b.jsxIdentifier(tag),
			[
				b.jsxAttribute(b.jsxIdentifier('id'), b.stringLiteral(compositionId)),
				b.jsxAttribute(
					b.jsxIdentifier('component'),
					b.jsxExpressionContainer(b.identifier(componentName)),
				),
				...(['durationInFrames', 'fps', 'width', 'height'] as const).map(
					(name) =>
						b.jsxAttribute(
							b.jsxIdentifier(name),
							b.jsxExpressionContainer(b.numericLiteral(metadata[name])),
						),
				),
			],
			true,
		),
		null,
		[],
	);
	const output = applySourceEdits({
		input,
		edits: [
			getRegistrationInsertionSourceEdit({
				input,
				ast,
				insertion: insertion as JSXElement,
				folder: folder ?? null,
			}),
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots,
				prettierConfigOverride: null,
			}),
		],
	});
	parseAst(output);
	return getCodemodResult({
		project,
		nextProject: {...project, files: {...project.files, [filePath]: output}},
	});
};
