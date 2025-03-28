import {useVisualControl} from '@remotion/studio';
import {zMatrix} from '@remotion/zod-types';
import {AbsoluteFill} from 'remotion';

export const VisualControls = () => {
	const {visualControl} = useVisualControl();

	const matrix = visualControl(
		'william',
		[1, 0, 0, 0, 1, 0, 0, 0, 1],
		zMatrix(),
	);

	return (
		<AbsoluteFill className="bg-red-300 text-7xl">
			<p>{matrix.join(', ')}</p>
		</AbsoluteFill>
	);
};
