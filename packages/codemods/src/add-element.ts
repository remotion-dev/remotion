import type {File, JSXElement} from '@babel/types';
import type {InsertableCompositionElement} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import * as recast from 'recast';
import {buildJsxElement} from './build-jsx-element';
import {CodemodElement, createElement} from './codemod-element';
import type {CodemodProject, CodemodSource} from './codemod-project';
import type {CompositionTarget} from './composition-editing';
import {findJsxElementPathForDeletion} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {getNodes} from './get-nodes';
import {
	addElementToComponentRoot,
	getComponentRootNode,
	getDeclarationByExportName,
	getInsertionRootSourceEdit,
	getNullComponentRoot,
	makeInMemoryCodemodEnvironment,
	insertJsxElementIntoComposition,
	resolveCompositionComponentWithFile,
} from './insert-jsx-element';
import type {CodemodEnvironment} from './insert-jsx-element';
import {
	createElementFromInsertable,
	type InsertableSequenceWrapper,
} from './insertable-element';
import {findProjectFile} from './internals';
import {
	getNodeEditResult,
	type CodemodInsertionResult,
	type NodeReference,
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
	| {type: 'inside'; node: NodeReference}
	| {type: 'track'; node: NodeReference; from: number; durationInFrames: number}
	| {type: 'before'; node: NodeReference}
	| {type: 'after'; node: NodeReference};

export type AddElementDescriptor = InsertableCompositionElement;

export type AddElementOptions<Project extends CodemodProject> =
	CodemodSource<Project> & {
		element: CodemodElement | AddElementDescriptor;
		target: AddElementTarget;
		prettierConfigOverride?: Record<string, unknown> | null;
		from?: number | null;
		wrapInSequence?: InsertableSequenceWrapper | null;
		svgMarkupToJsx?: CodemodEnvironment['svgMarkupToJsx'];
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
	target: Extract<AddElementTarget, {type: 'inside' | 'before' | 'after'}>;
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

export const addElement = async <Project extends CodemodProject>(
	options: AddElementOptions<Project>,
): Promise<CodemodInsertionResult> => {
	const {
		element: suppliedElement,
		prettierConfigOverride = null,
		from = null,
		wrapInSequence = null,
	} = options;
	let {target} = options;
	const project: CodemodProject = options.project ?? {
		rootDir: options.environment!.rootDir,
		files: {},
	};
	const files = {...project.files};
	const baseEnvironment =
		options.environment ??
		makeInMemoryCodemodEnvironment({
			project,
			svgMarkupToJsx:
				options.svgMarkupToJsx ??
				(() =>
					Promise.reject(
						new Error('SVG insertion requires a svgMarkupToJsx converter'),
					)),
		});
	const environment: CodemodEnvironment = {
		...baseEnvironment,
		readFile: async (file) => {
			const contents = await baseEnvironment.readFile(file);
			if (options.environment) files[file] = contents;
			return contents;
		},
	};
	if (
		!(suppliedElement instanceof CodemodElement) &&
		(suppliedElement.type === 'svg' || suppliedElement.type === 'composition')
	) {
		if (target.type !== 'composition')
			throw new Error(
				'SVG and composition descriptors require a composition target',
			);
		const result = await insertJsxElementIntoComposition({
			compositionFile: target.compositionFile,
			compositionId: target.compositionId,
			element: suppliedElement,
			environment,
			from,
			wrapInSequence,
			prettierConfigOverride,
		});
		if (result.insertedNodePath === null)
			throw new Error('Could not determine the inserted JSX node path');
		const filePath = options.environment
			? result.fileName
			: findProjectFile({project, filePath: result.fileName});
		return {
			...getNodeEditResult({
				project: {...project, files},
				edits: [
					{
						filePath,
						output: result.output,
						nodePathRemappings: result.nodePathRemappings,
					},
				],
			}),
			insertedNode: {
				filePath,
				nodePath: result.insertedNodePath,
			},
		};
	}

	if (options.environment) {
		if (target.type === 'composition') {
			const resolved = await resolveCompositionComponentWithFile({
				environment,
				compositionFile: target.compositionFile,
				compositionId: target.compositionId,
			});
			if (!resolved.canAddSequence)
				throw new Error(
					'Cannot insert JSX element into this composition component',
				);
			target = {
				type: 'component',
				filePath: resolved.fileName,
				exportName: resolved.exportName,
			};
		} else {
			await environment.readFile(
				environment.resolve(
					environment.rootDir,
					target.type === 'component' ? target.filePath : target.node.filePath,
				),
			);
		}
	}

	let element =
		suppliedElement instanceof CodemodElement
			? suppliedElement
			: createElementFromInsertable({
					element: suppliedElement,
					from: target.type === 'track' ? null : from,
					wrapInSequence: target.type === 'track' ? null : wrapInSequence,
				});
	if (target.type === 'track') {
		if (
			!Number.isFinite(target.from) ||
			target.from < 0 ||
			!Number.isFinite(target.durationInFrames) ||
			target.durationInFrames <= 0
		)
			throw new Error('Invalid element insertion into a Track');
		const trackNode = target.node;
		const track = getNodes({
			project: {...project, files},
			filePath: trackNode.filePath,
		}).find(
			(candidate) =>
				JSON.stringify(candidate.nodePath) ===
				JSON.stringify(trackNode.nodePath),
		);
		if (track?.componentIdentity !== 'dev.remotion.remotion.Track')
			throw new Error('The destination is no longer a Track');
		const name =
			suppliedElement instanceof CodemodElement
				? suppliedElement.component
				: suppliedElement.type === 'asset'
					? (suppliedElement.src.split('/').pop() ?? suppliedElement.src)
					: suppliedElement.type === 'solid'
						? 'Solid'
						: null;
		element = createElement({
			component: 'Sequence',
			importPath: 'remotion',
			props: {
				from: target.from,
				durationInFrames: target.durationInFrames,
				...(name === null ? {} : {name}),
				style: {position: 'absolute'},
			},
			children: [element],
		});
		target = {type: 'inside', node: target.node};
	}

	const sourceProject = {...project, files};
	const insertionTarget = target;

	if (insertionTarget.type === 'composition') {
		const resolved = resolveCompositionComponentInProject({
			project: sourceProject,
			compositionFile: insertionTarget.compositionFile,
			compositionId: insertionTarget.compositionId,
		});
		if (!resolved.canAddSequence) {
			throw new Error(
				'Cannot insert JSX element into this composition component',
			);
		}

		return insertElementIntoFile({
			element,
			filePath: findProjectFile({
				project: sourceProject,
				filePath: resolved.filePath,
			}),
			getSourceEdit: (context) =>
				getCompositionRootSourceEdit({
					...context,
					exportName: resolved.exportName,
				}),
			prettierConfigOverride,
			project: sourceProject,
		});
	}

	if (insertionTarget.type === 'component') {
		return insertElementIntoFile({
			element,
			filePath: findProjectFile({
				project: sourceProject,
				filePath: insertionTarget.filePath,
			}),
			getSourceEdit: (context) =>
				getCompositionRootSourceEdit({
					...context,
					exportName: insertionTarget.exportName,
				}),
			prettierConfigOverride,
			project: sourceProject,
		});
	}

	return insertElementIntoFile({
		element,
		filePath: findProjectFile({
			project: sourceProject,
			filePath: insertionTarget.node.filePath,
		}),
		getSourceEdit: (context) =>
			getNodeTargetSourceEdit({...context, target: insertionTarget}),
		prettierConfigOverride,
		project: sourceProject,
	});
};
