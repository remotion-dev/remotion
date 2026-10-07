import {expect, test} from 'bun:test';
import {insertBasicCaptions} from '../insert-basic-captions';
import {parseAst} from '../sequence-props/parse-ast';
import {lineContainingToNodePath} from './node-path-test-utils';

test('caption imports avoid parameters, local declarations and destructuring', () => {
	const fixtures = [
		{
			declarations: '',
			parameter: 'BasicCaptions',
			local: '',
		},
		{
			declarations: '',
			parameter: '',
			local: 'const BasicCaptions = () => null;',
		},
		{
			declarations: 'const {BasicCaptions} = components;',
			parameter: '',
			local: '',
		},
		{
			declarations:
				'const [BasicCaptions, {nested: BasicCaptions2}] = components;',
			parameter: '',
			local: '',
		},
		{
			declarations: "import {BasicCaptions} from './basic-captions.element';",
			parameter: 'BasicCaptions',
			local: '',
		},
	];
	for (const element of [
		null,
		{componentName: 'BasicCaptions', initialProps: null},
	]) {
		for (const {declarations, parameter, local} of fixtures) {
			const input = `import {Video} from '@remotion/media';
${declarations}
export const Comp = (${parameter}) => {
  ${local}
  return <Video src="video.mp4" />;
};`;
			const {output} = insertBasicCaptions({
				element,
				input,
				nodePath: lineContainingToNodePath(input, '<Video'),
				captions: [],
				durationInFrames: null,
				premountFor: null,
			});
			const alias = declarations.includes('BasicCaptions2')
				? 'BasicCaptions3'
				: 'BasicCaptions2';
			expect(output).toContain(`BasicCaptions as ${alias}`);
			expect(output).toMatch(new RegExp(`<${alias}\\s+captions=\\{\\[\\]\\}`));
			if (!declarations.startsWith('import')) {
				expect(output).toContain(declarations);
			}

			expect(output).toContain(`export const Comp = (${parameter}) => {`);
			parseAst(output);
		}
	}
});

const captions = [
	{
		text: 'Here',
		startMs: 1440,
		endMs: 1620,
		timestampMs: 1530,
		confidence: null,
	},
	{
		text: ' are',
		startMs: 1620,
		endMs: 1820,
		timestampMs: 1720,
		confidence: null,
	},
];

test('inserts captions with save-stable defaults without formatting existing source', () => {
	const input = `import { Video } from "@remotion/media";

const untouched   = {keep : "this spacing"};

export const Comp = () => (
  <>
    <Video src="video.mp4" />
  </>
);
`;
	const {output} = insertBasicCaptions({
		element: null,
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
		captions,
		durationInFrames: 177.45,
		premountFor: 30,
	});

	expect(output).toBe(`import { BasicCaptions } from "./basic-captions.element";
import { Video } from "@remotion/media";

const untouched   = {keep : "this spacing"};

export const Comp = () => (
  <>
    <Video src="video.mp4" />
    <BasicCaptions
      captions={[
        {
          text: "Here",
          startMs: 1440,
          endMs: 1620,
          timestampMs: 1530,
          confidence: null,
        },
        {
          text: " are",
          startMs: 1620,
          endMs: 1820,
          timestampMs: 1720,
          confidence: null,
        },
      ]}
      durationInFrames={177.45}
      premountFor={30}
    />
  </>
);
`);
});

test('uses the source whitespace and configured trailing comma style', () => {
	const input = [
		"import {Video} from '@remotion/media'",
		'',
		'export const Comp = () => (',
		'\t<>',
		'\t\t<Video src="video.mp4" />',
		'\t</>',
		')',
		'',
	].join('\r\n');
	const {output} = insertBasicCaptions({
		element: null,
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
		captions: [
			{
				...captions[0],
				text: "Jonny's video",
				pageBreakAfter: true,
			},
		],
		durationInFrames: 90,
		premountFor: null,
		prettierConfigOverride: {trailingComma: 'none'},
	});

	expect(output).toBe(
		[
			"import {BasicCaptions} from './basic-captions.element'",
			"import {Video} from '@remotion/media'",
			'',
			'export const Comp = () => (',
			'\t<>',
			'\t\t<Video src="video.mp4" />',
			'\t\t<BasicCaptions',
			'\t\t\tcaptions={[',
			'\t\t\t\t{',
			'\t\t\t\t\ttext: "Jonny\'s video",',
			'\t\t\t\t\tstartMs: 1440,',
			'\t\t\t\t\tendMs: 1620,',
			'\t\t\t\t\ttimestampMs: 1530,',
			'\t\t\t\t\tconfidence: null,',
			'\t\t\t\t\tpageBreakAfter: true',
			'\t\t\t\t}',
			'\t\t\t]}',
			'\t\t\tdurationInFrames={90}',
			'\t\t/>',
			'\t</>',
			')',
			'',
		].join('\r\n'),
	);
});
