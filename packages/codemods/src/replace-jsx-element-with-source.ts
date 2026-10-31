import type {Expression, JSXElement} from '@babel/types';
import type {CodemodProject} from './codemod-project';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import {getNodeEditResult, type NodeReference} from './node-references';
import {recastLocToOffset} from './recast-loc-to-offset';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getLineIndent,
	indentContinuationLines,
} from './source-style';
import {collectReferencedNames, removeUnusedImports} from './unused-imports';

export type ReplaceJsxElementWithSourceOptions<Project extends CodemodProject> =
	{
		project: Project;
		node: NodeReference;
		// A single JSX element, e.g. `<Scene title="Hi" />`
		source: string;
		// Imports that the source needs. Specifiers that are not imported
		// anymore are added back.
		importStatements: string[];
	};

/**
 * Replaces a JSX element with JSX source code that was taken from a file
 * earlier. Used to restore a scene that was swapped for its pre-rendered video.
 */
export const replaceJsxElementWithSource = <Project extends CodemodProject>({
	project,
	node,
	source,
	importStatements,
}: ReplaceJsxElementWithSourceOptions<Project>) => {
	const filePath = findProjectFile({project, filePath: node.filePath});
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const target = findJsxElementPathForDeletion(ast, node.nodePath);
	const targetNode = target?.node as JSXElement | undefined;
	if (!target || !targetNode?.loc) {
		throw new Error('Could not find a JSX element at the target node path');
	}

	const declaration = parseAst(`const restored = (${source});`).program.body[0];
	const restored =
		declaration.type === 'VariableDeclaration'
			? (declaration.declarations[0].init as Expression | null)
			: null;
	if (restored?.type !== 'JSXElement') {
		throw new Error('The source to restore must be a single JSX element');
	}

	const targetNames = collectReferencedNames(targetNode);
	target.replace(restored);

	const edits: SourceEdit[] = [];
	const start = recastLocToOffset(input, targetNode.loc.start);
	edits.push({
		start,
		end: recastLocToOffset(input, targetNode.loc.end),
		replacement: indentContinuationLines({
			indent: getLineIndent({input, offset: start}),
			input,
			printed: source,
		}),
	});

	const imports = ast.program.body.filter(
		(statement) => statement.type === 'ImportDeclaration',
	);
	const appendedImports: string[] = [];
	for (const importStatement of importStatements) {
		const savedImport = parseAst(importStatement).program.body[0];
		if (savedImport?.type !== 'ImportDeclaration') {
			continue;
		}

		const importedNames = new Set(
			imports.flatMap((statement) =>
				(statement.specifiers ?? []).map((specifier) => specifier.local.name),
			),
		);
		const missing = savedImport.specifiers.filter(
			(specifier) => !importedNames.has(specifier.local.name),
		);
		if (missing.length === 0) {
			continue;
		}

		const existing = imports.find(
			(statement) =>
				statement.source.value === savedImport.source.value &&
				statement.importKind === savedImport.importKind &&
				(statement.specifiers ?? []).every(
					(specifier) => specifier.type !== 'ImportNamespaceSpecifier',
				),
		);
		if (
			existing &&
			missing.every(
				(specifier) => specifier.type !== 'ImportNamespaceSpecifier',
			)
		) {
			existing.specifiers = [...(existing.specifiers ?? []), ...missing];
		} else if (missing.length === savedImport.specifiers.length) {
			appendedImports.push(importStatement);
		}
	}

	edits.push(
		...getInsertImportSourceEdits({
			ast,
			input,
			prettierConfigOverride: null,
			snapshots: importSnapshots,
		}),
	);
	if (appendedImports.length > 0) {
		const lastImport = imports[imports.length - 1];
		const offset = lastImport?.loc
			? recastLocToOffset(input, lastImport.loc.end)
			: 0;
		const endOfLine = getEndOfLine(input);
		const rendered = appendedImports.join(endOfLine);
		edits.push({
			start: offset,
			end: offset,
			replacement:
				offset === 0 ? `${rendered}${endOfLine}` : `${endOfLine}${rendered}`,
		});
	}

	const output = removeUnusedImports({
		input: applySourceEdits({input, edits}),
		localNames: targetNames,
	});
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		logLine: targetNode.loc.start.line,
	};
};
