import type {SVGProps} from 'react';

export const FullscreenIcon = ({
	color,
	...props
}: SVGProps<SVGSVGElement> & {readonly color: string}) => {
	const size =
		typeof props.style?.height === 'number' ? props.style.height : 18;
	const inset = Math.floor(size / 8) + 0.5;
	const oppositeEdge = size - inset;
	const cornerLength = Math.floor(size / 4);

	return (
		<svg viewBox={`0 0 ${size} ${size}`} {...props}>
			<path
				fill="none"
				stroke={color}
				strokeWidth="1"
				strokeLinecap="round"
				strokeLinejoin="round"
				d={`M${inset + cornerLength} ${inset}H${inset}v${cornerLength}M${inset} ${oppositeEdge - cornerLength}v${cornerLength}h${cornerLength}M${oppositeEdge - cornerLength} ${inset}h${cornerLength}v${cornerLength}M${oppositeEdge} ${oppositeEdge - cornerLength}v${cornerLength}h${-cornerLength}`}
			/>
		</svg>
	);
};
