import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const ErrorOnFrame10: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame === 10) {
		const a = new Array(0.5);
		console.log(a);
	}
	return <AbsoluteFill />;
};
