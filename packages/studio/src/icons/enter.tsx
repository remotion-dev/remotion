import type {SVGProps} from 'react';

// Font Awesome Pro v7.3.1, Copyright 2026 Fonticons, Inc.
// https://fontawesome.com/license (Commercial License)
export const EnterIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
			<path
				fill={color}
				d="M544 144C544 135.2 551.2 128 560 128C568.8 128 576 135.2 576 144L576 240C576 293 533 336 480 336L118.6 336L235.3 452.7C241.5 458.9 241.5 469.1 235.3 475.3C229.1 481.5 218.9 481.5 212.7 475.3L68.7 331.3C65.7 328.3 64 324.2 64 320C64 315.8 65.7 311.7 68.7 308.7L212.7 164.7C218.9 158.5 229.1 158.5 235.3 164.7C241.5 170.9 241.5 181.1 235.3 187.3L118.6 304L480 304C515.3 304 544 275.3 544 240L544 144z"
			/>
		</svg>
	);
};
