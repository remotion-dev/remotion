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
