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
				<div
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					style={{
						position: 'relative',
						width: 40,
						display: 'inline-block',
						height: 90,
					}}
				>
					<Wheel
						delay={i * 4}
						digits={[Number(digit) - 1, Number(digit), Number(digit) + 1]}
					/>
				</div>
			))}
			°C
		</div>
	);
};
