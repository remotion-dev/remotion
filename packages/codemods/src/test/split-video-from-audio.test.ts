import {expect, test} from 'bun:test';
import {splitVideoFromAudio} from '../split-video-from-audio';
import {lineContainingToNodePath} from './node-path-test-utils';

const wrap = (
	element: string,
	imports = `import {Video} from '@remotion/media';`,
) => `${imports}

export const Comp = () => {
	return (
		<>
			${element}
		</>
	);
};
`;

const split = (element: string, imports?: string) => {
	const input = wrap(element, imports);
	const {output} = splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, element),
	});

	return output;
};

test('splitVideoFromAudio mutes the video and adds an Audio with the same timing', () => {
	const output = split(
		'<Video src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} style={{opacity: 0.5}} />',
	);

	const singleLine = output.replace(/\s+/g, ' ');

	expect(output).toContain(`import {Video, Audio} from '@remotion/media';`);
	expect(singleLine).toContain(
		'<Video src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} style={{opacity: 0.5}} muted />',
	);
	expect(singleLine).toContain(
		'<Audio src="video.mp4" from={10} durationInFrames={50} trimBefore={5} playbackRate={2} volume={0.5} />',
	);
});

test('splitVideoFromAudio preserves unrelated source formatting without calling the formatter', () => {
	const input = `import{Video}from"@remotion/media"

const untouched  = {keep : "spacing"}
export const Comp=()=>(
  <>
    <Video
      src = {"video.mp4"}
      from = {10}
      style = {{opacity:.5}}
    />
    <div  data-value = "unchanged"/>
  </>
)
`;
	let formatCalls = 0;
	const {formatted, nodePathRemappings, output} = splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
		formatFile: () => {
			formatCalls++;
			throw new Error('Prettier must not be called');
		},
	});

	expect(formatCalls).toBe(0);
	expect(formatted).toBe(true);
	expect(output).toBe(`import{Video, Audio}from"@remotion/media"

const untouched  = {keep : "spacing"}
export const Comp=()=>(
  <>
    <Video
      src = {"video.mp4"}
      from = {10}
      style = {{opacity:.5}}
      muted
    />
    <Audio src={"video.mp4"} from={10} />
    <div  data-value = "unchanged"/>
  </>
)
`);
	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, '<Video'),
			newNodePath: lineContainingToNodePath(output, '<Video'),
			oldJsxName: 'Video',
			newJsxName: 'Video',
		},
		{
			oldNodePath: lineContainingToNodePath(input, '<div'),
			newNodePath: lineContainingToNodePath(output, '<div'),
			oldJsxName: 'div',
			newJsxName: 'div',
		},
		{
			oldNodePath: null,
			newNodePath: lineContainingToNodePath(output, '<Audio'),
			oldJsxName: null,
			newJsxName: 'Audio',
		},
	]);
});

test('splitVideoFromAudio does not copy non-audio props', () => {
	const output = split(
		'<Video src="video.mp4" name="my video" freeze={20} crop={{x: 0, y: 0, width: 100, height: 100}} />',
	);

	expect(output).toContain('<Audio src="video.mp4" />');
});

test('splitVideoFromAudio wraps a root video in a fragment', () => {
	const input = `import {Video} from '@remotion/media';

export const Comp = () => <Video src="video.mp4" />;
`;
	const {output} = splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
	});

	expect(output).toBe(`import {Video, Audio} from '@remotion/media';

export const Comp = () => <>
  <Video src="video.mp4" muted />
  <Audio src="video.mp4" />
</>;
`);
});

test('splitVideoFromAudio separates siblings with one space on a shared line', () => {
	const input = `import {Video} from '@remotion/media';

export const Comp = () => (
  <div>
    <Video src="video.mp4" /></div>
);
`;
	const {output} = splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
	});

	expect(output).toBe(`import {Video, Audio} from '@remotion/media';

export const Comp = () => (
  <div>
    <Video src="video.mp4" muted /> <Audio src="video.mp4" /></div>
);
`);
});

test('splitVideoFromAudio preserves CRLF and tab indentation', () => {
	const input = [
		`import {Video} from '@remotion/media';`,
		'',
		'export const Comp = () => {',
		'\treturn (',
		'\t\t<>',
		'\t\t\t<Video',
		'\t\t\t\tsrc="video.mp4"',
		'\t\t\t\ttrimBefore={10}',
		'\t\t\t/>',
		'\t\t</>',
		'\t);',
		'};',
		'',
	].join('\r\n');
	const {output} = splitVideoFromAudio({
		input,
		nodePath: lineContainingToNodePath(input, '<Video'),
	});

	expect(output).toBe(
		[
			`import {Video, Audio} from '@remotion/media';`,
			'',
			'export const Comp = () => {',
			'\treturn (',
			'\t\t<>',
			'\t\t\t<Video',
			'\t\t\t\tsrc="video.mp4"',
			'\t\t\t\ttrimBefore={10}',
			'\t\t\t\tmuted',
			'\t\t\t/>',
			'\t\t\t<Audio src="video.mp4" trimBefore={10} />',
			'\t\t</>',
			'\t);',
			'};',
			'',
		].join('\r\n'),
	);
});

test('splitVideoFromAudio replaces an existing muted prop', () => {
	const output = split('<Video src="video.mp4" muted={false} />');

	expect(output).toContain('<Video src="video.mp4" muted />');
	expect(output).not.toContain('muted={false}');
});

test('splitVideoFromAudio reuses an existing Audio import', () => {
	const output = split(
		'<Video src="video.mp4" />',
		`import {Audio, Video} from '@remotion/media';`,
	);

	expect(output).toContain(`import {Audio, Video} from '@remotion/media';`);
	expect(output.match(/from '@remotion\/media'/g)?.length).toBe(1);
});

test('splitVideoFromAudio uses an aliased Audio import', () => {
	const output = split(
		'<Video src="video.mp4" />',
		`import {Audio as Sound, Video} from '@remotion/media';`,
	);

	expect(output).toContain(
		`import {Audio as Sound, Video} from '@remotion/media';`,
	);
	expect(output).toContain('<Sound src="video.mp4" />');
});

test('splitVideoFromAudio imports Audio from the same module as the tag', () => {
	const output = split(
		'<OffthreadVideo src="video.mp4" from={5} />',
		`import {OffthreadVideo} from 'remotion';`,
	);

	expect(output).toContain(`import {OffthreadVideo, Audio} from 'remotion';`);
	expect(output).toContain('<OffthreadVideo src="video.mp4" from={5} muted />');
	expect(output).toContain('<Audio src="video.mp4" from={5} />');
});

test('splitVideoFromAudio follows import aliases', () => {
	const output = split(
		'<V src="video.mp4" />',
		`import {Video as V} from '@remotion/media';`,
	);

	expect(output).toContain(
		`import {Video as V, Audio} from '@remotion/media';`,
	);
	expect(output).toContain('<Audio src="video.mp4" />');
});

test('splitVideoFromAudio rejects elements without a src attribute', () => {
	expect(() => split('<Video from={0} />')).toThrow(
		'<Video> has no src attribute',
	);
});

test('splitVideoFromAudio rejects unimported tags', () => {
	expect(() => split('<video src="video.mp4" />')).toThrow(
		'Could not find the import of <video>',
	);
});

test('splitVideoFromAudio rejects an Audio import from another module', () => {
	expect(() =>
		split(
			'<Video src="video.mp4" />',
			`import {Video} from '@remotion/media';\nimport {Audio} from 'remotion';`,
		),
	).toThrow('Audio is already imported from "remotion"');
});
