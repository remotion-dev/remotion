import {AbsoluteFill} from 'remotion';

export const TriangleComp: React.FC = () => {
	return (
		<AbsoluteFill style={{transform: 'rotate(45deg)', transformOrigin: '0 0'}}>
			<svg viewBox="0 0 100 100" width="100" height="100">
				<rect x="0" y="0" width="50" height="50" fill="orange" />
			</svg>
		</AbsoluteFill>
	);
};
