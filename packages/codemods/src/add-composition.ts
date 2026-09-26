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
		component: {importName: string; importPath: string | null};
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
}: AddCompositionOptions<Project>): CodemodResult => {
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
	if (
		component.importPath === null &&
		!ast.program.body.some((statement) => {
			const declaration =
				statement.type === 'ExportNamedDeclaration' ||
				statement.type === 'ExportDefaultDeclaration'
					? statement.declaration
					: statement;
			if (
				declaration?.type === 'FunctionDeclaration' ||
				declaration?.type === 'ClassDeclaration'
			) {
				return declaration.id?.name === component.importName;
			}

			return (
				declaration?.type === 'VariableDeclaration' &&
				declaration.declarations.some(
					(item) =>
						item.id.type === 'Identifier' &&
						item.id.name === component.importName &&
						item.init !== null,
				)
			);
		})
	) {
		throw new Error(
			`Component "${component.importName}" is not declared in ${compositionFile}`,
		);
	}

	const snapshots = captureImportSnapshots(ast);
	const tag = ensureNamedImport({
		ast,
		importedName: 'Composition',
		sourcePath: 'remotion',
		localName: 'Composition',
	});
	const componentName =
		component.importPath === null
			? component.importName
			: ensureNamedImport({
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
		edits: [{filePath, nextContents: output}],
	});
};
