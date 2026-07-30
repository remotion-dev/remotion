import {expect, test} from 'bun:test';
import {insertSolidIntoSource} from '..';

test('inserts a Solid into a component source file', () => {
	const result = insertSolidIntoSource({
		exportName: 'MyComposition',
		height: 720,
		position: null,
		source: `import {AbsoluteFill} from 'remotion';

export const MyComposition = () => <AbsoluteFill>Existing</AbsoluteFill>;
`,
		width: 1280,
	});

	expect(result.output).toContain(
		"import {AbsoluteFill, Solid} from 'remotion';",
	);
	expect(result.output).toContain(
		'<Solid width={1280} height={720} color="gray"',
	);
	expect(result.line).toBe(3);
});

test('inserts a timeline Solid in a positioned Sequence', () => {
	const result = insertSolidIntoSource({
		exportName: 'MyComposition',
		from: 42,
		height: 720,
		position: {x: 120.25, y: 80},
		source: `export const MyComposition = () => null;\n`,
		width: 1280,
	});

	expect(result.output).toContain("import {Solid, Sequence} from 'remotion';");
	expect(result.output).toContain('<Sequence from={42}');
	expect(result.output).toContain("translate: '120.3px 80px'");
	expect(result.output).toContain('<Solid width={1280} height={720}');
});
