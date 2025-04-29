import {makeTransform, matrix3d} from '@remotion/animation-utils';
import {visualControl} from '@remotion/studio';
import {zMatrix, zTextarea} from '@remotion/zod-types';
import {AbsoluteFill, staticFile} from 'remotion';

export const VisualControls = () => {
	const matrix = visualControl(
		'my-matrix',
		[7.96,0.34,0,0,0,2.79,0,0,1.26,0.35,1,0,0,0,0,1] as const,
		zMatrix(),
	);

	const matrix2 = visualControl(
		`my-matrix-3`,
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
		zMatrix(),
	);
	const val3 = visualControl(`my-matrix-4`, 1234);
	const val4 = visualControl(`value 🍋`, 'hi there');
	const val5 = visualControl(`text 🍋`, 'hi there', zTextarea());

	const val6 = visualControl('file', staticFile("clip001.mkv"));

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
