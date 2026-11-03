import type {File} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {getNodePathForRecastPath} from '../preview-server/routes/can-update-sequence-props';

export type CapturedJsxNodePath = {
	nodePath: SequenceNodePath;
	location: {line: number; column: number} | null;
};

export const captureJsxNodePaths = (ast: File): CapturedJsxNodePath[] => {
	const captured: CapturedJsxNodePath[] = [];
	recast.visit(ast, {
		visitJSXOpeningElement(path) {
			captured.push({
				nodePath: getNodePathForRecastPath(path, ast),
				location: path.node.loc?.start ?? null,
			});
			return this.traverse(path);
		},
	});

	return captured;
};
