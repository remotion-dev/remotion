import type {
	AssignmentExpression,
	ExpressionStatement,
	File,
} from '@babel/types';
import {
	stringifyDefaultProps,
	type ApplyVisualControlCodemod,
} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {parseAst} from './parse-ast';
import type {ApplyCodeModReturnType, Change} from './recast-mods';

const expectString = (
	node: ExpressionKind | recast.types.namedTypes.SpreadElement,
) => {
	if (node.type === 'StringLiteral') {
		return node.value;
	}

	if (node.type === 'TemplateLiteral') {
		if (node.expressions.length > 0) {
			throw new Error(
				'applyVisualControl() must use a static identifier, the string may not be dynamic.',
			);
		}

		return node.quasis[0].value.raw;
	}

	throw new Error('Expected a string literal');
};

export const applyVisualControl = ({
	file,
	transformation,
	changesMade,
}: {
	file: File;
	transformation: ApplyVisualControlCodemod;
	changesMade: Change[];
}): ApplyCodeModReturnType => {
	recast.types.visit(file.program, {
		visitCallExpression(path) {
			const {node} = path;

			if (node.type !== 'CallExpression') {
				throw new Error('Expected a call expression');
			}

			if (node.callee.type !== 'Identifier') {
				return this.traverse(path);
			}

			if (node.callee.name !== 'visualControl') {
				return this.traverse(path);
			}

			const firstArgument = node.arguments[0];
			const str = expectString(firstArgument);

			for (const change of transformation.changes) {
				if (change.id !== str) {
					continue;
				}

				const parsed = (
					(
						parseAst(
							`a = ${stringifyDefaultProps({props: JSON.parse(change.newValueSerialized), enumPaths: change.enumPaths})}`,
						).program.body[0] as unknown as ExpressionStatement
					).expression as AssignmentExpression
				).right as ExpressionKind;

				node.arguments[1] = parsed;

				changesMade.push({
					description: `Applied visual control ${change.id}`,
				});
			}

			return this.traverse(path);
		},
	});

	return {newAst: file, changesMade};
};
