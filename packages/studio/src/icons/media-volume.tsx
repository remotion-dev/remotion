const size = 20;

const speakerPath =
	'M4.5 7.5H2a0.5 0.5 0 0 0 -0.5 0.5v4a0.5 0.5 0 0 0 0.5 0.5h2.5l5 5V2.5l-5 5z';

const soundWavesPath =
	'M12.5 7.5a3.5 3.5 0 0 1 0 5M15.5 4.5a7.5 7.5 0 0 1 0 11';

export const VolumeOffIcon: React.FC<{readonly color: string}> = ({color}) => {
	return (
		<svg width={size} height={size} viewBox="0 0 20 20">
			<path
				d={`${speakerPath}M1.5 0.5 18.5 19.5`}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
			<path
				d={soundWavesPath}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeWidth="1"
			/>
		</svg>
	);
};

export const VolumeOnIcon: React.FC<{readonly color: string}> = ({color}) => {
	return (
		<svg width={size} height={size} viewBox="0 0 20 20">
			<path
				d={`${speakerPath}${soundWavesPath}`}
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1"
			/>
		</svg>
	);
};
