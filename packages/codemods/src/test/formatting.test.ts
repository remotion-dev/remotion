import {expect, test} from 'bun:test';
import {
	applyCodemodChanges,
	getJsxNodes,
	updateJsxNodeKeyframes,
	updateJsxNodeProps,
} from '../index';
import {getChangedContents} from './get-changed-contents';

for (const indentation of ['\t', '  ', '    ']) {
	for (const endOfLine of ['\n', '\r\n']) {
		test(`prop and keyframe edits preserve formatting with ${JSON.stringify({indentation, endOfLine})}`, async () => {
			const format = (source: string) =>
				source.replaceAll('\t', indentation).replaceAll('\n', endOfLine);
			const input = format(`/**
 * A composition with a header and a render prop.
 */
import {AbsoluteFill} from 'remotion';

const unrelated   = {keep:"this spacing"};

export const Video = () => {
	return (
		<AbsoluteFill
			style={{
				opacity: 0.5,
			}}
			render = {() => (
				<section>
					{/* Keep the callback and its indentation. */}

					<span />
				</section>
			)}
		/>
	);
};
`);
			const filePath = 'src/Video.tsx';
			const project = {rootDir: '/', files: {[filePath]: input}};
			const [node] = getJsxNodes({project, filePath});
			const changed = updateJsxNodeProps({
				project,
				node,
				props: {title: 'Hello'},
			});
			const expected = input
				.replace('render = {', 'render={')
				.replace(format('\t\t/>'), format("\t\t\ttitle={'Hello'}\n\t\t/>"));
			expect(getChangedContents(changed, filePath)).toBe(expected);
			const afterChange = applyCodemodChanges(project, changed.changes);

			const repeated = updateJsxNodeProps({
				project: afterChange,
				node: changed.updatedNode,
				props: {title: 'Hello'},
			});
			const afterRepeat = applyCodemodChanges(afterChange, repeated.changes);
			expect(afterRepeat.files[filePath]).toBe(expected);

			const animated = await updateJsxNodeKeyframes({
				project: afterRepeat,
				node: repeated.updatedNode,
				updates: [
					{key: 'style.opacity', operation: {type: 'add', frame: 0, value: 0}},
				],
			});
			expect(getChangedContents(animated, filePath)).toBe(
				expected
					.replace(
						'{AbsoluteFill}',
						'{AbsoluteFill, interpolate, useCurrentFrame}',
					)
					.replace(
						format('\treturn ('),
						format('\tconst frame = useCurrentFrame();\n\treturn ('),
					)
					.replace(
						format('\t\t\t\topacity: 0.5,'),
						format(`				opacity: interpolate(frame, [0], [0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp'
				})`),
					),
			);
		});
	}
}
