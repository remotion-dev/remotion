import {makeTransform, matrix3d} from '@remotion/animation-utils';
import {visualControl} from '@remotion/studio';
import {zMatrix} from '@remotion/zod-types';
import {AbsoluteFill} from 'remotion';

export const VisualControls = () => {
	const matrix = visualControl(
		'my-matrix',
		[9.63, 0.83, 1.3, 0, 0, 2.79, 0, 0, 1.26, 0.35, 1, 0, 0, 0, 0, 1] as const,
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
