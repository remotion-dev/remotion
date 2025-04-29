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
	const matrix2 = visualControl(`my-matrix-2`, 123);
	const val3 = visualControl('my-matrix-4', 1234);
	const val4 = visualControl(`value 🍋`, 'hi there');
	const val5 = visualControl(`text 🍋`, 'hi there', zTextarea());

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
