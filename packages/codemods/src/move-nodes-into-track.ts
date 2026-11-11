import type {JSXElement} from '@babel/types';
import type {TrackMoveTiming} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {buildJsxElement} from './build-jsx-element';
import {createElement} from './codemod-element';
import {
	findJsxElementPathForDeletion,
	getNodeSourceEdit,
} from './delete-jsx-nodes-internal';
import {
	captureJsxNodePaths,
	getNodePathRemappings,
} from './get-node-path-remappings';
import {getInsertionRootSourceEdit} from './insert-jsx-element';
import {indentInsertedJsx, printJsxOpeningElement} from './print-jsx';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';
import {parseAst} from './sequence-props/parse-ast';
import {
	applySourceEdits,
	captureImportSnapshots,
	getInsertImportSourceEdits,
	getJsxElementSourceForInsertion,
} from './source-edits';
import {getEndOfLine, getIndentationUnit} from './source-style';

export const moveNodesIntoTrack = ({
	input,
	sourceNodePaths,
	targetNodePath,
	timings,
}: {
	input: string;
	sourceNodePaths: readonly SequenceNodePath[];
	targetNodePath: SequenceNodePath;
	timings: readonly TrackMoveTiming[];
}) => {
	if (
		sourceNodePaths.length === 0 ||
		sourceNodePaths.length !== timings.length
	) {
		throw new Error(
			'Expected a timing for each item being moved into the Track',
		);
	}

	const ast = parseAst(input);
	const captured = captureJsxNodePaths(ast);
	const imports = captureImportSnapshots(ast);
	const targetPath = findJsxElementPathForDeletion(ast, targetNodePath);
	if (!targetPath) throw new Error('The destination Track no longer exists');
	const target = targetPath.node as JSXElement;
	if (
		getJsxComponentIdentity({ast, jsxElement: target.openingElement}) !==
		'dev.remotion.remotion.Track'
	)
		throw new Error('The destination is no longer a Track');
	const sources = sourceNodePaths.map((nodePath) => {
		const path = findJsxElementPathForDeletion(ast, nodePath);
		if (!path) throw new Error('An item being moved no longer exists');
		if (path.scope.node !== targetPath.scope.node) {
			throw new Error(
				'Items must be in the same source scope as the destination Track',
			);
		}

		let ancestor: recast.types.NodePath | null = targetPath;
		while (ancestor) {
			if (ancestor.node === path.node)
				throw new Error('Cannot move an item into itself or its children');
			ancestor = ancestor.parentPath;
		}

		if (!['JSXElement', 'JSXFragment'].includes(path.parentPath?.node?.type)) {
			throw new Error(
				'Only items directly inside JSX can be moved into a Track',
			);
		}

		return path;
	});
	if (new Set(sources.map((source) => source.node)).size !== sources.length) {
		throw new Error('Cannot move the same item twice');
	}

	for (const source of sources) {
		let ancestor = source.parentPath;
		while (ancestor) {
			if (sources.some((candidate) => candidate.node === ancestor.node)) {
				throw new Error('Cannot move an item and its parent together');
			}

			ancestor = ancestor.parentPath;
		}
	}

	const wrappers = sources.map((source, index) => {
		const timing = timings[index];
		if (
			!Number.isFinite(timing.from) ||
			timing.from < 0 ||
			!Number.isFinite(timing.durationInFrames) ||
			timing.durationInFrames <= 0 ||
			!Number.isFinite(timing.playbackRate) ||
			timing.playbackRate <= 0 ||
			!Number.isFinite(timing.trimBefore) ||
			timing.trimBefore < 0
		) {
			throw new Error('Invalid timing for moving an item into a Track');
		}

		const wrapper = buildJsxElement({
			ast,
			element: createElement({
				component: 'Sequence',
				importPath: 'remotion',
				props: {
					from: timing.from,
					durationInFrames: timing.durationInFrames,
					layout: 'none',
					name: timing.name,
					...(timing.playbackRate === 1
						? {}
						: {playbackRate: timing.playbackRate}),
					...(timing.trimBefore === 0 ? {} : {trimBefore: timing.trimBefore}),
				},
			}),
		}) as JSXElement;
		const opening = printJsxOpeningElement({
			openingElement: wrapper.openingElement as never,
			input,
			compactLiteralProps: true,
			prettierConfigOverride: null,
		}).replace(/\s*\/>$/, '>');
		const name = recast.print(wrapper.openingElement.name).code;
		const text = [
			opening,
			indentInsertedJsx({
				indent: getIndentationUnit(input, null),
				insertion: getJsxElementSourceForInsertion({
					element: source.node as JSXElement,
					input,
				}),
			}),
			`</${name}>`,
		].join(getEndOfLine(input));
		wrapper.openingElement.selfClosing = false;
		wrapper.closingElement = recast.types.builders.jsxClosingElement(
			wrapper.openingElement.name,
		) as never;
		wrapper.children = [source.node];
		return {wrapper, text};
	});
	const insertion = getInsertionRootSourceEdit({
		input,
		insertInside: true,
		insertion: wrappers.map(({text}) => text).join(getEndOfLine(input)),
		nullRoot: null,
		prettierConfigOverride: null,
		root: target as never,
	});
	const removals = sources.map((jsxPath) =>
		getNodeSourceEdit({input, jsxPath}),
	);
	for (const source of sources) {
		const children = source.parentPath.node.children as JSXElement[];
		children.splice(children.indexOf(source.node), 1);
	}

	target.children.push(...wrappers.map(({wrapper}) => wrapper));
	target.openingElement.selfClosing = false;
	target.closingElement ??= recast.types.builders.jsxClosingElement(
		target.openingElement.name,
	) as never;
	const output = applySourceEdits({
		input,
		edits: [
			...removals,
			insertion,
			...getInsertImportSourceEdits({
				ast,
				input,
				snapshots: imports,
				prettierConfigOverride: null,
			}),
		],
	});
	const {nodePathRemappings} = getNodePathRemappings({ast, captured, output});
	return {
		output,
		nodePathRemappings,
		sequenceLabel: timings.map(({name}) => name).join(', '),
		logLine: target.loc?.start.line ?? 1,
	};
};
