import {useVisualControl} from '@remotion/studio';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const VisualControls = () => {
	const {visualControl} = useVisualControl();

	return (
		<AbsoluteFill className="bg-red-300  text-9xl">
			<p>{visualControl('testedexxx', 'test')}</p>
			<p>{visualControl('testedex', 1)}</p>
			<p>
				{JSON.stringify(
					visualControl(
						'object',
						{
							a: 'b',
							c: 'd',
						},
						z.object({
							a: z.string(),
							c: z.string(),
						}),
					),
				)}
			</p>
		</AbsoluteFill>
	);
};
