import type {File} from '@babel/types';
import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {fromImportAgnosticNodePath} from './import-agnostic-node-path';

export const getAstNodePath = (
	ast: File,
	nodePath: SequenceNodePath,
): recast.types.NodePath | null => {
	const resolvedNodePath = fromImportAgnosticNodePath({ast, nodePath});
	if (!resolvedNodePath) {
		return null;
	}

	let current = new recast.types.NodePath(ast);
	for (const segment of resolvedNodePath) {
		current = current.get(segment);
		if (current.value === null || current.value === undefined) {
			return null;
		}
	}

	return current;
};
