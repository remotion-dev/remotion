import type {File} from '@babel/types';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';

export const addJsDocComment = ({
	documentTitle,
	sourceCode,
}: {
	documentTitle: string;
	sourceCode: string;
}) => {
	const ast = recast.parse(sourceCode, {
		parser: tsParser,
	}) as File;

	const withoutParentheses = documentTitle
		.replace(/\(.*\)/, '')
		.replace(/\</, '')
		.replace(/\>/, '')
		.replace(/\\/, '');

	recast.visit(ast, {
		visitExportNamedDeclaration: (p) => {
			const node = p.node;

			if (node.type !== 'ExportNamedDeclaration') {
				return node;
			}

			if (!node.declaration) {
				return node;
			}
			if (node.declaration.type !== 'VariableDeclaration') {
				return node;
			}
			const declaration = node.declaration.declarations[0];
			if (!declaration) {
				return node;
			}
			if (declaration.type !== 'VariableDeclarator') {
				return node;
			}
			if (declaration.id.type !== 'Identifier') {
				return node;
			}
			if (declaration.id.name !== withoutParentheses) {
				return node;
			}

			const newComment = recast.types.builders.commentBlock('hi there');
			return {
				...node,
				leadingComments: [newComment],
			};
		},
	});

	const output = recast.print(ast, {
		parser: tsParser,
	}).code;

	return output;
};
