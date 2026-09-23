import {expect, test} from 'bun:test';
import {updateVisualControls} from '@remotion/codemods';

const contents = `
import {makeTransform, matrix3d} from '@remotion/animation-utils';
import {visualControl} from '@remotion/studio';
import {zMatrix, zTextarea} from '@remotion/zod-types';
import {AbsoluteFill, staticFile} from 'remotion';

export const VisualControls = () => {
	const matrix = visualControl(
		'my-matrix',
		[9.63, 0.83, 1.3, 0, 0, 2.79, 0, 0, 1.26, 0.35, 1, 0, 0, 0, 0, 1] as const,
		zMatrix(),
	);

	// Is being tested against
	const matrix2 = visualControl(\`my-matrix-2\`, 123);
	const val3 = visualControl('my-matrix-4', 1234);
	const val4 = visualControl(\`value 🍋\`, 'hi there');
	const val5 = visualControl(\`text 🍋\`, 'hi there', zTextarea());

	const val6 = visualControl('file', staticFile('clip001.mkv'));

	return (
		<AbsoluteFill
			className="bg-red-300 text-7xl flex flex-1 items-center justify-center"
			style={{
				transform: makeTransform([matrix3d(...matrix)]),
			}}
		>
			<p>{matrix.join(', ')}</p>
			<p>{val5}</p>
		</AbsoluteFill>
	);
};
`;

test('updates multiple visual controls through the packaged public API', () => {
	const {project} = updateVisualControls({
		project: {rootDir: '/', files: {'Root.tsx': contents}},
		filePath: 'Root.tsx',
		changes: [
			{
				id: 'my-matrix-4',
				newValueSerialized: JSON.stringify(123),
				newValueIsUndefined: false,
				enumPaths: [],
			},
			{
				id: 'my-matrix-2',
				newValueSerialized: JSON.stringify(456),
				newValueIsUndefined: false,
				enumPaths: [[]],
			},
		],
	});

	expect(project.files['Root.tsx']).toContain(
		`visualControl('my-matrix-4', 123`,
	);
	expect(project.files['Root.tsx']).toContain(
		'const matrix2 = visualControl(`my-matrix-2`, 456 as const',
	);
});
