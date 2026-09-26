import type {File, JSXElement} from '@babel/types';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {buildJsxElement} from './build-jsx-element';
import {CodemodElement} from './codemod-element';
import type {CodemodProject} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {
	addElementToComponentRoot,
	getComponentRootNode,
	getDeclarationByExportName,
	getInsertionRootSourceEdit,
	getNullComponentRoot,
} from './insert-jsx-element';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	type CodemodInsertionResult,
	type JsxNodeReference,
} from './node-references';
import {indentInsertedJsx, printInsertedJsx} from './print-jsx';
import {recastLocToOffset} from './recast-loc-to-offset';
import {resolveCompositionComponentInProject} from './resolve-composition-component-location';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getAdjacentJsxInsertionSourceEdit,
	getInsertImportSourceEdits,
	getJsxElementSourceForInsertion,
	type SourceEdit,
} from './source-edits';
import {
	getEndOfLine,
	getIndentationUnit,
	getLineIndent,
	indentContinuationLines,
} from './source-style';
import {stripParenthesizedExtra} from './strip-parenthesized-extra';

export type AddElementTarget =
	| ({type: 'composition'} & CompositionTarget)
	| {type: 'component'; filePath: string; exportName: string | 'default'}
	| {type: 'inside'; node: JsxNodeReference}
	| {type: 'before'; node: JsxNodeReference}
	| {type: 'after'; node: JsxNodeReference};

export type AddElementOptions<Project extends CodemodProject> = {
	project: Project;
	element: CodemodElement;
	target: AddElementTarget;
	prettierConfigOverride?: Record<string, unknown> | null;
};

const b = recast.types.builders;

type SourceEditInput = {
	ast: File;
	input: string;
	insertion: string;
	jsx: namedTypes.JSXElement;
	prettierConfigOverride: Record<string, unknown> | null;
};

const getCompositionRootSourceEdit = ({
	ast,
	exportName,
	input,
	insertion,
	jsx,
	prettierConfigOverride,
}: SourceEditInput & {exportName: string | 'default'}): SourceEdit => {
	const declaration = getDeclarationByExportName({ast, exportName});
	const root = declaration ? getComponentRootNode(declaration) : null;
	const nullRoot = declaration ? getNullComponentRoot(declaration) : null;
	addElementToComponentRoot({ast, exportName, element: jsx});
	return getInsertionRootSourceEdit({
		insertInside: root?.type === 'JSXFragment',
		input,
		insertion,
		nullRoot,
		prettierConfigOverride,
		root,
	});
};

const getNodeTargetSourceEdit = ({
	ast,
	input,
	insertion,
	jsx,
	prettierConfigOverride,
	target,
}: SourceEditInput & {
	target: Extract<AddElementTarget, {node: JsxNodeReference}>;
}): SourceEdit => {
	const targetPath = findJsxElementPathForDeletion(ast, target.node.nodePath);
	if (!targetPath) {
		throw new Error('Could not find a JSX element at the target node path');
	}

	const targetElement = targetPath.node as JSXElement;
	if (target.type === 'inside') {
		const edit = getInsertionRootSourceEdit({
			insertInside: true,
			input,
			insertion,
			nullRoot: null,
			prettierConfigOverride,
			root: targetElement as never,
		});
		targetElement.children.push(jsx as never);
		if (targetElement.openingElement.selfClosing) {
			targetElement.openingElement.selfClosing = false;
			targetElement.closingElement = b.jsxClosingElement(
				targetElement.openingElement.name as never,
			) as never;
		}

		return edit;
	}

	const parent = targetPath.parentPath?.node;
	if (
		parent &&
		(parent.type === 'JSXElement' || parent.type === 'JSXFragment') &&
		parent.children.includes(targetElement)
	) {
		const index = parent.children.indexOf(targetElement);
		parent.children.splice(
			target.type === 'after' ? index + 1 : index,
			0,
			jsx as never,
		);
		return getAdjacentJsxInsertionSourceEdit({
			input,
			insertion,
			position: target.type,
			target: targetElement,
		});
	}

	// The target stands alone, e.g. as a return value. Group both in a fragment.
	if (!targetElement.loc) {
		throw new Error('Could not locate the target JSX element');
	}

	const start = recastLocToOffset(input, targetElement.loc.start);
	const end = recastLocToOffset(input, targetElement.loc.end);
	const original = getJsxElementSourceForInsertion({
		element: targetElement,
		input,
	});
	const existing = stripParenthesizedExtra(targetElement) as never;
	targetPath.replace(
		b.jsxFragment(
			b.jsxOpeningFragment(),
			b.jsxClosingFragment(),
			target.type === 'after' ? [existing, jsx] : [jsx, existing],
		),
	);
	const unit = getIndentationUnit(input, prettierConfigOverride);
	const children =
		target.type === 'after' ? [original, insertion] : [insertion, original];
	return {
		start,
		end,
		replacement: indentContinuationLines({
			indent: getLineIndent({input, offset: start}),
			input,
			printed: [
				'<>',
				...children.map((child) =>
					indentInsertedJsx({indent: unit, insertion: child}),
				),
				'</>',
			].join(getEndOfLine(input)),
		}),
	};
};

