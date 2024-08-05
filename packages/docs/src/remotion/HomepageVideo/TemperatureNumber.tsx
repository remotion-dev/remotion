import React from 'react';
import {Wheel} from './DigitWheel';

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly num: number;
}> = ({theme, num}) => {
	const digits = String(num).split('');

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
			{digits.map((digit, i) => (
				<Wheel
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					delay={i * 4}
					renderDigit={(_i) => 9 - _i}
					digits={[Number(digit) - 1, Number(digit), Number(digit) + 1]}
				/>
			))}
			°
			<Wheel
				// eslint-disable-next-line react/no-array-index-key
				delay={digits.length * 4}
				digits={[1, 1, 0]}
				renderDigit={(_i) => (_i % 2 === 0 ? 'F' : 'C')}
			/>
		</div>
	);
};
