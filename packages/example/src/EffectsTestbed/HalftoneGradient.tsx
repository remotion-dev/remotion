import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import {Solid, useVideoConfig} from 'remotion';

export const HalftoneGradient = () => {
	const {width, height} = useVideoConfig();
	return (
		<Solid
			effects={[halftoneLinearGradient({})]}
			width={width}
			height={height}
		/>
	);
};
