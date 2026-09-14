import {expect, test} from 'bun:test';
import type {BlockStatement, Statement} from '@babel/types';
import * as recast from 'recast';
import {
	captureFunctionSourceSnapshots,
	getFunctionSourceEditsForPrependedStatements,
} from '../function-source-edits';
import {parseAst} from '../sequence-props/parse-ast';

const b = recast.types.builders;

test('rejects inserted statements outside the leading prefix', () => {
	const input = `export const C = () => {
  first();
};
`;
	const ast = parseAst(input);
	const snapshots = captureFunctionSourceSnapshots(ast);
	const body = snapshots[0]?.functionNode.body;
	if (body?.type !== 'BlockStatement') {
		throw new Error('Expected a block-bodied function');
	}

	body.body.push(
		b.expressionStatement(
			b.callExpression(b.identifier('second'), []),
		) as unknown as Statement,
	);

	expect(() =>
		getFunctionSourceEditsForPrependedStatements({
			indentationUnit: '  ',
			input,
			printNode: (node) => recast.prettyPrint(node).code,
			reprintBlockBodies: new Set(),
			snapshots,
		}),
	).toThrow('Function source edits only support prepended statements');
});

test('filters edits nested inside a reprinted function body', () => {
	const input = `export const C = () => items.map(() => <span />);
`;
	const ast = parseAst(input);
	const snapshots = captureFunctionSourceSnapshots(ast);
	for (const {functionNode} of snapshots) {
		if (functionNode.body.type === 'BlockStatement') {
			throw new Error('Expected expression-bodied functions');
		}

		functionNode.body = b.blockStatement([
			b.returnStatement(
				functionNode.body as Parameters<typeof b.returnStatement>[0],
			),
		]) as unknown as BlockStatement;
	}

	const {coveredRanges, edits} = getFunctionSourceEditsForPrependedStatements({
		indentationUnit: '  ',
		input,
		printNode: (node) => recast.prettyPrint(node).code,
		reprintBlockBodies: new Set(),
		snapshots,
	});

	expect(coveredRanges).toHaveLength(2);
	expect(edits).toHaveLength(1);
});
