import {AbsoluteFill, useVideoConfig} from 'remotion';
import {RemotionRiveCanvas} from '@remotion/rive';

const RiveVehicle = () => {
	const {height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{height, width}}>
			<RemotionRiveCanvas src="https://cdn.rive.app/animations/vehicles.riv" />
		</AbsoluteFill>
	);
};

export default RiveVehicle;