const insertElementIntoFile = ({
	element,
	filePath,
	getSourceEdit,
	prettierConfigOverride,
	project,
}: {
	element: CodemodElement;
	filePath: string;
	getSourceEdit: (context: SourceEditInput) => SourceEdit;
	prettierConfigOverride: Record<string, unknown> | null;
	project: CodemodProject;
}): CodemodInsertionResult => {
	const input = project.files[filePath];
	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const importSnapshots = captureImportSnapshots(ast);
	const jsx = buildJsxElement({ast, element});
	const insertion = printInsertedJsx({
		compactLiteralProps: true,
		element: jsx,
		input,
		prettierConfigOverride,
	});
	const edit = getSourceEdit({
		ast,
		input,
		insertion,
		jsx,
		prettierConfigOverride,
	});
	const output = applySourceEdits({
		input,
		edits: [
			...getInsertImportSourceEdits({
				ast,
				input,
				prettierConfigOverride,
				snapshots: importSnapshots,
			}),
			edit,
		],
	});
	const {finalNodePathByNode, nodePathRemappings} = getNodePathRemappings({
		ast,
		captured,
		output,
	});
	const insertedNodePath = finalNodePathByNode.get(jsx.openingElement as never);
	if (!insertedNodePath) {
		throw new Error('Could not determine the inserted JSX node path');
	}

	return {
		...getNodeEditResult({
			project,
			edits: [{filePath, output, nodePathRemappings}],
		}),
		insertedNode: {filePath, nodePath: insertedNodePath},
	};
};

export const addElement = <Project extends CodemodProject>({
	project,
	element,
	target,
	prettierConfigOverride = null,
}: AddElementOptions<Project>): CodemodInsertionResult => {
	if (!(element instanceof CodemodElement)) {
		throw new Error('element must be created with createElement()');
	}

	if (target.type === 'composition') {
		const resolved = resolveCompositionComponentInProject({
			project,
			compositionFile: target.compositionFile,
			compositionId: target.compositionId,
		});
		if (!resolved.canAddSequence) {
			throw new Error(
				'Cannot insert JSX element into this composition component',
			);
		}

		return insertElementIntoFile({
			element,
			filePath: findProjectFile({project, filePath: resolved.filePath}),
			getSourceEdit: (context) =>
				getCompositionRootSourceEdit({
					...context,
					exportName: resolved.exportName,
				}),
			prettierConfigOverride,
			project,
		});
	}

	if (target.type === 'component') {
		return insertElementIntoFile({
			element,
			filePath: findProjectFile({project, filePath: target.filePath}),
			getSourceEdit: (context) =>
				getCompositionRootSourceEdit({
					...context,
					exportName: target.exportName,
				}),
			prettierConfigOverride,
			project,
		});
	}

	return insertElementIntoFile({
		element,
		filePath: findProjectFile({project, filePath: target.node.filePath}),
		getSourceEdit: (context) => getNodeTargetSourceEdit({...context, target}),
		prettierConfigOverride,
		project,
	});
};
