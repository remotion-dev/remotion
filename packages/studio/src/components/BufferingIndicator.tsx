import React from 'react';

const className = '__remotion_buffering_indicator';
const remotionBufferingAnimation = '__remotion_buffering_animation';

export const BufferingIndicator: React.FC = () => {
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
			<svg
				viewBox="0 0 14 14"
				style={{width: 14, height: 14, overflow: 'visible'}}
				className={className}
			>
				<path
					d="M 7 0 A 7 7 0 0 1 11.1145 12.66312"
					stroke="white"
					strokeWidth={3}
				/>
			</svg>
		</>
	);
};
