import {AbsoluteFill} from 'remotion';

export const TriangleComp: React.FC = () => {
	return (
		<AbsoluteFill style={{transform: 'rotate(45deg)'}}>
			<svg viewBox="0 0 100 100" width="100" height="100">
				<polygon points="50,10 90,90 10,90" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};
