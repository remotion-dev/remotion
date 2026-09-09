import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {getNodePathForRecastPath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';
import {splitJsxSequence} from '../split-jsx-sequence';

test('splits fractional timing without persisting arithmetic noise', async () => {
	const input =
		'export const Comp = () => <Sequence from={0.1} durationInFrames={1.2} trimBefore={0.2} />;';
	const ast = parseAst(input);
	let nodePath = null;
	recast.types.visit(ast, {
		visitJSXOpeningElement(path) {
			nodePath = getNodePathForRecastPath(path, ast);
			return false;
		},
	});
	if (!nodePath) throw new Error('Could not find Sequence');
	const {output} = await splitJsxSequence({
		input,
		nodePath,
		sequenceKeys: ['from', 'durationInFrames', 'trimBefore'],
		splitFrame: 1,
	});
	expect(output).toContain('durationInFrames={0.9}');
	expect(output).toContain('durationInFrames={0.3}');
	expect(output).toContain('trimBefore={1.1}');
});
