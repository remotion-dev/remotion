import {expect, test} from 'bun:test';
import {updateSequenceProps} from '../codemods/update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const componentInput = `import {Video} from '@remotion/media';

const src = 'https://remotion.media/video.mp4';

export const Component = () => {
    return <Video src={src} />;
};
`;

test('Should add style.scale to a Video component and format with prettier', async () => {
	const {output, oldValueString, formatted} = await updateSequenceProps({
		input: componentInput,
		nodePath: lineColumnToNodePath(componentInput, 6),
		key: 'style.scale',
		value: 2,
		defaultValue: null,
		prettierConfigOverride: {
			singleQuote: true,
			bracketSpacing: false,
			useTabs: true,
		},
	});

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
