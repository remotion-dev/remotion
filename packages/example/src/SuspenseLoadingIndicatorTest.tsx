import {AbsoluteFill} from 'remotion';

const SuspenseLoadingIndicatorTest: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#1f2428',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 14,
				justifyContent: 'center',
			}}
		>
			Loaded
		</AbsoluteFill>
	);
};

export default SuspenseLoadingIndicatorTest;
