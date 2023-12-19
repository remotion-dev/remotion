import React, {useMemo} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';

const viewBox = 100;
const lines = 6;
const className = '__remotion_spinner_line';
const remotionSpinnerAnimation = '__remotion_spinner_animation';

// Generated from https://github.com/remotion-dev/template-next/commit/9282c93f7c51ada31a42e18a94680fa09a14eee3
const translated =
	'M 44 0 L 50 0 a 6 6 0 0 1 6 6 L 56 26 a 6 6 0 0 1 -6 6 L 50 32 a 6 6 0 0 1 -6 -6 L 44 6 a 6 6 0 0 1 6 -6 Z';

export const Spinner: React.FC<{
	size: number;
	duration: number;
}> = ({size, duration}) => {
	const style = useMemo(() => {
		return {
			width: size,
			height: size,
		};
	}, [size]);

	return (
		<>
			<style type="text/css">{`
				@keyframes ${remotionSpinnerAnimation} {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.15;
          }
        }
        
        .${className} {
            animation: ${remotionSpinnerAnimation} ${duration}s linear infinite;
        }        
			`}</style>
			<svg style={style} viewBox={`0 0 ${viewBox} ${viewBox}`}>
				{new Array(lines).fill(true).map((_, index) => {
					return (
						<path
							// eslint-disable-next-line react/no-array-index-key
							key={index}
							className={className}
							style={{
								rotate: `${(index * Math.PI * 2) / lines}rad`,
								transformOrigin: 'center center',
								animationDelay: `${index * (duration / lines) - duration}s`,
							}}
							d={translated}
							fill={LIGHT_TEXT}
						/>
					);
				})}
			</svg>
		</>
	);
};
