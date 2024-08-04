import React from 'react';

const Digit: React.FC<{
	digit: string;
}> = ({digit}) => {
	return <span style={{display: 'inline-block'}}>{digit}</span>;
};

export const TemperatureNumber: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly num: number;
}> = ({theme, num}) => {
	const digits = String(num).split('');
	console.log(digits);

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
			{digits.map((digit, i) => (
				// eslint-disable-next-line react/no-array-index-key
				<Digit key={i} digit={digit} />
			))}
			°C
		</div>
	);
};
