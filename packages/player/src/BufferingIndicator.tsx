import React from 'react';
import {ICON_SIZE} from './icons.js';

const className = '__remotion_buffering_indicator';
const remotionBufferingAnimation = '__remotion_buffering_animation';
export const bufferingIndicatorStrokeWidth = 3;

const playerStyle: React.CSSProperties = {
	width: ICON_SIZE,
	height: ICON_SIZE,
	overflow: 'hidden',
	lineHeight: 'normal',
	fontSize: 'inherit',
};

const studioStyle: React.CSSProperties = {
	width: 14,
	height: 14,
	overflow: 'hidden',
	lineHeight: 'normal',
	fontSize: 'inherit',
};

export const BufferingIndicator: React.FC<{
	readonly type: 'player' | 'studio';
}> = ({type}) => {
	const style: React.CSSProperties =
		type === 'player' ? playerStyle : studioStyle;
	return (
		<>
			<style type="text/css">{`
				@keyframes ${remotionBufferingAnimation} {
          0% {
            rotate: 0deg;
          }
          100% {
            rotate: 360deg;
          }
        }
        
        .${className} {
            animation: ${remotionBufferingAnimation} 1s linear infinite;
        }        
			`}</style>
			<div style={style}>
				<svg
					viewBox={type === 'player' ? '0 0 22 22' : '0 0 18 18'}
					style={style}
					className={className}
				>
					<path
						d={
							type === 'player'
								? 'M 11 4 A 7 7 0 0 1 15.1145 16.66312'
								: 'M 9 2 A 7 7 0 0 1 13.1145 14.66312'
						}
						stroke="white"
						strokeLinecap="round"
						fill="none"
						strokeWidth={3}
					/>
				</svg>
			</div>
		</>
	);
};
