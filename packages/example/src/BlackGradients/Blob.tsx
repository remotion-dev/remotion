import React, {useState} from 'react';
import {random} from 'remotion';

export const SvgBlob: React.FC<{
	readonly style?: React.SVGProps<HTMLOrSVGElement>['style'];
	readonly gradient: [string, string];
	readonly d: string;
}> = ({style, gradient, d}) => {
	const [id] = useState(() => random(null));
	return (
		<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={style}>
			<defs>
				<linearGradient id={String(id)} gradientTransform="rotate(90)">
					<stop offset="5%" stopColor={gradient[0]} />
					<stop offset="95%" stopColor={gradient[1]} />
				</linearGradient>
			</defs>
			<path fill={`url(#${id})`} d={d} transform="translate(100 100)" />
		</svg>
	);
};
