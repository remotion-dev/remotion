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

test('Should add style.scale to a Video component and format with prettier', async () => {
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
	expect(output).toBe(`import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
\treturn (
\t\t<Video
\t\t\tsrc={src}
\t\t\tstyle={{
\t\t\t\tscale: 2,
\t\t\t}}
\t\t/>
\t);
};
`);
});

test('Should resolve prettier config if override is null', async () => {
	const {output, formatted} = await updateSequenceProps({
		videoConfigValues: null,
		input: componentInput,
		nodePath: lineColumnToNodePath(componentInput, 6),
		updates: [{key: 'style.scale', value: 2, defaultValue: null}],
		prettierConfigOverride: null,
		schema: NoReactInternals.sequenceSchema,
	});

	expect(formatted).toBe(true);
	expect(output).toContain('\treturn (');
	expect(output).toContain('style={{');
});
