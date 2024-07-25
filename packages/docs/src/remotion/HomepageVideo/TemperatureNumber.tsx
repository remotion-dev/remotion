import React from 'react';

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
}> = ({theme}) => {
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
			}}
		>
			23°C
		</div>
	);
};
