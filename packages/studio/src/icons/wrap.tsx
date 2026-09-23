import type {SVGProps} from 'react';

export const WrapIcon: React.FC<
	SVGProps<SVGSVGElement> & {readonly color: string}
> = ({color, ...props}) => {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<rect
				fill="none"
				x="2.5"
				y="2.5"
				width="19"
				height="19"
				rx="2.5"
				stroke={color}
				strokeWidth="1.8"
			/>
			<rect
				fill="none"
				x="6.5"
				y="6.5"
				width="11"
				height="11"
				rx="1.5"
				stroke={color}
				strokeWidth="1.8"
			/>
		</svg>
	);
};
