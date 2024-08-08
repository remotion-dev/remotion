import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TemperatureNumber} from './TemperatureNumber';

export const Temperature: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly city: string;
	temperatureInCelsius: number;
}> = ({theme, city, temperatureInCelsius}) => {
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					paddingLeft: 20,
					paddingRight: 20,
				}}
			>
				<div
					style={{
						color: '#0b84f3',
						fontFamily: 'GT Planar',
						fontWeight: '500',
						fontSize: 13,
						textAlign: 'center',
						marginTop: 5,
					}}
				>
					Temperature in {city}
				</div>

				<TemperatureNumber
					theme={theme}
					temperatureInCelsius={temperatureInCelsius}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
