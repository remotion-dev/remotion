import {expect, test} from 'bun:test';
import {NoReactInternals} from 'remotion/no-react';
import {updateSequenceProps} from '../codemods/update-sequence-props/update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const componentInput = `import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
    return <Video src={src} />;
};
`;

const expectedOutput = `import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
    return <Video
        src={src}
        style={{
            scale: 2
        }}
    />;
};
`;

test('Should add style.scale without changing the existing indentation style', async () => {
	const {output, oldValueStrings, formatted} = await updateSequenceProps({
		videoConfigValues: null,
		input: componentInput,
		nodePath: lineColumnToNodePath(componentInput, 6),
		updates: [{key: 'style.scale', value: 2, defaultValue: null}],
		prettierConfigOverride: {
			singleQuote: true,
			bracketSpacing: false,
			useTabs: true,
		},
		schema: NoReactInternals.sequenceSchema,
	});
	const oldValueString = oldValueStrings[0];

	expect(oldValueString).toBe('');
	expect(formatted).toBe(true);
	expect(output).toBe(expectedOutput);
});

test('Should infer source formatting if the config override is null', async () => {
	const {output, formatted} = await updateSequenceProps({
		videoConfigValues: null,
		input: componentInput,
		nodePath: lineColumnToNodePath(componentInput, 6),
		updates: [{key: 'style.scale', value: 2, defaultValue: null}],
		prettierConfigOverride: null,
		schema: NoReactInternals.sequenceSchema,
	});

	expect(formatted).toBe(true);
	expect(output).toBe(expectedOutput);
});
