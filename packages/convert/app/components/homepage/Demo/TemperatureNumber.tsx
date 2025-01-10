import React from 'react';
import {Wheel} from './DigitWheel';

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly temperatureInCelsius: number;
}> = ({theme, temperatureInCelsius}) => {
	const temperatureInFahrenheit = (temperatureInCelsius * 9) / 5 + 32;

	const celsiusDegree = Math.abs(temperatureInCelsius);
	const fahrenheitDegree = Math.abs(temperatureInFahrenheit);

	const paddedCelsiusDegree = String(celsiusDegree)
		.padStart(fahrenheitDegree.toFixed(0).length, '0')
		.split('');
	const paddedFahrenheitDegree = fahrenheitDegree
		.toFixed(0)
		.padStart(paddedCelsiusDegree.length, '0')
		.split('');

	return (
		<div
			style={{
				lineHeight: 1.1,
				fontFamily: 'GTPlanar',
				textAlign: 'center',
				fontWeight: 'bold',
				fontSize: 60,
				color: theme === 'dark' ? 'white' : 'black',
				fontVariantNumeric: 'tabular-nums',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
			}}
		>
			{paddedCelsiusDegree.map((digit, i) => (
				<Wheel
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					delay={i * 4}
					renderDigit={(_i) => 9 - _i}
					digits={[
						Number(paddedFahrenheitDegree[i]),
						Number(digit),
						Number(paddedFahrenheitDegree[i]),
					]}
					isNegative={[
						temperatureInFahrenheit < 0,
						temperatureInCelsius < 0,
						temperatureInFahrenheit < 0,
					]}
					isLeadingDigit={i === 0}
				/>
			))}
			<div style={{width: 8}} />
			°
			<Wheel
				delay={paddedCelsiusDegree.length * 4 - 2}
				digits={[0, 1, 0]}
				renderDigit={(_i) =>
					_i % 2 === 0 ? 'C' : <span style={{marginLeft: -5}}>F</span>
				}
				isLeadingDigit={false}
				isNegative={[false, false, false]}
			/>
		</div>
	);
};
