import {expect, test} from 'bun:test';
import {insertBasicCaptions} from '../insert-basic-captions';
import {lineContainingToNodePath} from './node-path-test-utils';

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
