import * as recast from 'recast';
import type {JsxComponentIdentity, SequenceNodePath} from 'remotion';
import type {CodemodProject} from './codemod-project';
import {getJsxNodesWithPaths} from './get-node-path-remappings';
import {findProjectFile} from './internals';
import type {NodeReference} from './node-references';
import {getJsxSourceLocation} from './recast-loc-to-offset';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';
import {getJsxComponentIdentity} from './sequence-props/jsx-component-identity';

export type CodemodNode = NodeReference & {
	tagName: string;
	componentIdentity: JsxComponentIdentity | null;
	location: {line: number; column: number} | null;
	parentNodePath: SequenceNodePath | null;
};

export type GetNodesOptions = {
	project: CodemodProject;
	filePath: string;
};

export const getNodes = ({
	project,
	filePath,
}: GetNodesOptions): CodemodNode[] => {
	const resolvedFilePath = findProjectFile({project, filePath});
	const input = project.files[resolvedFilePath];
	const {ast} = getReadOnlySourceSnapshot(input);
	const captured = getJsxNodesWithPaths(ast);
	const nodePathByNode = new Map(
		captured.map(({node, nodePath}) => [node, nodePath]),
	);
	return captured.map(({node, nodePath, parentNode}) => ({
		filePath: resolvedFilePath,
		nodePath,
		tagName: recast.print(node.name).code,
		componentIdentity: getJsxComponentIdentity({ast, jsxElement: node}),
		location: node.loc ? getJsxSourceLocation(input, node.loc.start) : null,
		parentNodePath:
			parentNode === null ? null : (nodePathByNode.get(parentNode) ?? null),
	}));
};
