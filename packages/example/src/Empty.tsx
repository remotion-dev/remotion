import {RotatingStarburst as RotatingStarburst2} from './rotating-starburst-copy.element';
export const Empty = () => {
	return (
		<>
			<RotatingStarburst2
				durationInFrames={240}
				name="Rotating Starburst"
				from={0}
				style={{position: 'absolute'}}
			/>
		</>
	);
};
