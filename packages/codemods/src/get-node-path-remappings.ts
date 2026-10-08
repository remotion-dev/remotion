import type {File, JSXOpeningElement} from '@babel/types';
import type {SequenceNodePathRemapping} from '@remotion/studio-shared';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from './sequence-props';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';

export type CapturedJsxNodePath = {
	node: JSXOpeningElement;
	nodePath: SequenceNodePath;
	jsxName: string;
	signature: string;
	// The opening element of the closest enclosing JSX element, if any.
	parentNode: JSXOpeningElement | null;
};

export const captureJsxNodePaths = (ast: File): CapturedJsxNodePath[] => {
	const captured: CapturedJsxNodePath[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			let parentNode: JSXOpeningElement | null = null;
			// Skip the JSXElement that owns this opening element.
			let ancestor = path.parentPath?.parentPath ?? null;
			while (ancestor) {
				if (ancestor.node?.type === 'JSXElement') {
					parentNode = ancestor.node.openingElement as JSXOpeningElement;
					break;
				}

				ancestor = ancestor.parentPath;
			}

			captured.push({
				node: path.node as JSXOpeningElement,
				nodePath: getNodePathForRecastPath(path, ast),
				jsxName: recast.prettyPrint(path.node.name).code,
				signature: recast.prettyPrint(path.node as JSXOpeningElement).code,
				parentNode,
			});
			return this.traverse(path);
		},
	});

	return captured;
};

// The opening elements of a JSX element and its descendants. Relies on the
// captured nodes being in document order, so parents precede their children.
export const collectJsxSubtree = (
	captured: CapturedJsxNodePath[],
	root: JSXOpeningElement,
): Set<JSXOpeningElement> => {
	const nodes = new Set<JSXOpeningElement>([root]);
	for (const {node, parentNode} of captured) {
		if (parentNode !== null && nodes.has(parentNode)) {
			nodes.add(node);
		}
	}

	return nodes;
};

export const requireCapturedNodePath = (
	captured: CapturedJsxNodePath[],
	node: JSXOpeningElement,
): SequenceNodePath => {
	const match = captured.find((entry) => entry.node === node);
	if (!match) {
		throw new Error('Could not locate the JSX node after editing the source');
	}

	return match.nodePath;
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

	const {ast: finalAst} = getReadOnlySourceSnapshot(output);
	const finalNodes: Array<{nodePath: SequenceNodePath; jsxName: string}> = [];
	recast.visit(finalAst, {
		visitJSXOpeningElement(path) {
			finalNodes.push({
				nodePath: getNodePathForRecastPath(path, finalAst),
				jsxName: recast.prettyPrint(path.node.name).code,
			});
			return this.traverse(path);
		},
	});

	if (nodesAfterMutation.length !== finalNodes.length) {
		throw new Error('Could not map JSX node paths after modifying JSX nodes');
	}

	const finalNodePathByNode = new Map<JSXOpeningElement, SequenceNodePath>();
	const finalJsxNameByNode = new Map<JSXOpeningElement, string>();
	for (let i = 0; i < nodesAfterMutation.length; i++) {
		finalNodePathByNode.set(nodesAfterMutation[i], finalNodes[i].nodePath);
		finalJsxNameByNode.set(nodesAfterMutation[i], finalNodes[i].jsxName);
	}

	const capturedNodes = new Set(captured.map(({node}) => node));
	const nodePathRemappings: SequenceNodePathRemapping[] = captured.flatMap(
		({node, nodePath, jsxName, signature}) => {
			const newNodePath = finalNodePathByNode.get(node) ?? null;
			if (
				newNodePath !== null &&
				JSON.stringify(nodePath) === JSON.stringify(newNodePath) &&
				recast.prettyPrint(node).code === signature
			) {
				return [];
			}

			return [
				{
					oldNodePath: nodePath,
					newNodePath,
					oldJsxName: jsxName,
					newJsxName:
						newNodePath === null
							? null
							: (finalJsxNameByNode.get(node) ?? null),
				},
			];
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

		nodePathRemappings.push({
			oldNodePath: null,
			newNodePath,
			oldJsxName: null,
			newJsxName: finalJsxNameByNode.get(node) ?? null,
		});
	}

	return {finalNodePathByNode, nodePathRemappings};
};
