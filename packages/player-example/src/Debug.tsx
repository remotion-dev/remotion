import {AbsoluteFill} from 'remotion';
import {ThreeDebug} from './ThreeDebug';
export const Debug = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'red',
			}}
		>
			<ThreeDebug />
		</AbsoluteFill>
	);
};
