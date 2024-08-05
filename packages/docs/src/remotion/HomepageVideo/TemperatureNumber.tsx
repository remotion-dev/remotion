import React from 'react';
import {Wheel} from './DigitWheel';

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly temperatureInCelsius: number;
}> = ({theme, temperatureInCelsius}) => {
	const temperatureInFahrenheit = ((temperatureInCelsius * 9) / 5 + 32).toFixed(
		0,
	);

	const celsiusDegree = String(temperatureInCelsius);
	const fahrenheitDegree = String(temperatureInFahrenheit);

	const paddedCelsiusDegree = celsiusDegree
		.padStart(fahrenheitDegree.length, '0')
		.split('');
	const paddedFahrenheitDegree = fahrenheitDegree
		.padStart(paddedCelsiusDegree.length, '0')
		.split('');

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
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				marginTop: -10,
			}}
		>
			{paddedCelsiusDegree.map((digit, i) => (
				<Wheel
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					delay={i * 4}
					renderDigit={(_i) => 9 - _i}
					digits={[
						Number(digit) - 1,
						Number(digit),
						Number(paddedFahrenheitDegree[i]),
					]}
				/>
			))}
			°
			<Wheel
				// eslint-disable-next-line react/no-array-index-key
				delay={paddedCelsiusDegree.length * 4 - 2}
				digits={[1, 1, 0]}
				renderDigit={(_i) => (_i % 2 === 0 ? 'F' : 'C')}
			/>
		</div>
	);
};
