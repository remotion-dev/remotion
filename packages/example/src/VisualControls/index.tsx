import {makeTransform, matrix3d} from '@remotion/animation-utils';
import {useVisualControls} from '@remotion/studio';
import {zMatrix} from '@remotion/zod-types';
import {AbsoluteFill} from 'remotion';

export const VisualControls = () => {
	const {visualControl} = useVisualControls();

	const matrix = visualControl(
		'my-matrix',
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
		zMatrix(),
	);

	const matrix2 = visualControl(
		`my-matrix-2`,
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as const,
		zMatrix(),
	);

	return (
		<AbsoluteFill
			className="bg-red-300 text-7xl flex flex-1 items-center justify-center"
			style={{
				transform: makeTransform([matrix3d(...matrix)]),
			}}
		>
			<p>{matrix.join(', ')}</p>
		</AbsoluteFill>
	);
};
