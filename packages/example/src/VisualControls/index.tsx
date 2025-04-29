import {visualControl} from '@remotion/studio';
import {AbsoluteFill} from 'remotion';

export const VisualControls = () => {
	const rotation = visualControl('rotation', 180);

	return (
		<AbsoluteFill
			className="bg-red-300 text-7xl flex flex-1 items-center justify-center"
			style={{
				transform: `rotate(${rotation}deg)`,
			}}
		>
			Hello
		</AbsoluteFill>
	);
};
