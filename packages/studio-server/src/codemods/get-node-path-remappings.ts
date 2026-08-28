import type {File, JSXOpeningElement} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from '../preview-server/routes/can-update-sequence-props';
import {parseAst} from './parse-ast';

export type CapturedJsxNodePath = {
	node: JSXOpeningElement;
	nodePath: SequenceNodePath;
	signature: string;
};

export const captureJsxNodePaths = (ast: File): CapturedJsxNodePath[] => {
	const captured: CapturedJsxNodePath[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			captured.push({
				node: path.node as JSXOpeningElement,
				nodePath: getNodePathForRecastPath(path, ast),
				signature: recast.prettyPrint(path.node as JSXOpeningElement).code,
			});
			return this.traverse(path);
		},
	});

	return captured;
};

export const getNodePathRemappings = ({
	ast,
	captured,
	output,
}: {
	ast: File;
	captured: CapturedJsxNodePath[];
	output: string;
}): {
	nodePathRemappings: SequenceNodePathRemapping[];
	finalNodePathByNode: Map<JSXOpeningElement, SequenceNodePath>;
} => {
	const nodesAfterMutation: JSXOpeningElement[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			nodesAfterMutation.push(path.node as JSXOpeningElement);
			return this.traverse(path);
		},
	});

	const finalAst = parseAst(output);
	const finalNodePaths: SequenceNodePath[] = [];
	recast.visit(finalAst, {
		visitJSXOpeningElement(path) {
			finalNodePaths.push(getNodePathForRecastPath(path, finalAst));
			return this.traverse(path);
		},
	});

	if (nodesAfterMutation.length !== finalNodePaths.length) {
		throw new Error('Could not map JSX node paths after modifying JSX nodes');
	}

	const finalNodePathByNode = new Map<JSXOpeningElement, SequenceNodePath>();
	for (let i = 0; i < nodesAfterMutation.length; i++) {
		finalNodePathByNode.set(nodesAfterMutation[i], finalNodePaths[i]);
	}

	const capturedNodes = new Set(captured.map(({node}) => node));
	const nodePathRemappings: SequenceNodePathRemapping[] = captured.flatMap(
		({node, nodePath, signature}) => {
			const newNodePath = finalNodePathByNode.get(node) ?? null;
			if (
				newNodePath !== null &&
				JSON.stringify(nodePath) === JSON.stringify(newNodePath) &&
				recast.prettyPrint(node).code === signature
			) {
				return [];
			}

			return [{oldNodePath: nodePath, newNodePath}];
		},
	);

	for (const node of nodesAfterMutation) {
		if (capturedNodes.has(node)) {
			continue;
		}

		const newNodePath = finalNodePathByNode.get(node);
		if (!newNodePath) {
			throw new Error('Could not map inserted JSX node path');
		}

		nodePathRemappings.push({oldNodePath: null, newNodePath});
	}

	return {finalNodePathByNode, nodePathRemappings};
};
