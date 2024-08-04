import React from 'react';
import {Wheel} from './DigitWheel';

const Digit: React.FC<{
	digit: string;
	delay: number;
}> = ({digit, delay}) => {
	return (
		<div
			style={{
				position: 'relative',
				width: 40,
				display: 'inline-block',
				height: 70,
			}}
		>
			<Wheel delay={delay} digit={digit} topLayer={false} />
		</div>
	);
};

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
			}}
		>
			{digits.map((digit, i) => (
				// eslint-disable-next-line react/no-array-index-key
				<Digit key={i} delay={i * 4} digit={digit} />
			))}
			°C
		</div>
	);
};
