import type {Statement} from '@babel/types';
import * as recast from 'recast';
import {parseAst} from './parse-ast';

export const reorderElementLibraries = (
	configContents: string,
	urls: readonly string[],
): string => {
	const order = urls.map((url) => new URL(url).href);
	if (new Set(order).size !== order.length) {
		throw new Error('Element Library URLs must be unique.');
	}

	const ast = parseAst(configContents);
	const statements = new Map<string, Statement>();
	const indices = new Set<number>();
	for (const [index, statement] of ast.program.body.entries()) {
		if (
			statement.type !== 'ExpressionStatement' ||
			statement.expression.type !== 'CallExpression'
		) {
			continue;
		}

		const call = statement.expression;
		if (
			call.callee.type !== 'MemberExpression' ||
			call.callee.computed ||
			call.callee.object.type !== 'Identifier' ||
			call.callee.object.name !== 'Config' ||
			call.callee.property.type !== 'Identifier' ||
			call.callee.property.name !== 'addElementLibrary'
		) {
			continue;
		}

		const argument = call.arguments[0];
		if (
			argument?.type !== 'ObjectExpression' ||
			argument.properties.some(
				(property) =>
					property.type !== 'ObjectProperty' ||
					property.computed ||
					property.value.type !== 'StringLiteral',
			)
		) {
			throw new Error(
				'Only top-level Config.addElementLibrary() calls with literal string values can be reordered.',
			);
		}

		const urlProperty = argument.properties.find(
			(property) =>
				property.type === 'ObjectProperty' &&
				((property.key.type === 'Identifier' && property.key.name === 'url') ||
					(property.key.type === 'StringLiteral' &&
						property.key.value === 'url')),
		);
		if (
			urlProperty?.type !== 'ObjectProperty' ||
			urlProperty.value.type !== 'StringLiteral'
		) {
			throw new Error('Could not find the Element Library URL in the config.');
		}

		const url = new URL(urlProperty.value.value).href;
		if (statements.has(url)) {
			throw new Error('Element Library URLs must be unique.');
		}

		statements.set(url, statement);
		indices.add(index);
	}

	const currentOrder = [...statements.keys()];
	if (
		currentOrder.length !== order.length ||
		currentOrder.some((url) => !order.includes(url))
	) {
		throw new Error(
			'Element Libraries changed or are not declared as top-level literal config calls. Refresh and try again.',
		);
	}

	if (currentOrder.every((url, index) => url === order[index])) {
		return configContents;
	}

	let nextIndex = 0;
	ast.program.body = ast.program.body.map((statement, index) => {
		if (!indices.has(index)) {
			return statement;
		}

		return statements.get(order[nextIndex++]) as Statement;
	});

	return recast.print(ast, {lineTerminator: '\n'}).code;
};
