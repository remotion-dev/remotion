import type {SVGProps} from 'react';

export const MotionBlurIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
			<circle
				cx={220}
				cy={320}
				fill="none"
				r={160}
				stroke={color}
				strokeWidth={28}
			/>
			<path
				d="M420 160a160 160 0 0 1 0 320"
				fill="none"
				stroke={color}
				strokeLinecap="round"
				strokeWidth={28}
			/>
		</svg>
	);
};
