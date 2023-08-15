import {AbsoluteFill, useVideoConfig} from 'remotion';

const RiveVehicle = () => {
	const {height, width} = useVideoConfig();

	return <AbsoluteFill style={{height, width}} />;
};

export default RiveVehicle;
