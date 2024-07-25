import {RemotionRiveCanvas} from '@remotion/rive';
import {focusDefaultPropsPath} from '@remotion/studio';
import {useCallback} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

const RiveVehicle = () => {
	const {height, width} = useVideoConfig();

	const click = useCallback(() => {
		focusDefaultPropsPath({
			path: ['union', 3, 'type'],
			scrollBehavior: 'smooth',
		});
	}, []);

	return (
		<AbsoluteFill style={{height, width}} onClick={click}>
			<RemotionRiveCanvas src="https://cdn.rive.app/animations/vehicles.riv" />
		</AbsoluteFill>
	);
};

export default RiveVehicle;
