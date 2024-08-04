import React from 'react';

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly num: number;
}> = ({theme, num}) => {
	return (
		<div
			style={{
				lineHeight: 1.1,
				fontFamily: 'GT Planar',
				textAlign: 'center',
				fontWeight: 'bold',
				fontSize: 60,
				color: theme === 'dark' ? 'white' : 'black',
				fontFeatureSettings: "'ss03' 1",
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			{num}°C
		</div>
	);
};
