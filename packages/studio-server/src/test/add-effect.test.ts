import {expect, test} from 'bun:test';
import {addEffect} from '../codemods/add-effect';
import {lineColumnToNodePath} from './test-utils';

const buildInput = (jsx: string) => `import {Solid} from 'remotion';

export const Comp = () => {
\treturn ${jsx};
};
`;

test('addEffect adds an effects prop and import', async () => {
	const input = buildInput('<Solid width={100} height={100} />');
	const {output, effectLabel, nodeLabel} = await addEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 4),
		effectName: 'brightness',
		effectImportPath: '@remotion/effects/brightness',
		effectConfig: {amount: 1.2},
	});

	expect(effectLabel).toBe('brightness()');
	expect(nodeLabel).toBe('<Solid>');
	expect(output).toContain(
		"import { brightness } from '@remotion/effects/brightness';",
	);
	expect(output).toContain('effects={[');
	expect(output).toContain('brightness({');
	expect(output).toContain('amount: 1.2');
});

test('addEffect appends to an existing effects array', async () => {
	const input = `import {Solid} from 'remotion';
import {tint} from '@remotion/effects/tint';

export const Comp = () => {
\treturn <Solid width={100} height={100} effects={[tint({color: "red"})]} />;
};
`;
	const {output} = await addEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 5),
		effectName: 'contrast',
		effectImportPath: '@remotion/effects/contrast',
		effectConfig: {amount: 0.8},
	});

	expect(output).toContain(
		"import { contrast } from '@remotion/effects/contrast';",
	);
	expect(output).toContain('tint({');
	expect(output).toContain('contrast({');
	expect(output).toContain('amount: 0.8');
});

test('addEffect aliases imports when the effect name is already bound', async () => {
	const input = `import {Solid} from 'remotion';

const brightness = 1;

export const Comp = () => {
\treturn <Solid width={100} height={100} />;
};
`;
	const {output} = await addEffect({
		input,
		sequenceNodePath: lineColumnToNodePath(input, 6),
		effectName: 'brightness',
		effectImportPath: '@remotion/effects/brightness',
		effectConfig: {amount: 0.5},
	});

	expect(output).toContain(
		"import { brightness as brightnessEffect } from '@remotion/effects/brightness';",
	);
	expect(output).toContain('brightnessEffect({');
});

test('addEffect rejects non-Remotion effect imports', async () => {
	const input = buildInput('<Solid width={100} height={100} />');

	await expect(
		addEffect({
			input,
			sequenceNodePath: lineColumnToNodePath(input, 4),
			effectName: 'brightness',
			effectImportPath: 'third-party-effect',
			effectConfig: {},
		}),
	).rejects.toThrow(/Unsupported effect import/);
});
