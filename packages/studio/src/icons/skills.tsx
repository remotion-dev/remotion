import type {SVGProps} from 'react';

export const SkillsIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} fill="none" viewBox="0 0 16 16">
			<path
				d="M8 0.9 14.05 4.35v7.3L8 15.1 1.95 11.65v-7.3L8 0.9Z"
				stroke={color}
				strokeLinejoin="round"
				strokeWidth="1.1"
			/>
			<path
				d="m1.95 4.35 6.05 3.55 6.05-3.55M8 7.9v7.2M1.95 8 8 11.55 14.05 8"
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.1"
			/>
		</svg>
	);
};
